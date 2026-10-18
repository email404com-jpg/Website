"use client";

import { useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import type { CatalogId } from "@/lib/store";
import { CoinGlyph } from "./coin-icon";

type PurchaseState =
  | { state: "signed-out" }
  | { state: "unlinked" }
  | { state: "no-discord" }
  | { state: "unknown-item" }
  | { state: "unavailable" }
  | { state: "insufficient"; price: number; balance: number }
  | { state: "ok"; server: string }
  | { state: "failed"; reason: string }
  | { state: "error" };

type Message = { tone: "ok" | "warn" | "error"; text: string; href?: string; hrefLabel?: string };

const TONE_CLASS = {
  ok: "text-success",
  warn: "text-fg-muted",
  error: "text-error",
} as const;

function toMessage(data: PurchaseState): Message {
  switch (data.state) {
    case "ok":
      return {
        tone: "ok",
        text: `Paid. The grant runs on ${data.server} the first time you join it.`,
      };
    case "insufficient":
      return {
        tone: "error",
        text: `Not enough coins — this costs ${data.price.toLocaleString("en-US")} and you have ${data.balance.toLocaleString("en-US")}.`,
      };
    case "unlinked":
      return {
        tone: "error",
        text: "No Minecraft account is linked to this login.",
        href: "/coins",
        hrefLabel: "Link Minecraft",
      };
    case "no-discord":
      return {
        tone: "error",
        text: "Sign in with Discord to spend coins.",
      };
    case "unavailable":
    case "unknown-item":
      return { tone: "warn", text: "This item is not available yet." };
    default:
      return { tone: "error", text: "The store could not complete this. Nothing was taken — try again." };
  }
}

/**
 * The Buy button. It only charges coins and queues a delivery; the command
 * itself is run in game by the JackLink Paper jar on the item's own server,
 * once the buyer is online there.
 */
export function BuyButton({
  mode,
  itemId,
  available,
  price,
}: {
  mode: CatalogId;
  itemId: string;
  available: boolean;
  price: number;
}) {
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  // Kept across failed attempts so a retry resumes the same purchase instead
  // of charging a second time. Cleared once the outcome is settled.
  const idem = useRef<string | null>(null);

  async function buy() {
    if (busy || !available) return;
    if (status !== "authenticated") {
      void signIn("discord");
      return;
    }
    if (!idem.current) idem.current = crypto.randomUUID();
    setBusy(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, itemId, idem: idem.current }),
      });
      const data = (await res.json()) as PurchaseState;
      setMessage(toMessage(data));
      const settled =
        data.state === "ok" ||
        data.state === "insufficient" ||
        data.state === "unlinked" ||
        data.state === "no-discord" ||
        data.state === "unavailable" ||
        data.state === "unknown-item" ||
        res.status === 400;
      if (settled) idem.current = null;
      if (data.state === "ok") window.dispatchEvent(new Event("jn:coins-refresh"));
    } catch {
      setMessage({
        tone: "error",
        text: "Network problem — nothing was taken. Try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-lg font-semibold text-fg">
          <CoinGlyph className="h-5 w-5 text-accent-ink" />
          {price.toLocaleString("en-US")}
        </span>
        <button
          type="button"
          onClick={() => void buy()}
          disabled={busy || !available}
          className="jn-btn jn-btn-primary !min-h-11 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Working…" : available ? "Buy" : "Coming soon"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-xs leading-relaxed ${TONE_CLASS[message.tone]}`}>
          {message.text}
          {message.href ? (
            <>
              {" "}
              <a href={message.href} className="underline underline-offset-2 hover:text-fg">
                {message.hrefLabel}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
