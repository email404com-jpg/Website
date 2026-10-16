import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

/** Same ambiguity-free alphabet as the /link code (no 0/O/1/I). */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REF_BODY = 10;

export type AuditKind =
  | "verify_code_issued"
  | "verify"
  | "verify_refused"
  | "unverify_code_issued"
  | "unverify"
  | "purchase";

export type AuditSource = "web" | "plugin" | "system";

/** `JN-` + 10 random chars — non-sequential, so IDs leak nothing. */
export function generateRefId(): string {
  let out = "JN-";
  for (let i = 0; i < REF_BODY; i += 1) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * Secret audit ledger for verify / unverify / purchase.
 *
 * Each row gets a generated `refId`. Nothing in the app returns a row:
 * there is deliberately no route that reads `AuditEvent`, so the IDs stay
 * inside the database only (AGENTS.md rule 5 — never expose internals).
 *
 * Written best-effort: a failed audit row must never break the action
 * being audited. `meta` is JSON detail (item, amount, price…) and is
 * never serialised back to a client.
 */
export async function recordAudit(input: {
  kind: AuditKind;
  source: AuditSource;
  userId?: string | null;
  uuid?: string | null;
  username?: string | null;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  const meta = input.meta ? JSON.stringify(input.meta) : null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await prisma.auditEvent.create({
        data: {
          refId: generateRefId(),
          kind: input.kind,
          source: input.source,
          userId: input.userId ?? null,
          uuid: input.uuid ?? null,
          username: input.username ?? null,
          meta,
        },
      });
      return;
    } catch (e) {
      // Unique refId collision — retry with a fresh ID. Anything else we
      // give up rather than let the audit write break the caller.
      if (attempt === 4) {
        console.error(`[audit] write failed (${input.kind}): ${e instanceof Error ? e.message : e}`);
      }
    }
  }
}
