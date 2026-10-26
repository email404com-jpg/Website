import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recordLinkEvent } from "@/lib/link-history";

/**
 * Redeem a game-minted /link code (minted by POST /api/link/mint when a
 * player runs bare `/link` in game). Session-authed: the code binds its
 * Minecraft uuid to the signed-in Discord user.
 *   POST { code }
 * While already linked this always fails — unlink first (/unverify) to use
 * a new code.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const existing = await prisma.minecraftLink.findUnique({ where: { userId } });
  if (existing?.uuid) {
    return NextResponse.json({ state: "linked", username: existing.username }, { status: 409 });
  }

  const pending = await prisma.mcLinkPending.findUnique({ where: { code } });
  if (!pending || !pending.codeExpires || pending.codeExpires.getTime() < Date.now()) {
    return NextResponse.json({ error: "code invalid or expired" }, { status: 404 });
  }

  const taken = await prisma.minecraftLink.findUnique({ where: { uuid: pending.uuid } });
  if (taken) {
    if (taken.userId !== userId) {
      await recordLinkEvent({
        userId: taken.userId,
        uuid: pending.uuid,
        username: pending.username,
        event: "link_refused",
        source: "web",
      });
      return NextResponse.json({ error: "account already linked" }, { status: 409 });
    }
    // Same user, stale uuid-less row — fall through and overwrite it.
  }

  await prisma.minecraftLink.upsert({
    where: { userId },
    create: {
      userId,
      uuid: pending.uuid,
      username: pending.username,
      linkedAt: new Date(),
    },
    update: {
      uuid: pending.uuid,
      username: pending.username,
      linkedAt: new Date(),
      code: null,
      codeExpires: null,
      unverifyCode: null,
      unverifyCodeExpires: null,
    },
  });
  await prisma.mcLinkPending.deleteMany({ where: { code } });
  await recordLinkEvent({
    userId,
    uuid: pending.uuid,
    username: pending.username,
    event: "linked",
    source: "web",
  });
  return NextResponse.json({ state: "linked", username: pending.username, uuid: pending.uuid });
}
