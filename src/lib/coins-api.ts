/** Server-side client for the coins economy API (balance + adjust). */

export function coinsConfigured(): boolean {
  return Boolean(process.env.JN_COINS_API_URL);
}

function headers(json = false): Record<string, string> {
  const h: Record<string, string> = { accept: "application/json" };
  if (json) h["content-type"] = "application/json";
  if (process.env.JN_COINS_API_KEY) h.authorization = `Bearer ${process.env.JN_COINS_API_KEY}`;
  return h;
}

function balanceUrl(discordId: string, uuid = ""): string {
  return (process.env.JN_COINS_API_URL ?? "")
    .replaceAll("{discordId}", encodeURIComponent(discordId))
    .replaceAll("{uuid}", encodeURIComponent(uuid));
}

/** .../balance -> .../adjust (override with JN_COINS_ADJUST_URL). */
function adjustUrl(discordId: string): string {
  const explicit = process.env.JN_COINS_ADJUST_URL;
  if (explicit) return explicit.replaceAll("{discordId}", encodeURIComponent(discordId));
  return balanceUrl(discordId).replace(/\/balance\/?(\?.*)?$/, "/adjust");
}

const KEYS = ["coins", "balance", "amount", "points", "value"];

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

/** Find the balance anywhere in the JSON: preferred keys first, shallowest wins. */
export function extractBalance(body: unknown): number | null {
  const direct = toNum(body);
  if (direct !== null) return direct;
  let level: unknown[] = [body];
  for (let depth = 0; depth < 4 && level.length; depth++) {
    const next: unknown[] = [];
    for (const node of level) {
      if (!node || typeof node !== "object") continue;
      const obj = node as Record<string, unknown>;
      for (const k of KEYS) {
        for (const [key, val] of Object.entries(obj)) {
          if (key.toLowerCase() === k) {
            const n = toNum(val);
            if (n !== null) return n;
          }
        }
      }
      next.push(...Object.values(obj));
    }
    level = next;
  }
  return null;
}

export type BalanceResult =
  | { ok: true; coins: number }
  | { ok: false; reason: string };

export async function fetchBalance(discordId: string, uuid = ""): Promise<BalanceResult> {
  const url = balanceUrl(discordId, uuid);
  try {
    const res = await fetch(url, {
      headers: headers(),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[coins] balance HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { ok: false, reason: `api-http-${res.status}` };
    }
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      console.error(`[coins] balance not JSON: ${text.slice(0, 200)}`);
      return { ok: false, reason: "api-not-json" };
    }
    const coins = extractBalance(body);
    if (coins === null) {
      console.error(`[coins] no balance field in: ${text.slice(0, 300)}`);
      return { ok: false, reason: "no-balance-field" };
    }
    return { ok: true, coins };
  } catch (e) {
    console.error("[coins] balance request failed:", e instanceof Error ? e.message : e);
    return { ok: false, reason: "api-unreachable" };
  }
}

export async function adjustCoins(
  discordId: string,
  amount: number,
  reason: string,
  idempotencyKey: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const res = await fetch(adjustUrl(discordId), {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ amount, reason, idempotency_key: idempotencyKey }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error(`[coins] adjust HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return { ok: false, reason: `api-http-${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[coins] adjust failed:", e instanceof Error ? e.message : e);
    return { ok: false, reason: "api-unreachable" };
  }
}
