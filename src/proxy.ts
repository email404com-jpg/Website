import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STORE_HOST = "store.jacknetwork.in";
const STORE_URL = `https://${STORE_HOST}`;
const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;

/**
 * Host-based routing for the store subdomain. The store lives in the same
 * app (so it shares the Auth.js session cookie on .jacknetwork.in); the
 * proxy maps store.jacknetwork.in/<page> onto /store/<page>.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname, search } = request.nextUrl;

  if (host.startsWith("store.")) {
    if (pathname === "/store" || pathname.startsWith("/store/")) {
      const clean = request.nextUrl.clone();
      clean.pathname = pathname.replace(/^\/store/, "") || "/";
      return NextResponse.redirect(clean, 308);
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/store" : `/store${pathname}`;
    return NextResponse.rewrite(url);
  }

  // The internal /store tree is only meant to be reached via the subdomain.
  if (pathname === "/store" || pathname.startsWith("/store/")) {
    if (LOCAL.test(host)) return NextResponse.next();
    const rest = pathname.replace(/^\/store/, "") || "/";
    return NextResponse.redirect(`${STORE_URL}${rest}${search}`, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/practice", "/survival", "/coins", "/store/:path*", "/store"],
};
