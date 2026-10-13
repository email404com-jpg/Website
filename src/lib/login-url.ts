import { site } from "@/lib/site";

/**
 * Where to send a visitor to sign in. Login always happens on the main site
 * (its Discord OAuth redirect URI is the one registered); the session cookie
 * is shared across *.jacknetwork.in, so they come straight back signed in.
 */
export function loginUrl(): string {
  const host = window.location.hostname;
  const base = host === "jacknetwork.in" || host.endsWith(".jacknetwork.in") ? site.url : "";
  return `${base}/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
}
