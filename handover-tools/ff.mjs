import { createClient } from "/home/claude/site-src/node_modules/@libsql/client/lib-esm/node.js";
const db = createClient({ url: "file:/tmp/claude-0/data/app.db" });
const t=new Date(Date.now()-Number(process.argv[2])*1000).toISOString();
await db.execute({sql:`UPDATE "AfkState" SET lastBeat=?`,args:[t]});
console.log((await db.execute(`SELECT carry,seq,dayCoins FROM "AfkState"`)).rows);
