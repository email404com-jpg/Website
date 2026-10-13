import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateLinkCode, LINK_CODE_TTL_MS } from "@/lib/mc-link";


async function currentUserId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

function view(link: {
  uuid: string | null;
  username: string | null;
  code: string | null;
  codeExpires: Date | null;
} | null) {
  if (!link) return { state: "none" as const };
  if (link.uuid) {
    return { state: "linked" as const, username: link.username, uuid: link.uuid };
  }
  if (link.code && link.codeExpires && link.codeExpires.getTime() > Date.now()) {
    return {
      state: "pending" as const,
      code: link.code,
      expiresAt: link.codeExpires.toISOString(),
    };
  }
  return { state: "none" as const };
}

/** Current link status for the signed-in user. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  const link = await prisma.minecraftLink.findUnique({ where: { userId } });
  return NextResponse.json(view(link));
}

/** Start linking: issue a short-lived code to confirm in game. */
export async function POST() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });

  const existing = await prisma.minecraftLink.findUnique({ where: { userId } });
  if (existing?.uuid) return NextResponse.json(view(existing));

  const codeExpires = new Date(Date.now() + LINK_CODE_TTL_MS);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const code = generateLinkCode();
      const link = await prisma.minecraftLink.upsert({
        where: { userId },
        create: { userId, code, codeExpires },
        update: { code, codeExpires },
      });
      return NextResponse.json(view(link));
    } catch {
      /* code collision — retry with a new one */
    }
  }
  return NextResponse.json({ state: "error" }, { status: 500 });
}

/** Unlink the Minecraft account. */
export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  await prisma.minecraftLink.deleteMany({ where: { userId } });
  return NextResponse.json({ state: "none" });
}
