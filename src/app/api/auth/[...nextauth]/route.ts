import { NextRequest } from "next/server";
import { handlers } from "@/auth";

const { POST } = handlers;

export async function GET(request: NextRequest) {
  // Discord appends an RFC 9207 `iss` query parameter that the Auth.js
  // Discord provider rejects with CallbackRouteError. Discord is the only
  // provider, so dropping it carries no provider-mix-up risk.
  const url = new URL(request.url);
  if (url.searchParams.has("iss")) {
    url.searchParams.delete("iss");
    return handlers.GET(new NextRequest(url, { headers: request.headers }));
  }
  return handlers.GET(request);
}

export { POST };
