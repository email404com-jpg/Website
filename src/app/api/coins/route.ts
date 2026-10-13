import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


/**
 * Coin balance for the signed-in user, read from the coins API.
 *
 * Configure with:
 *   JN_COINS_API_URL  e.g. https://api.example.com/coins?discord={discordId}&uuid={uuid}
 *                     ({discordId} and {uuid} are substituted and URL-encoded)
 *   JN_COINS_API_KEY  optional, sent as "Authorization: Bearer <key>"
 *
 * Expected response: JSON with a number at `coins`, `balance`, `amount`,
 * `data.coins` or `data.balance`. Nothing is estimated when the API is unavailable.
 *
 * Response shape (always JSON):
 *   { state: "ok", coins: number }
 *   { state: "signed-out" }
 *   { state: "unconfigured" }
 *   { state: "unlinked" }
 *   { state: "error", reason: string, raw?: unknown }
 */
/**
 * Tiny in-memory cache so fast client polling (15s + event-driven refreshes)
 * never exceeds the coins API token limit (120 reads/min) no matter how many
 * tabs are open. Balances are at most this stale.
 */
const CACHE_TTL_MS = 5_000;
const balanceCache = new Map<string, { at: number; body: unknown }>();

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "signed-out" }, { status: 401 });

  const cached = balanceCache.get(userId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.body);
  }

  const template = process.env.JN_COINS_API_URL;
  if (!template) return NextResponse.json({ state: "unconfigured" });

  const [account, link] = await Promise.all([
    prisma.account.findFirst({ where: { userId, provider: "discord" } }),
    prisma.minecraftLink.findUnique({ where: { userId } }),
  ]);

  if (template.includes("{uuid}") && !link?.uuid) {
    return NextResponse.json({ state: "unlinked" });
  }

  const url = template
    .replaceAll("{discordId}", encodeURIComponent(account?.providerAccountId ?? ""))
    .replaceAll("{uuid}", encodeURIComponent(link?.uuid ?? ""));

  try {
    const headers: Record<string, string> = { accept: "application/json" };
    if (process.env.JN_COINS_API_KEY) {
      headers.authorization = `Bearer ${process.env.JN_COINS_API_KEY}`;
    }
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json({
        state: "error",
        reason: `api-http-${res.status}`,
      });
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json({
        state: "error",
        reason: "api-not-json",
      });
    }

    const obj = data as Record<string, unknown> & {
      data?: Record<string, unknown>;
    };

    // Search for balance field up to depth 4
    function findBalance(val: unknown, depth = 0): number | null {
      if (depth > 4) return null;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      if (typeof val === "string" && val.trim() !== "") {
        const n = Number(val);
        if (Number.isFinite(n)) return n;
      }
      if (val && typeof val === "object") {
        for (const key of ["coins", "balance", "amount", "points", "value"]) {
          if (key in val) {
            const found = findBalance((val as Record<string, unknown>)[key], depth + 1);
            if (found !== null) return found;
          }
        }
        // Recurse into nested objects
        for (const v of Object.values(val as Record<string, unknown>)) {
          const found = findBalance(v, depth + 1);
          if (found !== null) return found;
        }
      }
      return null;
    }

    const value = findBalance(obj);
    if (value === null) {
      const body = {
        state: "error",
        reason: "no-balance-field",
        raw: obj,
      };
      balanceCache.set(userId, { at: Date.now(), body });
      return NextResponse.json(body);
    }

    const body = { state: "ok", coins: value };
    balanceCache.set(userId, { at: Date.now(), body });
    return NextResponse.json(body);
  } catch (e) {
    console.error("[coins] fetch failed:", e);
    const body = {
      state: "error",
      reason: "api-unreachable",
    };
    balanceCache.set(userId, { at: Date.now() - (CACHE_TTL_MS - 2_000), body });
    return NextResponse.json(body);
  }
}
