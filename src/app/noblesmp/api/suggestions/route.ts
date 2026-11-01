import { clientIp, hitRateLimit, json, sendDiscordEmbed, serverConfig } from '../_lib';

// Note: in-memory stores suit a single container (Pterodactyl).
// For multi-instance hosting, move these to Redis or a database table.
const recentHashes = new Map<string, number>();

function hashText(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h * 33 + input.charCodeAt(i)) >>> 0);
  return String(h);
}

export async function POST(req: Request): Promise<Response> {
  let body: { username?: string; suggestion?: string };
  try {
    body = (await req.json()) as { username?: string; suggestion?: string };
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const username = (body.username || '').trim();
  const suggestion = (body.suggestion || '').trim();
  if (!username) return json({ error: 'Enter your username first.' }, 400);
  if (username.length > 32) return json({ error: 'Username is too long. Keep it under 32 characters.' }, 400);
  if (suggestion.length < 10) return json({ error: 'Write a little more. Suggestions need at least 10 characters.' }, 400);
  if (suggestion.length > 500) return json({ error: 'Keep it under 500 characters so staff can read it fast.' }, 400);

  const key = `suggest:${clientIp(req)}:${username.toLowerCase()}`;
  const limit = hitRateLimit(key, 1, 10 * 60 * 1000);
  if (limit.limited) {
    return json(
      { error: 'You already sent a suggestion recently. Please wait 10 minutes between ideas.', retryAfterSeconds: limit.retryAfterSeconds },
      429,
      limit.retryAfterSeconds,
    );
  }

  const fingerprint = hashText(`${username.toLowerCase()}|${suggestion.toLowerCase()}`);
  const seenAt = recentHashes.get(fingerprint);
  if (seenAt && Date.now() - seenAt < 10 * 60 * 1000) {
    return json({ error: 'This looks like a duplicate of a recent suggestion.' }, 409);
  }

  let channelId: string;
  try {
    ({ suggestionChannelId: channelId } = serverConfig());
  } catch {
    return json({ error: 'Suggestion service is not configured yet. Please try again later.' }, 503);
  }

  try {
    await sendDiscordEmbed(channelId, {
      title: 'New Server Suggestion',
      color: 0xe8b23a,
      fields: [
        { name: 'Username', value: username.slice(0, 100), inline: true },
        { name: 'Suggestion', value: suggestion.slice(0, 1000), inline: false },
      ],
      footer: { text: 'Noble SMP - Suggestion Box' },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return json({ error: 'Discord service is temporarily unavailable. Your suggestion was not sent.' }, 503);
  }

  recentHashes.set(fingerprint, Date.now());
  return json({ status: 'received' });
}
