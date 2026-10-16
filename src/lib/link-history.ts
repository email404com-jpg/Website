import { prisma } from "@/lib/prisma";

export type LinkEventKind = "code_issued" | "linked" | "link_refused" | "unlinked";
export type LinkEventSource = "web" | "plugin";

/**
 * Audit trail of the Minecraft link lifecycle (issued codes, links,
 * refusals, unlinks) tied to the Discord user. Written best-effort: a
 * failed history row must never break the link action itself.
 */
export async function recordLinkEvent(input: {
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
