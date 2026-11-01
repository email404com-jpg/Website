import { SESSION_COOKIE, clientIp, hitRateLimit, json, serverConfig, signSession } from '../../_lib';

function parseState(raw: string | null): string {
  if (!raw) return '/noblesmp/ranks';
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as { r?: string; t?: number };
    if (data.t && Date.now() - data.t > 10 * 60 * 1000) return '/noblesmp/ranks';
    if (data.r && data.r.startsWith('/noblesmp/')) return data.r;
  } catch {
    return '/noblesmp/ranks';
  }
  return '/noblesmp/ranks';
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const returnTo = parseState(url.searchParams.get('state'));

  if (!code) return json({ error: 'Discord login was cancelled. Please try again.' }, 400);

  const limit = hitRateLimit(`discord-callback:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (limit.limited) {
    return json(
      { error: 'Too many login attempts. Please wait before trying again.', retryAfterSeconds: limit.retryAfterSeconds },
      429,
      limit.retryAfterSeconds,
    );
  }

  let cfg;
  try {
    cfg = serverConfig();
  } catch {
    return json({ error: 'Discord login is not configured yet. Please try again later.' }, 503);
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.redirectUri,
      }),
    });
    if (!tokenRes.ok) return json({ error: 'Discord authentication failed. Please try again.' }, 502);
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) return json({ error: 'Discord authentication failed. Please try again.' }, 502);

    const meRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    if (!meRes.ok) return json({ error: 'Could not read your Discord profile. Please try again.' }, 502);
    const me = (await meRes.json()) as { id: string; username: string; avatar: string | null };
    if (!me.id || !me.username) return json({ error: 'Could not read your Discord profile. Please try again.' }, 502);

    const session = signSession({ id: me.id, username: me.username, avatar: me.avatar ?? null });
    const headers = new Headers({ location: returnTo });
    headers.append(
      'set-cookie',
      `${SESSION_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
    );
    return new Response(null, { status: 302, headers });
  } catch {
    return json({ error: 'Login service is temporarily unavailable. Please try again in a moment.' }, 503);
  }
}
