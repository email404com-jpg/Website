import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";


function authorised(request: Request) {
  const key = process.env.JN_LINK_API_KEY;
  if (!key) return null; // not configured
  const header = request.headers.get("authorization") ?? "";
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Called by the Minecraft server (plugin) when a player runs `/link <code>`.
 *   POST { code, uuid, username }  +  Authorization: Bearer JN_LINK_API_KEY
 */
export async function POST(request: Request) {
  const ok = authorised(request);
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

  const link = await prisma.minecraftLink.findUnique({ where: { code } });
  if (!link || !link.codeExpires || link.codeExpires.getTime() < Date.now()) {
    return NextResponse.json({ error: "code invalid or expired" }, { status: 404 });
  }

  const taken = await prisma.minecraftLink.findUnique({ where: { uuid } });
  if (taken && taken.id !== link.id) {
    return NextResponse.json({ error: "account already linked" }, { status: 409 });
  }

  await prisma.minecraftLink.update({
    where: { id: link.id },
    data: { uuid, username, code: null, codeExpires: null, linkedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
