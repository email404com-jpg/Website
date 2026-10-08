import { connection, NextResponse } from "next/server";

type Payload = {
  state: "ok" | "unconfigured" | "error";
  online?: boolean;
  players?: { online: number; max: number };
  version?: string;
};

function normalise(raw: unknown): Payload {
  if (!raw || typeof raw !== "object") return { state: "error" };
  const data = raw as Record<string, unknown>;

  const playersRaw = (data.players ?? data.player) as
    | Record<string, unknown>
    | undefined;

  const onlineCount =
    typeof playersRaw?.online === "number" ? playersRaw.online : undefined;
  const maxCount =
    typeof playersRaw?.max === "number" ? playersRaw.max : undefined;

  const versionRaw = data.version;
  const version =
    typeof versionRaw === "string"
      ? versionRaw
      : versionRaw && typeof versionRaw === "object" &&
          typeof (versionRaw as Record<string, unknown>).name === "string"
        ? ((versionRaw as Record<string, string>).name)
        : undefined;

  const online =
    typeof data.online === "boolean"
      ? data.online
      : onlineCount !== undefined
        ? true
        : undefined;

  return {
    state: "ok",
    online,
    players:
      onlineCount !== undefined && maxCount !== undefined
        ? { online: onlineCount, max: maxCount }
        : undefined,
    version,
  };
}

export async function GET() {
  await connection();

  const upstream = process.env.MINECRAFT_STATUS_URL;

  if (!upstream) {
    return NextResponse.json(
      { state: "unconfigured" } satisfies Payload,
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(upstream, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { state: "error" } satisfies Payload,
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    const payload = normalise(await response.json());

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { state: "error" } satisfies Payload,
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
