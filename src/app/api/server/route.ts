import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// The JackLink proxy reports every ~30s; four missed intervals means the proxy
// stopped reporting, so we stop claiming it is online.
const PLUGIN_REPORT_STALE_MS = 120_000;

type PluginPayload = {
  online?: boolean;
  players?: { online?: number; max?: number };
  version?: string;
  servers?: { name: string; online: number }[];
};

export async function GET() {
  // 1. Fresh proxy-reported status from the JackLink plugin (authoritative).
  const row = await prisma.serverStatus
    .findUnique({ where: { id: "latest" } })
    .catch(() => null);
  const ageMs = row ? Date.now() - row.updatedAt.getTime() : null;

  if (row && ageMs !== null && ageMs <= PLUGIN_REPORT_STALE_MS) {
    try {
      const payload = JSON.parse(row.payload) as PluginPayload;
      return NextResponse.json({
        state: "ok",
        source: "plugin",
        ageSeconds: Math.round(ageMs / 1000),
        online: payload.online !== false,
        players: payload.players,
        version: payload.version,
        servers: payload.servers,
      });
    } catch {
      /* corrupt snapshot — fall through to the external fallback */
    }
  }

  const url =
    process.env.JN_MINECRAFT_STATUS_URL ||
    process.env.MINECRAFT_STATUS_URL;

  if (url) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = (await res.json()) as Raw;
        const players = parsePlayers(data.players);
        return NextResponse.json({
          state: "ok",
          source: "external",
          online: Boolean(data.online),
          players,
          version: typeof data.version === "string" ? data.version : undefined,
        });
      }
    } catch {
      /* fall through to the stale-plugin / unconfigured answers below */
    }
  }

  // 2. The proxy has reported before but went quiet -> honest offline.
  if (row) {
    return NextResponse.json({
      state: "ok",
      source: "plugin",
      online: false,
      stale: true,
      ageSeconds: ageMs === null ? undefined : Math.round(ageMs / 1000),
    });
  }

  // 3. Nothing to report from.
  return NextResponse.json({ state: url ? "error" : "unconfigured" });
}
