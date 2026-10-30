import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";

/**
 * Discord-side link lookup for the CrowniX Discord bot (`.linkinfo @user`):
 * has this Discord account linked a Minecraft account on the site?
 *   GET ?discord=<snowflake>  +  Authorization: Bearer JN_LINK_API_KEY
 * Unknown discord id -> { linked: false, registered: false } (200).
 * Signed in on the site but no Minecraft link -> { linked: false, registered: true },
 * so the bot can tell "never signed in" apart from "not linked yet".
 */
export async function GET(request: Request) {
  const ok = pluginAuthorised(request);
  if (ok === null) {
    return NextResponse.json({ error: "link api not configured" }, { status: 503 });
  }
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const discordId = new URL(request.url).searchParams.get("discord")?.trim() ?? "";
  if (!/^\d{17,20}$/.test(discordId)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const account = await prisma.account.findFirst({
    where: { provider: "discord", providerAccountId: discordId },
    select: { userId: true },
  });
  if (!account) return NextResponse.json({ linked: false, registered: false });

  const link = await prisma.minecraftLink.findUnique({
    where: { userId: account.userId },
    select: { uuid: true, username: true, linkedAt: true },
  });
  if (!link?.uuid) return NextResponse.json({ linked: false, registered: true });

  return NextResponse.json({
    linked: true,
    registered: true,
    username: link.username,
    uuid: link.uuid,
    linkedAt: link.linkedAt?.toISOString() ?? null,
  });
}
