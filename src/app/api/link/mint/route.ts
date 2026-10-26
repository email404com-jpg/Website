import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";
import { generateLinkCode, LINK_CODE_TTL_MS } from "@/lib/mc-link";
import { recordAudit } from "@/lib/audit";

/**
 * Called by the Minecraft plugin when a player runs bare `/link` in game.
 * Mints a 6-char, 10-minute code bound to that player's uuid; the player then
 * signs in on /link and redeems it there. One active code per uuid — minting
 * again rotates it. Refuses while the uuid is already linked.
 *   POST { uuid, username }  +  Authorization: Bearer JN_LINK_API_KEY
 */
export async function POST(request: Request) {
  const ok = pluginAuthorised(request);
  if (ok === null) {
    return NextResponse.json({ error: "link api not configured" }, { status: 503 });
  }
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { uuid?: unknown; username?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const uuid = typeof body.uuid === "string" ? body.uuid.trim().toLowerCase() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!/^[0-9a-f-]{32,36}$/.test(uuid) || !username) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const taken = await prisma.minecraftLink.findUnique({ where: { uuid } });
  if (taken) {
    return NextResponse.json({ error: "already linked" }, { status: 409 });
  }

  const expires = new Date(Date.now() + LINK_CODE_TTL_MS);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateLinkCode();
    try {
      const row = await prisma.mcLinkPending.upsert({
        where: { uuid },
        create: { uuid, username, code, codeExpires: expires },
        update: { username, code, codeExpires: expires },
      });
      await recordAudit({ kind: "verify_code_issued", source: "plugin", uuid, username });
      return NextResponse.json({ code: row.code, expiresAt: row.codeExpires?.toISOString() ?? null });
    } catch {
      /* code collision — retry with a new one */
    }
  }
  return NextResponse.json({ error: "could not mint code" }, { status: 500 });
}
