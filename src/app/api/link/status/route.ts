import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";

/**
 * Called by the Minecraft plugin (`/verify`, `/link`): is this UUID linked,
 * and to whom?
 *   GET ?uuid=...  +  Authorization: Bearer JN_LINK_API_KEY
 * Unknown uuid -> { linked: false } (200) — a plain "not verified yet".
 */
export async function GET(request: Request) {
  const ok = pluginAuthorised(request);
  if (ok === null) {
    return NextResponse.json({ error: "link api not configured" }, { status: 503 });
  }
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const uuid = new URL(request.url).searchParams.get("uuid")?.trim().toLowerCase() ?? "";
  if (!/^[0-9a-f-]{32,36}$/.test(uuid)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const link = await prisma.minecraftLink.findUnique({
    where: { uuid },
    include: { user: { select: { name: true } } },
  });
  if (!link?.uuid) return NextResponse.json({ linked: false });
  return NextResponse.json({
    linked: true,
    username: link.username,
    discord: link.user?.name ?? null,
  });
}
