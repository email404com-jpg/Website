import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";

/**
 * Called periodically by the JackLink Velocity plugin with a live snapshot of
 * the proxy: player counts, registered backend servers and proxy version.
 *   POST { online, players:{online,max?}, version, servers:[{name,online}] }
 *        + Authorization: Bearer JN_LINK_API_KEY
 * Stored as a single "latest" row and served by GET /api/server.
 */
type Server = { name: string; online: number };

export async function POST(request: Request) {
  const ok = pluginAuthorised(request);
  if (ok === null) {
    return NextResponse.json({ error: "server status api not configured" }, { status: 503 });
  }
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const playersRaw = (body.players ?? {}) as { online?: unknown; max?: unknown };
  const playerCount =
    typeof body.players === "object" && Number.isFinite(Number(playersRaw.online))
      ? Number(playersRaw.online)
      : undefined;
  if (playerCount === undefined || playerCount < 0) {
    return NextResponse.json({ error: "players.online required" }, { status: 400 });
  }

  const max =
    Number.isFinite(Number(playersRaw.max)) && Number(playersRaw.max) >= 0
      ? Number(playersRaw.max)
      : undefined;
  const version =
    typeof body.version === "string" && body.version.trim()
      ? body.version.trim().slice(0, 64)
      : undefined;

  const servers: Server[] = [];
  if (Array.isArray(body.servers)) {
    for (const entry of body.servers.slice(0, 32)) {
      const e = entry as { name?: unknown; online?: unknown };
      const name = typeof e?.name === "string" ? e.name.trim().slice(0, 32) : "";
      const count = Number(e?.online);
      if (name && Number.isFinite(count) && count >= 0) {
        servers.push({ name, online: Math.floor(count) });
      }
    }
  }

  const payload = JSON.stringify({
    online: body.online !== false,
    players: max === undefined ? { online: playerCount } : { online: playerCount, max },
    ...(version ? { version } : {}),
    ...(servers.length ? { servers } : {}),
  });

  await prisma.serverStatus.upsert({
    where: { id: "latest" },
    create: { id: "latest", payload },
    update: { payload, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
