import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pluginAuthorised } from "@/lib/plugin-auth";

/**
 * Acknowledge a delivery attempt.
 *
 *   POST /api/purchase/ack  + Bearer key   { id, ok, error? }
 *
 * A failed run is retried up to MAX_ATTEMPTS times before the row is given up
 * on. An offline buyer is not a failed run — the jar simply does not ask to
 * ack those, and the row stays pending until they join.
 */

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const authed = pluginAuthorised(request);
  if (authed === null) return NextResponse.json({ error: "not-configured" }, { status: 503 });
  if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { id?: unknown; ok?: unknown; error?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const ok = body.ok === true;
  const error = typeof body.error === "string" ? body.error.slice(0, 300) : null;

  const row = await prisma.purchase.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "unknown" }, { status: 404 });
  // Already settled — tell the jar to drop it rather than retrying.
  if (row.status !== "pending") return NextResponse.json({ status: row.status });

  if (ok) {
    await prisma.purchase.update({
      where: { id },
      data: { status: "delivered", deliveredAt: new Date(), error: null },
    });
    return NextResponse.json({ status: "delivered" });
  }

  const attempts = row.attempts + 1;
  const failed = attempts >= MAX_ATTEMPTS;
  const updated = await prisma.purchase.update({
    where: { id },
    data: { attempts, status: failed ? "failed" : "pending", error: error ?? "run-failed" },
  });
  return NextResponse.json({ status: updated.status, attempts });
}
