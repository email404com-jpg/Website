import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RATE = Number(process.env.JN_AFK_RATE ?? 2);
const DAILY_CAP = Number(process.env.JN_AFK_DAILY_CAP ?? 1440);
const MIN_BEAT_MS = 20_000;
const MAX_BEAT_MS = 90_000;
const MAX_CREDIT_MS = 45_000;

function nowMs() {
  return Date.now();
}

function utcDayStart(ms: number) {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

async function adjustCoins(
  discordId: string,
  amount: number,
  idempotencyKey: string
) {
  const url = process.env.JN_COINS_ADJUST_URL
    ? process.env.JN_COINS_ADJUST_URL
    : process.env.JN_COINS_API_URL?.replace("/balance", "/adjust");
  if (!url || !process.env.JN_COINS_API_KEY) {
    throw new Error("coins api not configured");
  }
  const res = await fetch(url.replace("{discordId}", discordId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.JN_COINS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, reason: "afk", idempotency_key: idempotencyKey }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`adjust ${res.status}: ${text}`);
  }
  return res.json();
}

async function getDiscordId(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "discord" },
    select: { providerAccountId: true },
  });
  return account?.providerAccountId ?? null;
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "unauthorized" }, { status: 401 });

  const afk = await prisma.afkState.findUnique({ where: { userId } });
  if (!afk) return NextResponse.json({ state: "idle" });

  const discordId = await getDiscordId(userId);
  if (!discordId) return NextResponse.json({ state: "no-discord" }, { status: 400 });

  const carryMs = Number(afk.carry ?? 0);
  return NextResponse.json({
    state: "running",
    sessionEarned: carryMs ? Math.floor(carryMs / 60000) * RATE : 0,
    todayEarned: afk.dayCoins,
    cap: DAILY_CAP,
    rate: RATE,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "unauthorized" }, { status: 401 });

  const { tabId } = (await req.json().catch(() => ({}))) as { tabId?: string };
  if (!tabId) return NextResponse.json({ state: "bad-request" }, { status: 400 });

  const discordId = await getDiscordId(userId);
  if (!discordId) return NextResponse.json({ state: "no-discord" }, { status: 400 });

  const now = nowMs();
  const dayStart = utcDayStart(now);

  const existing = await prisma.afkState.findUnique({ where: { userId } });

  if (existing) {
    const lastBeatMs = existing.lastBeat.getTime();
    if (existing.tabId !== tabId) {
      if (now - lastBeatMs < MAX_BEAT_MS) {
        return NextResponse.json({ state: "other-tab" }, { status: 409 });
      }
    } else {
      if (now - lastBeatMs < MIN_BEAT_MS) {
        return NextResponse.json({ state: "too-fast" }, { status: 429 });
      }
    }
    if (now - lastBeatMs > MAX_BEAT_MS) {
      await prisma.afkState.update({
        where: { userId },
        data: {
          tabId,
          lastBeat: new Date(now),
          carry: 0,
          seq: existing.seq + 1,
          day: dayStart,
          dayCoins: dayStart === existing.day ? existing.dayCoins : 0,
        },
      });
      return NextResponse.json({ state: "restarted" });
    }
  }

  const dayCoins = existing?.day === dayStart ? existing.dayCoins : 0;
  if (dayCoins >= DAILY_CAP) {
    return NextResponse.json({ state: "capped", todayEarned: dayCoins, cap: DAILY_CAP });
  }

  const carry = (existing?.carry ?? 0) + Math.min(now - (existing?.lastBeat.getTime() ?? now), MAX_CREDIT_MS);
  const fullMinutes = Math.floor(carry / 60_000);
  const newCarry = carry % 60_000;
  const coinsToAdd = fullMinutes * RATE;
  const finalCoins = Math.min(coinsToAdd, DAILY_CAP - dayCoins);

  if (finalCoins > 0) {
    const idempotencyKey = `afk:${userId}:${(existing?.seq ?? 0) + 1}`;
    await adjustCoins(discordId, finalCoins, idempotencyKey);
  }

  await prisma.afkState.upsert({
    where: { userId },
    create: {
      userId,
      tabId,
      lastBeat: new Date(now),
      carry: newCarry,
      seq: (existing?.seq ?? 0) + 1,
      day: dayStart,
      dayCoins: dayCoins + finalCoins,
    },
    update: {
      tabId,
      lastBeat: new Date(now),
      carry: newCarry,
      seq: (existing?.seq ?? 0) + 1,
      day: dayStart,
      dayCoins: dayCoins + finalCoins,
    },
  });

  return NextResponse.json({
    state: "ok",
    added: finalCoins,
    sessionEarned: dayCoins + finalCoins,
    todayEarned: dayCoins + finalCoins,
    cap: DAILY_CAP,
  });
}

export async function DELETE() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ state: "unauthorized" }, { status: 401 });

  await prisma.afkState.delete({ where: { userId } }).catch(() => {});
  return NextResponse.json({ state: "stopped" });
}