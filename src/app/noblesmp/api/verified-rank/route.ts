import { clientIp, hitRateLimit, json, readSessionCookie, sendDiscordEmbed, serverConfig } from '../_lib';

const MINECRAFT_NAME_RE = /^[A-Za-z0-9_]{3,16}$/;

// Note: in-memory stores suit a single container (Pterodactyl).
// For multi-instance hosting, move these to Redis or a database table.
const byDiscord = new Map<string, { minecraft: string; at: number }>();
const byMinecraft = new Map<string, string>();

export async function POST(req: Request): Promise<Response> {
  const session = readSessionCookie(req);
  if (!session) return json({ error: 'Sign in with Discord first.' }, 401);

  const ipLimit = hitRateLimit(`verified:${clientIp(req)}`, 20, 60 * 60 * 1000);
  if (ipLimit.limited) {
    return json(
      { error: 'Too many attempts. Please wait before trying again.', retryAfterSeconds: ipLimit.retryAfterSeconds },
      429,
      ipLimit.retryAfterSeconds,
    );
  }

  let body: { minecraftUsername?: string };
  try {
    body = (await req.json()) as { minecraftUsername?: string };
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const minecraft = (body.minecraftUsername || '').trim();
  if (!MINECRAFT_NAME_RE.test(minecraft)) {
    return json({ error: 'That Minecraft username looks invalid. Use 3 to 16 letters, numbers, or underscores.' }, 400);
  }

  if (byDiscord.has(session.id)) {
    return json({ error: 'This Discord account already has a pending request.', status: 'pending' }, 409);
  }
  const mcKey = minecraft.toLowerCase();
  if (byMinecraft.has(mcKey)) {
    return json({ error: 'This Minecraft username already has a pending request.', status: 'pending' }, 409);
  }

  let channelId: string;
  try {
    ({ verifiedChannelId: channelId } = serverConfig());
  } catch {
    return json({ error: 'Rank service is not configured yet. Please try again later.' }, 503);
  }

  try {
    await sendDiscordEmbed(channelId, {
      title: 'Verified Rank Request',
      color: 0x8b5cf6,
      fields: [
        { name: 'Discord User', value: `${session.username}`, inline: true },
        { name: 'Discord ID', value: session.id, inline: true },
        { name: 'Minecraft Username', value: minecraft, inline: false },
      ],
      footer: { text: 'Noble SMP - Verified Rank' },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return json({ error: 'Discord service is temporarily unavailable. Your request was not submitted.' }, 503);
  }

  byDiscord.set(session.id, { minecraft, at: Date.now() });
  byMinecraft.set(mcKey, session.id);
  return json({ status: 'pending', message: 'Your Verified Rank request has been received and your rank will be loaded within 1 minute.' });
}
