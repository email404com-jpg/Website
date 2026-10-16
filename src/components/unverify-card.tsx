"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth-buttons";

type UnverifyState =
  | { state: "signed-out" }
  | { state: "loading" }
  | { state: "none" }
  | { state: "linked"; username: string | null; uuid: string | null }
  | { state: "pending"; code: string; expiresAt: string; username?: string | null }
  | { state: "error" };

const STEPS = [
  "Generate a one-time code",
  "Join play.jacknetwork.in",
  "Run the /unverify command shown here",
];

function Skeleton() {
  return <div className="h-40 animate-pulse bg-surface-raised" aria-hidden="true" />;
}

/**
 * The /unverify page body. Same code-card treatment as "Link Minecraft" in
 * the coins dialog: mint a 10-minute code, run it in game, the link is cut.
 */
export function UnverifyCard() {
  const { status } = useSession();
  const [data, setData] = useState<UnverifyState>({ state: "loading" });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/unverify", { cache: "no-store" });
      if (res.status === 401) return setData({ state: "signed-out" });
      if (!res.ok) return setData({ state: "error" });
      setData((await res.json()) as UnverifyState);
    } catch {
      setData({ state: "error" });
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [status, load]);

  const pending = data.state === "pending";
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [pending, load]);

  const wasPending = useRef(false);
  useEffect(() => {
    if (data.state === "pending") wasPending.current = true;
    if (data.state === "none" && wasPending.current) {
      wasPending.current = false;
      setDone(true);
    }
  }, [data]);

  useEffect(() => {
    if (data.state !== "pending") return;
    const tick = () =>
      setLeft(Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/unverify", { method: "POST" });
      setData(res.ok ? ((await res.json()) as UnverifyState) : { state: "error" });
    } catch {
      setData({ state: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (status === "loading") return <Skeleton />;

  if (status === "unauthenticated" || data.state === "signed-out") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow text-fg-subtle">Account</p>
        <h2 className="mt-3 font-display text-3xl font-black uppercase text-fg">
          Sign in first
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
          Unverify is tied to the Discord account the Minecraft player is linked
          to. Sign in and a one-time code will appear here.
        </p>
        <div className="mt-6">
          <SignInButton />
        </div>
      </section>
    );
  }

  if (data.state === "loading") return <Skeleton />;

  if (done || data.state === "none") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow flex items-center gap-2 text-success">
          <span className="jn-blink h-2 w-2 rounded-full bg-success" />{" "}
          {done ? "Unverified" : "Not linked"}
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
          {done
            ? "Your Minecraft account is disconnected. Coins and purchases stay on this Discord account — link again whenever you want."
            : "No Minecraft account is linked to this Discord login, so there is nothing to unverify."}
        </p>
        <a href="/coins" className="jn-btn jn-btn-ghost mt-6 inline-flex">
          Back to coins
        </a>
      </section>
    );
  }

  if (data.state === "error") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow text-error">Error</p>
        <p className="mt-3 text-sm text-fg-muted">
          Something went wrong loading your link status. Refresh and try again.
        </p>
        <button type="button" onClick={() => void load()} className="jn-btn jn-btn-ghost mt-6">
          Retry
        </button>
      </section>
    );
  }

  if (data.state === "pending") {
    const command = `/unverify ${data.code}`;
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow text-fg-subtle">Your unverify code</p>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Join the server and run this command. This page updates the moment it
          is confirmed in game.
        </p>

        <div
          className="mt-5 flex flex-wrap gap-2"
          aria-label={`Code ${data.code.split("").join(" ")}`}
        >
          {data.code.split("").map((c, i) => (
            <span
              key={i}
              className="flex h-14 w-11 items-center justify-center border border-line-strong bg-background font-mono text-3xl font-semibold text-fg sm:w-12"
            >
              {c}
            </span>
          ))}
        </div>

        <p className="mt-5 font-mono text-sm break-all text-accent-ink">{command}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void copy(command)} className="jn-btn jn-btn-primary">
            {copied ? "Copied" : "Copy command"}
          </button>
          <span className="jn-eyebrow text-fg-subtle">
            Expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        </div>
      </section>
    );
  }

  // state === "linked" — show which account, then mint a code.
  return (
    <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
      <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
      <p className="jn-eyebrow flex items-center gap-2 text-success">
        <span className="jn-blink h-2 w-2 rounded-full bg-success" /> Linked
      </p>
      <p className="mt-3 font-display text-4xl font-black uppercase text-fg">
        {data.username ?? "Player"}
      </p>
      <p className="mt-1 font-mono text-xs break-all text-fg-subtle">{data.uuid}</p>

      <p className="mt-6 max-w-prose text-sm leading-relaxed text-fg-muted">
        Unverify disconnects this Minecraft player from your Discord login. Coins
        and any past purchases stay on your account. The code below works once
        and expires after 10 minutes.
      </p>

      <ol className="mt-6 border-t border-line">
        {STEPS.map((t, i) => (
          <li key={t} className="flex items-center gap-5 border-b border-line py-4">
            <span className="font-display w-10 text-4xl leading-none font-black text-fg-disabled">
              0{i + 1}
            </span>
            <span className="text-sm text-fg">{t}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="jn-btn jn-btn-primary mt-7 disabled:opacity-50"
      >
        Generate unverify code
      </button>
    </section>
  );
}
