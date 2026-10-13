import { NextResponse } from "next/server";

type RawPlayers =
  | { online?: number; max?: number }
  | string
  | number
  | undefined;

type Raw = {
  online?: boolean;
  players?: RawPlayers;
  version?: string;
};

type Players = { online: number; max?: number };

function parsePlayers(players: RawPlayers): Players | undefined {
  if (typeof players === "number" && Number.isFinite(players)) {
    return { online: players };
  }

  if (typeof players === "string") {
    const match = players.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return { online: Number(match[1]), max: Number(match[2]) };
    }
    const single = players.match(/^(\d+)$/);
    if (single) return { online: Number(single[1]) };
    return undefined;
  }

  if (players && typeof players === "object") {
    const online = players.online;
    if (typeof online === "number" && Number.isFinite(online)) {
      const max = players.max;
      return {
        online,
        max:
          typeof max === "number" && Number.isFinite(max) ? max : undefined,
      };
    }
  }

  return undefined;
}

export async function GET() {
  const url =
    process.env.JN_MINECRAFT_STATUS_URL ||
    process.env.MINECRAFT_STATUS_URL;

  if (!url) {
    return NextResponse.json({ state: "unconfigured" });
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ state: "error" });
    }

    const data = (await res.json()) as Raw;
    const players = parsePlayers(data.players);

    return NextResponse.json({
      state: "ok",
      online: Boolean(data.online),
      players,
      version: typeof data.version === "string" ? data.version : undefined,
    });
  } catch {
    return NextResponse.json({ state: "error" });
  }
}
