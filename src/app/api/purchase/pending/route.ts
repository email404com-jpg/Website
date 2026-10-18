import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";

/**
 * Delivery queue for the JackLink Paper jar.
 *
 *   GET /api/purchase/pending?server=<name>   + Bearer key
 *
 * Returns the purchases charged and still waiting on THIS server. Rows stay
 * here until the buyer is actually online (a `give` fails offline, and holding
 * costs nothing), and until the jar acknowledges the run.
 */

export type PendingPurchase = {
  id: string;
  uuid: string;
  username: string;
  command: string;
};

const TAKE = 25;

export async function GET(request: Request) {
  const authed = pluginAuthorised(request);
  if (authed === null) return NextResponse.json({ error: "not-configured" }, { status: 503 });
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const server = new URL(request.url).searchParams.get("server")?.trim();
  if (!server) return NextResponse.json({ error: "missing-server" }, { status: 400 });

  const rows = await prisma.purchase.findMany({
    where: { server, status: "pending" },
    orderBy: { createdAt: "asc" },
    take: TAKE,
    select: { id: true, uuid: true, username: true, command: true },
  });

  const purchases: PendingPurchase[] = rows.map((r) => ({
    id: r.id,
    uuid: r.uuid,
    username: r.username,
    command: r.command,
  }));
  return NextResponse.json({ purchases });
}
