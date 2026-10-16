import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";
import { recordLinkEvent } from "@/lib/link-history";

/**
 * Called by the Minecraft server (plugin) when a player runs
 * `/unverify <code>` — the code was issued by `POST /api/unverify`.
 *   POST { code, uuid, username }  +  Authorization: Bearer JN_LINK_API_KEY
 *
 * Deletes the link row, exactly like the site's own "Unlink account"
 * button does. The code is only accepted for the account it was issued to.
 */
export async function POST(request: Request) {
  const ok = pluginAuthorised(request);
  if (ok === null) {
    return NextResponse.json({ error: "link api not configured" }, { status: 503 });
  }
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { code?: unknown; uuid?: unknown; username?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const uuid = typeof body.uuid === "string" ? body.uuid.trim().toLowerCase() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!/^[A-Z0-9]{6}$/.test(code) || !/^[0-9a-f-]{32,36}$/.test(uuid) || !username) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const link = await prisma.minecraftLink.findUnique({ where: { unverifyCode: code } });
  if (!link || !link.unverifyCodeExpires || link.unverifyCodeExpires.getTime() < Date.now()) {
    return NextResponse.json({ error: "code invalid or expired" }, { status: 404 });
  }
  // The code belongs to one linked account; refuse anyone else outright
  // rather than letting a stranger unlink a stranger's account.
  if (!link.uuid || link.uuid !== uuid) {
    return NextResponse.json({ error: "code does not match this account" }, { status: 403 });
  }

  await Promise.all([
    // Writes the LinkEvent row and mirrors it into the secret AuditEvent
    // ledger (kind "unverify", source "plugin", with a generated refId).
    recordLinkEvent({
      userId: link.userId,
      uuid: link.uuid,
      username: link.username,
      event: "unlinked",
      source: "plugin",
    }),
    prisma.minecraftLink.deleteMany({ where: { id: link.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
