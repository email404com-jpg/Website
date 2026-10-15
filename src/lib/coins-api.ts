/** Server-side client for the coins economy API (balance + adjust). */
import os from "node:os";

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

/**
 * Crownix documents the balance path as
 *   /api/v1/economy/<guild_id>/users/<user_id>/balance
 * The panel kept being set to bare host:port, which carries no path and no
 * placeholder. Rebuild the documented path from the host so host:port alone
 * is enough. Only ever applied when the configured value has no path at all
 * — a half-built path is still refused, never guessed. The guild id defaults
 * to Jack's guild (same value as .env.example) so a bare host:port plus an
 * API key is a complete working config; JN_COINS_GUILD_ID overrides it.
 */
const CROWNIX_BALANCE_PATH = "/api/v1/economy/{guildId}/users/{discordId}/balance";
const DEFAULT_GUILD_ID = "1537698724992647198";

export function resolveBalanceTemplate(): string {
  const raw = process.env.JN_COINS_API_URL ?? "";
  if (!raw || hasIdPlaceholder(raw)) return raw;
  const guild = process.env.JN_COINS_GUILD_ID || DEFAULT_GUILD_ID;
  if (!guild) return raw;
  const base = withScheme(raw).replace(/\/+$/, "");
  let path: string;
  try {
    path = new URL(base).pathname;
  } catch {
    return raw;
  }
  if (path !== "/" && path !== "") return raw;
  return `${base}${CROWNIX_BALANCE_PATH.replace("{guildId}", encodeURIComponent(guild))}`;
}

/** The adjust template if explicitly configured, else the balance template. */
function configuredTemplate(adjust: boolean): string {
  if (adjust && process.env.JN_COINS_ADJUST_URL) return process.env.JN_COINS_ADJUST_URL;
  return resolveBalanceTemplate();
}

