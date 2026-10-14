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

/**
 * The owner's working curl uses `http://host:port/...`. If that prefix is
 * missing from the env var, Node parses `host:port/path` as protocol
 * `host:port` and fetch fails with "unknown scheme". Prepend http:// then.
 */
export function withScheme(raw: string): string {
  if (!raw) return raw;
  return /^[a-z][a-z0-9+\-.]*:\/\//i.test(raw) ? raw : `http://${raw}`;
}

/**
 * A template without {discordId} would send every caller to one fixed URL —
 * showing a single player's balance to every visitor. Refuse the call instead
 * of guessing the path (rule 4: never invent facts).
 */
export function hasIdPlaceholder(t: string): boolean {
  return t.includes("{discordId}") || t.includes("{uuid}");
}

/**
 * Name every defect in the configured template so one log line is enough to
 * fix it. Reports scheme://host only — never the raw value, in case a token
 * was pasted into the URL.
 */
export function configProblem(raw: string): string | null {
  if (!raw) return null;
  const problems: string[] = [];
  if (!hasIdPlaceholder(raw)) problems.push("no {discordId} placeholder");
  try {
    const path = new URL(withScheme(raw)).pathname;
    if (path === "/" || path === "") {
      problems.push("no path (host:port only, so it hits / instead of the endpoint)");
    }
  } catch {
    problems.push("not a parseable URL");
  }
  if (problems.length === 0) return null;
  return (
    `${problems.join("; ")}; resolves to ${safeTarget(withScheme(raw))}. ` +
    "Expected http://<bot-host>:<port>/api/v1/economy/<guild>/users/{discordId}/balance"
  );
}

/** The adjust template if explicitly configured, else the balance template. */
function configuredTemplate(adjust: boolean): string {
  if (adjust && process.env.JN_COINS_ADJUST_URL) return process.env.JN_COINS_ADJUST_URL;
  return process.env.JN_COINS_API_URL ?? "";
}

function balanceUrl(discordId: string, uuid = ""): string {
  return withScheme(process.env.JN_COINS_API_URL ?? "")
    .replaceAll("{discordId}", encodeURIComponent(discordId))
    .replaceAll("{uuid}", encodeURIComponent(uuid));
}

/** .../balance -> .../adjust (override with JN_COINS_ADJUST_URL). */
function adjustUrl(discordId: string): string {
  const explicit = process.env.JN_COINS_ADJUST_URL;
  if (explicit) return withScheme(explicit).replaceAll("{discordId}", encodeURIComponent(discordId));
  return balanceUrl(discordId).replace(/\/balance\/?(\?.*)?$/, "/adjust");
}

const KEYS = ["coins", "balance", "amount", "points", "value"];

/**
 * The bot answers /health in ~0.3s but the balance path was measured at
 * 4.3s under load; 6s aborted real requests. Keep this well above the worst
 * observed latency — the route is server-side, so waiting costs nothing the
 * user can see beyond a slower header refresh.
 */
const TIMEOUT_MS = 15_000;

/**
 * Node's fetch reports only "fetch failed"; the real reason (ECONNREFUSED,
 * ENOTFOUND, ETIMEDOUT, TLS errors) sits in `cause`. Log scheme+host+port of
 * the target — never the full URL, which carries the caller's Discord id.
 */
export function describeFetchError(e: unknown): string {
  const err = e instanceof Error ? e : new Error(String(e));
  const cause = (err as { cause?: unknown }).cause;
  let detail = err.message;
  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code;
    if (code) detail += ` [${code}]`;
    detail += ` cause=${cause.message}`;
  }
  return detail;
}

/** scheme://host:port only — no path, no query, no caller identity. */
export function safeTarget(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "invalid-url";
  }
}

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
  const tmpl = configuredTemplate(false);
  const bad = configProblem(tmpl);
  if (bad) {
    console.error(`[coins] refusing balance call: ${bad}`);
    return { ok: false, reason: "bad-coins-url" };
  }
  const url = balanceUrl(discordId, uuid);
  try {
    const res = await fetch(url, {
      headers: headers(),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
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
      // Log only the shape (keys), not values: enough to tighten extractBalance
      // from one server log line without dumping a user's economy record.
      const keys =
        body && typeof body === "object"
          ? Object.keys(body as Record<string, unknown>).join(",")
          : typeof body;
      console.error(`[coins] no balance field (top-level keys: ${keys}): ${text.slice(0, 300)}`);
      return { ok: false, reason: "no-balance-field" };
    }
    return { ok: true, coins };
  } catch (e) {
    console.error(`[coins] balance request failed: ${describeFetchError(e)} -> ${safeTarget(url)}`);
    return { ok: false, reason: "api-unreachable" };
  }
}

export async function adjustCoins(
  discordId: string,
  amount: number,
  reason: string,
  idempotencyKey: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  // On adjust this matters more: a fixed or path-less URL could credit
  // the wrong player's balance.
  const tmpl = configuredTemplate(true);
  const bad = configProblem(tmpl);
  if (bad) {
    console.error(`[coins] refusing adjust call: ${bad}`);
    return { ok: false, reason: "bad-coins-url" };
  }
  const url = adjustUrl(discordId);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ amount, reason, idempotency_key: idempotencyKey }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[coins] adjust HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return { ok: false, reason: `api-http-${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error(`[coins] adjust failed: ${describeFetchError(e)} -> ${safeTarget(url)}`);
    return { ok: false, reason: "api-unreachable" };
  }
}
