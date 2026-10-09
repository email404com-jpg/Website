import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith('/login') && isLoggedIn) {
    const url = new URL('/', req.url);
    return Response.redirect(url);
  }
  return;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo-jn.png).*)'],
};
