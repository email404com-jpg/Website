import { clientIp, hitRateLimit, json, serverConfig } from '../../_lib';

function b64urlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') || '/noblesmp/ranks';
  const safeReturn = returnTo.startsWith('/noblesmp/') ? returnTo : '/noblesmp/ranks';

  const limit = hitRateLimit(`discord-login:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (limit.limited) {
    return json(
      { error: 'Too many login attempts. Please wait before trying again.', retryAfterSeconds: limit.retryAfterSeconds },
      429,
      limit.retryAfterSeconds,
    );
  }

  let clientId: string;
  let redirectUri: string;
  try {
    ({ clientId, redirectUri } = serverConfig());
  } catch {
    return json({ error: 'Discord login is not configured yet. Please try again later.' }, 503);
  }

  const state = b64urlJson({ r: safeReturn, n: Math.random().toString(36).slice(2), t: Date.now() });
  const authorize = new URL('https://discord.com/oauth2/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', 'identify');
  authorize.searchParams.set('state', state);
  return Response.redirect(authorize.toString(), 302);
}
