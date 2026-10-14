import { createClient } from "/home/claude/site-src/node_modules/@libsql/client/lib-esm/node.js";
const db = createClient({ url: "file:/tmp/claude-0/data/app.db" });
console.log((await db.execute(`SELECT lastBeat, typeof(lastBeat) t FROM "AfkState"`)).rows);
