import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/prisma';

const authSecret = process.env.JN_AUTH_SECRET || process.env.AUTH_SECRET;
const authUrl = process.env.JN_AUTH_URL || process.env.AUTH_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.JN_AUTH_DISCORD_ID || process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.JN_AUTH_DISCORD_SECRET || process.env.AUTH_DISCORD_SECRET,
    }),
  ],
  session: { strategy: 'database' },
  secret: authSecret,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.jacknetwork.in' : undefined,
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id as string;
      }
      return session;
    },
  },
});
