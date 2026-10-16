import { prisma } from "@/lib/prisma";
import { recordAudit, type AuditKind } from "@/lib/audit";

export type LinkEventKind = "code_issued" | "linked" | "link_refused" | "unlinked";
export type LinkEventSource = "web" | "plugin";

/** Link lifecycle → the secret audit ledger's vocabulary. */
const AUDIT_KIND: Record<LinkEventKind, AuditKind> = {
  code_issued: "verify_code_issued",
  linked: "verify",
  link_refused: "verify_refused",
  unlinked: "unverify",
};

/**
 * Audit trail of the Minecraft link lifecycle (issued codes, links,
 * refusals, unlinks) tied to the Discord user. Written best-effort: a
 * failed history row must never break the link action itself.
 *
 * Every event is also mirrored into the secret `AuditEvent` ledger, which
 * stamps it with a generated `refId` that is never exposed (see audit.ts).
 */
export async function recordLinkEvent(input: {
  userId: string;
  uuid?: string | null;
  username?: string | null;
  event: LinkEventKind;
  source: LinkEventSource;
}): Promise<void> {
  await Promise.all([
    writeLinkEvent(input),
    recordAudit({
      kind: AUDIT_KIND[input.event],
      source: input.source,
      userId: input.userId,
      uuid: input.uuid,
      username: input.username,
    }),
  ]);
}

async function writeLinkEvent(input: {
  userId: string;
  uuid?: string | null;
  username?: string | null;
  event: LinkEventKind;
  source: LinkEventSource;
}): Promise<void> {
  try {
    await prisma.linkEvent.create({
      data: {
        userId: input.userId,
        uuid: input.uuid ?? null,
        username: input.username ?? null,
        event: input.event,
        source: input.source,
      },
    });
  } catch (e) {
    console.error(`[link] history write failed (${input.event}): ${e instanceof Error ? e.message : e}`);
  }
}
