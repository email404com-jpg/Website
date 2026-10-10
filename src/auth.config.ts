import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.JN_AUTH_DISCORD_ID,
      clientSecret: process.env.JN_AUTH_DISCORD_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
