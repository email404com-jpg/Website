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
    "unverifyCode" TEXT,
    "unverifyCodeExpires" TEXT,
    "linkedAt" TEXT,
    CONSTRAINT "MinecraftLink_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_userId_key" ON "MinecraftLink"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_uuid_key" ON "MinecraftLink"("uuid")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_code_key" ON "MinecraftLink"("code")`,

  `CREATE TABLE IF NOT EXISTS "LinkEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "uuid" TEXT,
    "username" TEXT,
    "event" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "LinkEvent_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "LinkEvent_userId_createdAt_idx" ON "LinkEvent"("userId", "createdAt")`,

  // Secret audit ledger: one row per verify / unverify / purchase, each with
  // a generated refId. Never read back by any route — see src/lib/audit.ts.
  `CREATE TABLE IF NOT EXISTS "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "userId" TEXT,
    "uuid" TEXT,
    "username" TEXT,
    "meta" TEXT,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AuditEvent_refId_key" ON "AuditEvent"("refId")`,
  `CREATE INDEX IF NOT EXISTS "AuditEvent_userId_createdAt_idx" ON "AuditEvent"("userId", "createdAt")`,

  `CREATE TABLE IF NOT EXISTS "AfkState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "lastBeat" TEXT NOT NULL,
    "carry" INTEGER NOT NULL DEFAULT 0,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "day" TEXT NOT NULL,
    "dayCoins" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
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

  // Latest proxy status snapshot reported by the JackLink Velocity plugin.
  `CREATE TABLE IF NOT EXISTS "ServerStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
  )`,
];

/**
 * CREATE TABLE IF NOT EXISTS never adds a column to a table that already
 * exists, so every new column also needs this guarded ALTER. Check
 * PRAGMA table_info first: SQLite rejects a duplicate column.
 */
const ALTERS = [
  { table: "AfkState", column: "version", ddl: `ALTER TABLE "AfkState" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0` },
  { table: "MinecraftLink", column: "unverifyCode", ddl: `ALTER TABLE "MinecraftLink" ADD COLUMN "unverifyCode" TEXT` },
  { table: "MinecraftLink", column: "unverifyCodeExpires", ddl: `ALTER TABLE "MinecraftLink" ADD COLUMN "unverifyCodeExpires" TEXT` },
];

/**
 * An index on a column added by ALTER has to be created after the ALTER —
 * SQLite cannot CREATE INDEX against a column that does not exist yet, and
 * that would abort the whole STATEMENTS batch on an existing database.
 */
const POST_ALTERS = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "MinecraftLink_unverifyCode_key" ON "MinecraftLink"("unverifyCode")`,
];

async function applyAlters(db) {
  for (const { table, column, ddl } of ALTERS) {
    const info = await db.execute({ sql: `PRAGMA table_info("${table}")`, args: [] });
    const cols = info.rows.map((r) => String(r.name));
    if (cols.length && !cols.includes(column)) {
      await db.execute({ sql: ddl, args: [] });
      console.log(`[init-db] altered: ${table} +${column}`);
    }
  }
}

async function main() {
  const file = dbFilePath();
  mkdirSync(dirname(file), { recursive: true });

  const db = createClient({ url: `file:${file}` });
  try {
    await db.batch(STATEMENTS.map((sql) => ({ sql, args: [] })));
    await applyAlters(db);
    await db.batch(POST_ALTERS.map((sql) => ({ sql, args: [] })));
    const tables = await db.execute(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('User','Account','Session','VerificationToken','MinecraftLink','LinkEvent','AuditEvent','AfkState','ServerStatus') ORDER BY name`,
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
