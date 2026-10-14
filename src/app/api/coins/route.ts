import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { coinsConfigured, fetchBalance } from "@/lib/coins-api";

/**
 * Coin balance for the signed-in user.
 *   JN_COINS_API_URL  e.g. http://host:port/api/v1/economy/<guild>/users/{discordId}/balance
 *   JN_COINS_API_KEY  sent as "Authorization: Bearer <key>"
 * On failure the JSON carries a `reason` (also logged server-side) so it can be diagnosed.
 */
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  if (!coinsConfigured()) return NextResponse.json({ state: "unconfigured" });

  const [account, link] = await Promise.all([
    prisma.account.findFirst({ where: { userId, provider: "discord" } }),
    prisma.minecraftLink.findUnique({ where: { userId } }),
  ]);
  const template = process.env.JN_COINS_API_URL ?? "";

  if (!account?.providerAccountId && template.includes("{discordId}")) {
    return NextResponse.json({ state: "error", reason: "no-discord-account" });
  }
  if (template.includes("{uuid}") && !link?.uuid) {
    return NextResponse.json({ state: "unlinked" });
  }

  const r = await fetchBalance(account?.providerAccountId ?? "", link?.uuid ?? "");
  return r.ok
    ? NextResponse.json({ state: "ok", coins: r.coins })
    : NextResponse.json({ state: "error", reason: r.reason });
}
