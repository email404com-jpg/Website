import { timingSafeEqual } from "node:crypto";

/**
 * Bearer auth for the Minecraft-plugin-facing endpoints (`/api/link/confirm`,
 * `/api/link/status`, `/api/link/coins`).
 *   null  = JN_LINK_API_KEY not configured
 *   true  = matches
 *   false = wrong key
 */
export function pluginAuthorised(request: Request): boolean | null {
  const key = process.env.JN_LINK_API_KEY;
  if (!key) return null;
  const header = request.headers.get("authorization") ?? "";
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
