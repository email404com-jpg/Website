import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

// Auth.js only reads AUTH_URL, but this project configures JN_AUTH_URL.
// Mirror it so hosts behind the panel proxy are trusted correctly.
if (!process.env.AUTH_URL && process.env.JN_AUTH_URL) {
  process.env.AUTH_URL = process.env.JN_AUTH_URL;
}

function publicHostname() {
  try {
    return new URL(
      process.env.JN_AUTH_URL || process.env.AUTH_URL || "",
    ).hostname;
  } catch {
    return "";
  }
}

function sessionCookieDomain() {
  if (process.env.NODE_ENV !== "production") return undefined;
  // Explicit override for non-standard domains.
  if (process.env.JN_COOKIE_DOMAIN) return process.env.JN_COOKIE_DOMAIN;
  const host = publicHostname().replace(/^\./, "");
  // Cookie domains must be DNS names. IP addresses, ports, and localhost
  // cannot use a domain attribute, so leave it unset for those.
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return undefined;
  }
  // Default preserves the long-standing production behavior.
  return host === "jacknetwork.in" ? ".jacknetwork.in" : host;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Behind the panel's reverse proxy Auth.js sees an internal host
  // (e.g. 0.0.0.0:port) and rejects it without this.
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.JN_AUTH_DISCORD_ID,
      clientSecret: process.env.JN_AUTH_DISCORD_SECRET,
    }),
  ],
  session: { strategy: "database" },
  secret: process.env.JN_AUTH_SECRET || process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        domain: sessionCookieDomain(),
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    // Allow post-login redirects to any jacknetwork.in subdomain (e.g. the
    // store) in addition to the default same-origin behaviour.
    redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        const host = target.hostname;
        if (host === "jacknetwork.in" || host.endsWith(".jacknetwork.in")) {
          return target.toString();
        }
        if (target.origin === new URL(baseUrl).origin) return target.toString();
      } catch {
        /* fall through */
      }
      return baseUrl;
    },
    // Return only what the client needs. The default database-session object
    // also carries `sessionToken` and `userId`, which would otherwise be
    // readable from JavaScript via /api/auth/session despite the httpOnly cookie.
    session({ session, user }) {
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: session.expires,
      } as typeof session;
    },
  },
});
