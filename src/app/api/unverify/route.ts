import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateLinkCode, LINK_CODE_TTL_MS } from "@/lib/mc-link";
import { recordAudit } from "@/lib/audit";

/**
 * Unverify (unlink) code for the signed-in user.
 *
 *   GET    — status: { state: "linked" | "pending" | "none" }
 *   POST   — issue a one-time code (10 min) that is redeemed in game with
 *            `/unverify <code>`. Only possible while actually linked.
 *
 * Mirrors /api/link. The code never leaves this session-authed surface.
 */

type UnverifyState =
  | { state: "signed-out" }
  | { state: "none" }
  | { state: "linked"; username: string | null; uuid: string | null }
  | { state: "pending"; code: string; expiresAt: string; username?: string | null }
  | { state: "error" };

async function currentUserId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

function view(
  link: {
    uuid: string | null;
    username: string | null;
    unverifyCode: string | null;
    unverifyCodeExpires: Date | null;
  } | null,
): UnverifyState {
  if (!link?.uuid) return { state: "none" }; // nothing to unverify
  if (
    link.unverifyCode &&
    link.unverifyCodeExpires &&
    link.unverifyCodeExpires.getTime() > Date.now()
  ) {
    return {
      state: "pending",
      code: link.unverifyCode,
      expiresAt: link.unverifyCodeExpires.toISOString(),
      username: link.username,
    };
  }
  return { state: "linked", username: link.username, uuid: link.uuid };
}

export async function GET(): Promise<NextResponse<UnverifyState>> {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  const link = await prisma.minecraftLink.findUnique({ where: { userId } });
  return NextResponse.json(view(link));
}

/** Issue the one-time /unverify code. */
export async function POST(): Promise<NextResponse<UnverifyState>> {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });

  const existing = await prisma.minecraftLink.findUnique({ where: { userId } });
  if (!existing?.uuid) return NextResponse.json({ state: "none" }, { status: 409 });

  const unverifyCodeExpires = new Date(Date.now() + LINK_CODE_TTL_MS);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const unverifyCode = generateLinkCode();
      const link = await prisma.minecraftLink.update({
        where: { id: existing.id },
        data: { unverifyCode, unverifyCodeExpires },
      });
      await recordAudit({ kind: "unverify_code_issued", source: "web", userId, uuid: link.uuid, username: link.username });
      return NextResponse.json(view(link));
    } catch {
      /* code collision — retry with a new one */
    }
  }
  return NextResponse.json({ state: "error" }, { status: 500 });
}
