import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";
import { fetchBalance } from "@/lib/coins-api";

/**
 * Called by the Minecraft plugin (DeluxeHub scoreboard / `/coins`):
 * the linked account's coin balance, fetched through this server's own
 * coins pipeline (localhost-first, discovery, 2s cache) so the bot key
 * never leaves the website.
 *   GET ?uuid=...  +  Authorization: Bearer JN_LINK_API_KEY
 * coins is null when unlinked or when the economy API is unreachable.
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

  const link = await prisma.minecraftLink.findUnique({ where: { uuid } });
  if (!link?.uuid) return NextResponse.json({ linked: false, coins: null });

  const account = await prisma.account.findFirst({
    where: { userId: link.userId, provider: "discord" },
  });
  if (!account?.providerAccountId) {
    return NextResponse.json({ linked: true, username: link.username, coins: null, reason: "no-discord-account" });
  }
  const r = await fetchBalance(account.providerAccountId);
  return NextResponse.json(
    r.ok
      ? { linked: true, username: link.username, coins: r.coins }
      : { linked: true, username: link.username, coins: null, reason: r.reason },
  );
}
