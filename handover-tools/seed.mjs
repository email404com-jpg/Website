import { createClient } from "/home/claude/site-src/node_modules/@libsql/client/lib-esm/node.js";
const db = createClient({ url: "file:/tmp/claude-0/data/app.db" });
const exp = new Date(Date.now()+864e5*30).toISOString();
await db.batch([
 {sql:`DELETE FROM "MinecraftLink"`,args:[]},{sql:`DELETE FROM "Session"`,args:[]},{sql:`DELETE FROM "Account"`,args:[]},{sql:`DELETE FROM "User"`,args:[]},
 {sql:`INSERT INTO "User"(id,name,email,image) VALUES ('u1','JackNW','j@example.com','http://store.localhost:3100/icon.png')`,args:[]},
 {sql:`INSERT INTO "Account"(id,userId,type,provider,providerAccountId) VALUES ('a1','u1','oauth','discord','123456789012345678')`,args:[]},
 {sql:`INSERT INTO "Session"(id,sessionToken,userId,expires) VALUES ('s1','test-session-token','u1','${exp}')`,args:[]},
]);
console.log("seeded");
