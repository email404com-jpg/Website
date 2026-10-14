/**
 * init-db.mjs — create the SQLite file, its folder, and the Auth.js tables.
 *
 * The Pterodactyl console cannot run shell commands such as `prisma db push`,
 * and `prisma generate` does not create tables, so this script runs on every
 * `npm run build` and `npm start`. It is idempotent: everything uses
 * IF NOT EXISTS, so re-running against an existing database is a no-op.
 *
 * Tables match prisma/schema.prisma (Auth.js v5 + @auth/prisma-adapter).
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@libsql/client";

function dbFilePath() {
  const raw =
    process.env.JN_DATABASE_URL || "file:/home/container/data/app.db";
  const withoutScheme = raw.startsWith("file:")
    ? raw.slice("file:".length)
    : raw;
  const withoutParams = withoutScheme.split("?")[0];
  return resolve(withoutParams || "/home/container/data/app.db");
}

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TEXT,
    "image" TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

  `CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
    ON "Account"("provider", "providerAccountId")`,

  `CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key"
    ON "Session"("sessionToken")`,

  `CREATE TABLE IF NOT EXISTS "MinecraftLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "uuid" TEXT,
    "username" TEXT,
    "code" TEXT,
    "codeExpires" TEXT,
    "linkedAt" TEXT,
    CONSTRAINT "MinecraftLink_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_userId_key" ON "MinecraftLink"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_uuid_key" ON "MinecraftLink"("uuid")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_code_key" ON "MinecraftLink"("code")`,

  `CREATE TABLE IF NOT EXISTS "AfkState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "lastBeat" TEXT NOT NULL,
    "carry" INTEGER NOT NULL DEFAULT 0,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "day" TEXT NOT NULL,
    "dayCoins" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AfkState_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AfkState_userId_key" ON "AfkState"("userId")`,

  `CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key"
    ON "VerificationToken"("identifier", "token")`,
];

async function main() {
  const file = dbFilePath();
  mkdirSync(dirname(file), { recursive: true });

  const db = createClient({ url: `file:${file}` });
  try {
    await db.batch(STATEMENTS.map((sql) => ({ sql, args: [] })));
    const tables = await db.execute(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('User','Account','Session','VerificationToken','MinecraftLink','AfkState') ORDER BY name`,
    );
    console.log(
      `[init-db] ready: ${file} (tables: ${tables.rows.map((r) => r.name).join(", ")})`,
    );
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error("[init-db] FAILED:", error?.message || error);
  process.exit(1);
});
