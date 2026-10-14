import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adjustCoins, coinsConfigured } from "@/lib/coins-api";

/**
 * AFK earning. The page sends a heartbeat every ~30s while it is open and visible.
 * All timing is decided here: the client only reports "I'm here" and cannot choose
 * how much to earn.
 *   JN_AFK_RATE       coins per minute (default 2)
 *   JN_AFK_DAILY_CAP  max coins per UTC day (default 1440)
 */
const RATE = Math.max(1, Number(process.env.JN_AFK_RATE) || 2);
const CAP = Math.max(RATE, Number(process.env.JN_AFK_DAILY_CAP) || 1440);
const MIN_GAP = 20; // seconds: faster beats are ignored
const MAX_GAP = 90; // seconds: a longer silence restarts the minute
const MAX_CREDIT_PER_BEAT = 45;

const today = () => new Date().toISOString().slice(0, 10);

async function ctx() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const account = await prisma.account.findFirst({ where: { userId, provider: "discord" } });
  if (!account?.providerAccountId) return null;
  return { userId, discordId: account.providerAccountId };
}

function snapshot(row: { carry: number; day: string; dayCoins: number } | null) {
  const dayCoins = row && row.day === today() ? row.dayCoins : 0;
  return { rate: RATE, cap: CAP, dayCoins, carry: row?.carry ?? 0 };
}

export async function GET() {
  const c = await ctx();
  if (!c) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  const row = await prisma.afkState.findUnique({ where: { userId: c.userId } });
  return NextResponse.json({ state: coinsConfigured() ? "idle" : "unconfigured", ...snapshot(row) });
}

/** Stop: release the tab lock so another tab can start immediately. */
export async function DELETE() {
  const c = await ctx();
  if (!c) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  await prisma.afkState.updateMany({ where: { userId: c.userId }, data: { lastBeat: new Date(0) } });
  return NextResponse.json({ state: "idle" });
}

export async function POST(req: Request) {
  const c = await ctx();
  if (!c) return NextResponse.json({ state: "signed-out" }, { status: 401 });
  if (!coinsConfigured()) return NextResponse.json({ state: "unconfigured" });

  let tabId = "";
  try {
    const b = (await req.json()) as { tabId?: unknown };
    if (typeof b.tabId === "string") tabId = b.tabId.slice(0, 64);
  } catch {
    /* fallthrough */
  }
  if (!tabId) return NextResponse.json({ state: "error", reason: "bad-request" }, { status: 400 });

  const now = new Date();
  const row = await prisma.afkState.findUnique({ where: { userId: c.userId } });

  if (!row) {
    try {
      const created = await prisma.afkState.create({
        data: { userId: c.userId, tabId, lastBeat: now, day: today() },
      });
      return NextResponse.json({ state: "running", ...snapshot(created) });
    } catch {
      return NextResponse.json({ state: "running", ...snapshot(null) });
    }
  }

  const gap = (now.getTime() - row.lastBeat.getTime()) / 1000;
  const sameTab = row.tabId === tabId;

  if (!sameTab && gap < MAX_GAP) {
    return NextResponse.json({ state: "other-tab", ...snapshot(row) });
  }
  if (sameTab && gap < MIN_GAP) {
    return NextResponse.json({ state: "running", ...snapshot(row) });
  }

  const day = today();
  let dayCoins = row.day === day ? row.dayCoins : 0;
  let carry = row.carry;
  if (sameTab && gap <= MAX_GAP) carry += Math.min(Math.floor(gap), MAX_CREDIT_PER_BEAT);

  if (dayCoins >= CAP) {
    await prisma.afkState.updateMany({
      where: { userId: c.userId, lastBeat: row.lastBeat },
      data: { tabId, lastBeat: now, carry: 0, day, dayCoins },
    });
    return NextResponse.json({ state: "capped", ...snapshot({ carry: 0, day, dayCoins }) });
  }

  const minutes = Math.floor(carry / 60);
  let award = Math.min(minutes * RATE, CAP - dayCoins);
  award -= award % RATE;
  let seq = row.seq;
  let failed: string | null = null;

  if (award > 0) {
    const key = `afk:${c.userId}:${row.seq + 1}`;
    const r = await adjustCoins(c.discordId, award, "AFK earning", key);
    if (r.ok) {
      seq = row.seq + 1;
      carry -= minutes * 60;
      dayCoins += award;
    } else {
      failed = r.reason;
      award = 0;
    }
  }

  // compare-and-set so two simultaneous beats cannot both claim the same minutes
  const upd = await prisma.afkState.updateMany({
    where: { userId: c.userId, lastBeat: row.lastBeat },
    data: { tabId, lastBeat: now, carry, seq, day, dayCoins },
  });
  if (upd.count === 0) return NextResponse.json({ state: "running", ...snapshot(row) });

  return NextResponse.json({
    state: failed ? "error" : "running",
    reason: failed ?? undefined,
    awarded: award,
    ...snapshot({ carry, day, dayCoins }),
  });
}
