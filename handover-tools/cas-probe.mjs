import { PrismaClient } from "/home/claude/site-src/node_modules/@prisma/client/default.js";
import { PrismaLibSql } from "/home/claude/site-src/node_modules/@prisma/adapter-libsql/dist/index-node.mjs";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:/tmp/claude-0/data/app.db" }) });
const row = await prisma.afkState.findUnique({ where: { userId: "u1" } });
console.log("row", row);
const r = await prisma.afkState.updateMany({ where: { userId: "u1", lastBeat: row.lastBeat }, data: { carry: 7 } });
console.log("cas count", r.count);
await prisma.$disconnect();