function balanceUrl(discordId: string, uuid = ""): string {
  return withScheme(resolveBalanceTemplate())
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

/**
 * The bot runs on the SAME host as this app — power2.vektalnodes.in is the
 * site's own public IP. Reaching a machine over its own public address needs
 * hairpin NAT, which this host does not do, so that connect times out
 * ([UND_ERR_CONNECT_TIMEOUT]) even though the bot answers fine from outside.
 * This is why candidateUrls() dials 127.0.0.1 first; this predicate decides
 * whether a failed hop may advance to the next candidate at all.
 *
 * Only failures that mean "the connection was never established" count —
 * a reset after the request went out could mean the bot already applied it,
 * and retrying a non-idempotent adjust would double-credit.
 */
export function isConnectError(e: unknown): boolean {
  const cause = (e as { cause?: unknown })?.cause as NodeJS.ErrnoException | undefined;
  switch (cause?.code ?? "") {
    case "UND_ERR_CONNECT_TIMEOUT":
    case "ECONNREFUSED":
    case "ETIMEDOUT":
    case "ENOTFOUND":
    case "EHOSTUNREACH":
    case "ENETUNREACH":
      return true;
    default:
      return false;
  }
}

/** Swap only host:port, keeping scheme, path and query intact. */
export function swapHost(url: string, host: string): string {
  try {
    const u = new URL(url);
    u.host = host.replace(/^[a-z][a-z0-9+\-.]*:\/\//i, "").replace(/\/+$/, "");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * The addresses worth trying before discovery and the configured host:
 *   1. The discovered host, once one is proven — after that no probing.
 *   2. 127.0.0.1:<port> — same network namespace (instant either way).
 *      Only when the URL carries an explicit non-web port; 80/443 are
 *      skipped so our own nginx is never dialled.
 *   3. JN_COINS_HOST_OVERRIDE — an owner-provided known-good address.
 * The configured host itself is handled by requestWithFallback (it is last,
 * and may be replaced by a discovered one).
 */
export function fastCandidateUrls(url: string): string[] {
  const out: string[] = [];
  const push = (u: string) => {
    if (u && !out.includes(u)) out.push(u);
  };
  let port = "";
  try {
    port = new URL(url).port;
  } catch {
    // unparseable — the primary attempt reports the real error
  }
  if (port && discovered?.port === port) push(swapHost(url, discovered.host));
  if (port && port !== "80" && port !== "443") push(swapHost(url, `127.0.0.1:${port}`));
  const alt = (process.env.JN_COINS_HOST_OVERRIDE ?? "").trim();
  if (alt) push(swapHost(url, alt));
  return out.filter((u) => u !== url);
}

// ---------------------------------------------------------------------------
// Local discovery. The bot binds 0.0.0.0:<port> (Flask on this machine) but
// NOT on this process's localhost (separate container), and its public IP
// cannot hairpin back — so when the fast candidates fail, sweep this
// machine's own network for the economy API: gateways first (bot running on
// the host), then the local subnets (bot in a sibling container). A target is
// only trusted after GET /api/v1/health names `crownix-economy-api`, so the
// API key is never sent to anything else. The winner is cached for the life
// of the process; a dead cache entry is dropped and re-scanned after a pause.
// JN_COINS_DISCOVER=off disables the sweep entirely.

const PROBE_TIMEOUT_MS = 450;
const PROBE_BATCH = 128;
const RESCAN_AFTER_MS = 60_000;

let discovered: { port: string; host: string } | null = null;
let scanInflight: Promise<string | null> | null = null;
let rescanAfter = 0;

function discoveryEnabled(): boolean {
  return !["off", "0", "false", "no"].includes((process.env.JN_COINS_DISCOVER ?? "").toLowerCase());
}

/** Is this `host:port` the CrowniX economy API? (health endpoint needs no auth) */
async function probeEconomy(target: string): Promise<boolean> {
  try {
    const r = await fetch(`http://${target}/api/v1/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!r.ok) return false;
    const j: unknown = await r.json();
    return (j as { service?: unknown } | null)?.service === "crownix-economy-api";
  } catch {
    return false;
  }
}

/**
 * Probe targets for this machine: docker/host gateways first, then each
 * private IPv4 interface's own /24 (and, on a /16, the network's base /24 —
 * where sibling containers usually land). `targets` overrides the computed
 * list (tests, or a pinned set).
 */
export function localProbeTargets(port: string): string[] {
  const gateways = new Set(["172.17.0.1", "172.18.0.1", "host.docker.internal"]);
  const sweeps = new Set<string>();
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family !== "IPv4" || ni.internal) continue;
      const o = ni.address.split(".").map(Number);
      if (o[0] !== 10 && o[0] !== 172 && o[0] !== 192) continue;
      const prefix = Number(ni.cidr?.split("/")[1] ?? 24);
      gateways.add(prefix >= 16 ? `${o[0]}.${o[1]}.0.1` : `${o[0]}.${o[1]}.${o[2]}.1`);
      sweeps.add(`${o[0]}.${o[1]}.${o[2]}.`);
      if (prefix >= 16 && o[2] !== 0) sweeps.add(`${o[0]}.${o[1]}.0.`);
    }
  }
  const out: string[] = [];
  const push = (host: string) => {
    const t = `${host}:${port}`;
    if (!out.includes(t)) out.push(t);
  };
  for (const g of gateways) push(g);
  for (const s of sweeps) for (let i = 1; i <= 254; i++) push(`${s}${i}`);
  return out;
}

export async function discoverLocalBot(port: string, targets?: string[]): Promise<string | null> {
  if (discovered?.port === port) return discovered.host;
  if (!targets && Date.now() < rescanAfter) return null;
  if (scanInflight) {
    await scanInflight.catch(() => null);
    return discovered?.port === port ? discovered.host : null;
  }
  scanInflight = scanForBot(port, targets);
  try {
    return await scanInflight;
  } finally {
    scanInflight = null;
  }
}

async function scanForBot(port: string, targets?: string[]): Promise<string | null> {
  const list = targets ?? localProbeTargets(port);
  for (let i = 0; i < list.length; i += PROBE_BATCH) {
    const hits = await Promise.all(
      list.slice(i, i + PROBE_BATCH).map(async (t) => ((await probeEconomy(t)) ? t : null)),
    );
    const found = hits.find(Boolean);
    if (found) {
      discovered = { port, host: found };
      console.log(`[coins] discovered bot at ${found} (economy /health ok)`);
      return found;
    }
  }
  rescanAfter = Date.now() + RESCAN_AFTER_MS;
  console.log(`[coins] local discovery found no economy API on :${port} (${list.length} addrs probed); using the configured host`);
  return null;
}

async function doFetch(target: string, init: Omit<RequestInit, "signal" | "cache">): Promise<Response> {
  return fetch(target, { ...init, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
}

export async function requestWithFallback(
  url: string,
  init: Omit<RequestInit, "signal" | "cache">,
): Promise<Response> {
  let port = "";
  try {
    port = new URL(withScheme(url)).port;
  } catch {
    // unparseable — the primary attempt reports the real error
  }
  const attempt = async (target: string): Promise<Response | null> => {
    try {
      return await doFetch(target, init);
    } catch (e) {
      if (!isConnectError(e)) throw e;
      // The 127.0.0.1 probe is expected to fail in the separate-container
      // topology — silent. Anything else failing is worth one line.
      if (!/^https?:\/\/127\.0\.0\.1(?::|$)/.test(target)) {
        console.error(`[coins] ${safeTarget(target)} unreachable (${describeFetchError(e)})`);
      }
      return null;
    }
  };

  const fast = fastCandidateUrls(url);
  for (const target of fast) {
    const res = await attempt(target);
    if (res) return res;
    if (discovered && port === discovered.port && target === swapHost(url, discovered.host)) {
      discovered = null; // dropped — re-scanned after the pause
      rescanAfter = Date.now() + RESCAN_AFTER_MS;
    }
  }

  // Discovery before burning the configured host's hairpin timeout.
  try {
    if (discoveryEnabled() && port) {
      const host = await discoverLocalBot(port);
      if (host) {
        const target = swapHost(url, host);
        if (target !== url && !fast.includes(target)) {
          const res = await attempt(target);
          if (res) return res;
          if (discovered?.host === host) {
            discovered = null; // dropped — re-scanned after the pause
            rescanAfter = Date.now() + RESCAN_AFTER_MS;
          }
        }
      }
    }
  } catch {
    // fall through to the configured host
  }

  return doFetch(url, init);
}

// Balance cache: every visitor's header polls every second, the bot allows
// 120 reads/min for the shared token. Cache each user's last good balance
// for 2s and collapse concurrent identical reads into one upstream call.
const BALANCE_CACHE_MS = 2_000;
const BALANCE_STALE_MS = 5_000; // re-check window while upstream is rate limiting
const BALANCE_CACHE_MAX = 2_000;
type BalanceCacheEntry = { exp: number; coins: number };
const balanceCache = new Map<string, BalanceCacheEntry>();
const balanceInflight = new Map<string, Promise<BalanceResult>>();

export function clearBalanceCache(discordId?: string): void {
  if (!discordId) {
    balanceCache.clear();
    return;
  }
  for (const key of [...balanceCache.keys()]) {
    if (key.startsWith(`${discordId}|`)) balanceCache.delete(key);
  }
}

export async function fetchBalance(discordId: string, uuid = ""): Promise<BalanceResult> {
  const key = `${discordId}|${uuid}`;
  const prev = balanceCache.get(key);
  if (prev && prev.exp > Date.now()) return { ok: true, coins: prev.coins };

  const inflight = balanceInflight.get(key);
  if (inflight) return inflight;

  const run = async (): Promise<BalanceResult> => {
    const tmpl = configuredTemplate(false);
    const bad = configProblem(tmpl);
    if (bad) {
      console.error(`[coins] refusing balance call: ${bad}`);
      return { ok: false, reason: "bad-coins-url" };
    }
    const url = balanceUrl(discordId, uuid);
    try {
      const res = await requestWithFallback(url, { headers: headers() });
      const text = await res.text();
      if (!res.ok) {
        // Upstream rate limit: keep serving the last known value instead of
        // flashing "Balance unavailable" at every visitor.
        if (res.status === 429 && prev) {
          console.log("[coins] upstream rate limited; serving last known balance");
          balanceCache.set(key, { exp: Date.now() + BALANCE_STALE_MS, coins: prev.coins });
          return { ok: true, coins: prev.coins };
        }
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
      if (balanceCache.size > BALANCE_CACHE_MAX) balanceCache.clear();
      balanceCache.set(key, { exp: Date.now() + BALANCE_CACHE_MS, coins });
      return { ok: true, coins };
    } catch (e) {
      console.error(`[coins] balance request failed: ${describeFetchError(e)} -> ${safeTarget(url)}`);
      return { ok: false, reason: "api-unreachable" };
    }
  };

  const p = run();
  balanceInflight.set(key, p);
  try {
    return await p;
  } finally {
    balanceInflight.delete(key);
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
    const res = await requestWithFallback(url, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ amount, reason, idempotency_key: idempotencyKey }),
    });
    if (!res.ok) {
      console.error(`[coins] adjust HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return { ok: false, reason: `api-http-${res.status}` };
    }
    clearBalanceCache(discordId); // the balance just changed
    return { ok: true };
  } catch (e) {
    console.error(`[coins] adjust failed: ${describeFetchError(e)} -> ${safeTarget(url)}`);
    return { ok: false, reason: "api-unreachable" };
  }
}
