import { createHmac } from 'node:crypto';

export const SESSION_COOKIE = 'noblesmp_session';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server configuration (${name}).`);
  return value;
}

export function serverConfig() {
  return {
    clientId: requiredEnv('DISCORD_CLIENT_ID'),
    clientSecret: requiredEnv('DISCORD_CLIENT_SECRET'),
    redirectUri: requiredEnv('DISCORD_REDIRECT_URI'),
    botToken: requiredEnv('DISCORD_BOT_TOKEN'),
    verifiedChannelId: requiredEnv('NOBLESMP_VERIFIED_CHANNEL_ID'),
    suggestionChannelId: requiredEnv('NOBLESMP_SUGGESTION_CHANNEL_ID'),
  };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export function json(data: unknown, status = 200, retryAfterSeconds?: number): Response {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (retryAfterSeconds !== undefined) headers['retry-after'] = String(retryAfterSeconds);
  return new Response(JSON.stringify(data), { status, headers });
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function hitRateLimit(key: string, max: number, windowMs: number): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }
  if (current.count >= max) {
    return { limited: true, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

function b64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function unb64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function signSession(payload: { id: string; username: string; avatar: string | null }): string {
  const secret = requiredEnv('DISCORD_CLIENT_SECRET');
  const body = b64url(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string): { id: string; username: string; avatar: string | null } | null {
  try {
    const secret = process.env.DISCORD_CLIENT_SECRET;
    if (!secret) return null;
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = createHmac('sha256', secret).update(body).digest('base64url');
    if (sig.length !== expected.length) return null;
    let match = 0;
    for (let i = 0; i < sig.length; i++) match |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (match !== 0) return null;
    const data = JSON.parse(unb64url(body)) as { id: string; username: string; avatar: string | null; iat: number };
    if (!data.id || !data.username) return null;
    if (Date.now() - data.iat > 30 * 24 * 60 * 60 * 1000) return null;
    return { id: data.id, username: data.username, avatar: data.avatar ?? null };
  } catch {
    return null;
  }
}

export function readSessionCookie(req: Request): { id: string; username: string; avatar: string | null } | null {
  const header = req.headers.get('cookie') || '';
  const part = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!part) return null;
  return verifySession(decodeURIComponent(part.slice(SESSION_COOKIE.length + 1)));
}

export async function sendDiscordEmbed(channelId: string, embed: Record<string, unknown>): Promise<void> {
  const { botToken } = serverConfig();
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bot ${botToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord rejected the message (${res.status}).`);
}
