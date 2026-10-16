"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { loginUrl } from "@/lib/login-url";
import { CoinGlyph } from "./coin-icon";

type Snap = { rate: number; cap: number; dayCoins: number; carry: number };
type Beat = Snap & { state: string; awarded?: number; reason?: string };

const BEAT_MS = 30_000;

export function AfkClient() {
  const { status } = useSession();
  const [snap, setSnap] = useState<Snap | null>(null);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [earned, setEarned] = useState(0);
  const [sec, setSec] = useState(0); // seconds into the current minute
  const tabId = useRef("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tabId.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/afk", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Snap & { state: string }) => {
        setSnap(d);
        if (d.state === "unconfigured") setNote("AFK earning is not available right now.");
      })
      .catch(() => {});
  }, [status]);

  const apply = useCallback((d: Beat) => {
    setSnap({ rate: d.rate, cap: d.cap, dayCoins: d.dayCoins, carry: d.carry });
    setSec(d.carry % 60);
    if (d.awarded) {
      setEarned((e) => e + d.awarded!);
      window.dispatchEvent(new Event("jn:coins-refresh"));
    }
    if (d.state === "other-tab") {
      setRunning(false);
      setNote("AFK is already running in another tab. Close it or press stop there first.");
    } else if (d.state === "capped") {
      setRunning(false);
      setNote("You hit today's AFK limit. It resets at 00:00 UTC.");
    } else if (d.state === "error") {
      setNote(
        d.reason
          ? `Could not credit coins just now (${d.reason}). We will retry on the next check-in.`
          : "Could not credit coins just now. We will retry on the next check-in.",
      );
    } else if (d.state === "signed-out") {
      setRunning(false);
      setNote("Your session expired. Sign in again.");
    } else {
      setNote(null);
    }
  }, []);

  const beat = useCallback(async () => {
    try {
      const res = await fetch("/api/afk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tabId: tabId.current }),
      });
      apply((await res.json()) as Beat);
    } catch {
      setNote("Connection problem. Retrying…");
    }
  }, [apply]);

  // heartbeat only while running AND the tab is visible
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState !== "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const active = running && !hidden;
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    // Send the first beat, then start the heartbeat only after it resolves.
    // The server sets the minute's baseline (lastBeat) when that first beat is
    // processed; anchoring the interval to its response guarantees every later
    // gap is >= 30s, so the minute completes on the 3rd beat (~60s) instead of
    // falling a fraction short and slipping a whole extra interval (~90s).
    void beat().finally(() => {
      if (cancelled) return;
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(beat, BEAT_MS);
    });
    const tick = setInterval(() => setSec((s) => (s + 1) % 60), 1000);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
      clearInterval(tick);
    };
  }, [active, beat]);

  async function stop() {
    setRunning(false);
    try {
      await fetch("/api/afk", { method: "DELETE", keepalive: true });
    } catch {
      /* ignore */
    }
  }

  if (status === "loading") return <div className="mt-10 h-64 animate-pulse bg-surface-raised" aria-hidden="true" />;

  if (status !== "authenticated") {
    return (
      <div className="relative mt-10 border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="text-fg-muted">Sign in with Discord to earn coins while you are away.</p>
        <a href={typeof window === "undefined" ? "#" : loginUrl()} onClick={(e) => { e.preventDefault(); window.location.href = loginUrl(); }} className="jn-btn jn-btn-primary mt-6">
          Login with Discord
        </a>
      </div>
    );
  }

  const rate = snap?.rate ?? 2;
  const cap = snap?.cap ?? 1440;
  const day = snap?.dayCoins ?? 0;
  const pct = Math.min(100, (sec / 60) * 100);

  return (
    <div className="mt-10">
      <div className="relative overflow-hidden border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <div aria-hidden="true" className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            {active ? (
              <>
                <span className="jn-pulse-ring absolute inset-0 rounded-full border border-accent/60" />
                <span className="jn-pulse-ring absolute inset-0 rounded-full border border-accent/40 [animation-delay:1.2s]" />
              </>
            ) : null}
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" className="text-line-strong" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap={pct > 0 ? "round" : "butt"} strokeDasharray={`${(pct / 100) * 289} 289`} className="text-accent transition-[stroke-dasharray] duration-1000 ease-linear" />
            </svg>
            <CoinGlyph className={`h-14 w-14 text-accent-ink ${active ? "jn-float" : "opacity-60"}`} />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="jn-eyebrow text-fg-subtle">
              {active ? "Earning now" : running ? "Paused — tab hidden" : "Ready"}
            </p>
            <p className="font-display mt-1 text-5xl leading-none font-black text-fg">
              +{rate} <span className="text-accent">coins</span>
              <span className="text-2xl font-extrabold text-fg-subtle"> / minute</span>
            </p>
            {running ? (
              <p className="mt-3 font-mono text-sm text-fg-muted tabular-nums">
                Next coins in {String(Math.max(0, 59 - sec)).padStart(2, "0")}s
              </p>
            ) : (
              <p className="mt-3 font-mono text-sm text-fg-subtle">
                Press start to earn
              </p>
            )}
            <div className="mt-6">
              {running ? (
                <button type="button" onClick={stop} className="jn-btn jn-btn-ghost">Stop</button>
              ) : (
                <button type="button" onClick={() => { setNote(null); setRunning(true); }} className="jn-btn jn-btn-primary">
                  Start AFK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
        <div className="bg-background p-4 sm:p-5">
          <dt className="jn-eyebrow text-fg-subtle">This session</dt>
          <dd className="font-display mt-1 text-4xl font-black text-fg tabular-nums">{earned}</dd>
        </div>
        <div className="bg-background p-4 sm:p-5">
          <dt className="jn-eyebrow text-fg-subtle">Today</dt>
          <dd className="font-display mt-1 text-4xl font-black text-fg tabular-nums">
            {day}<span className="text-xl text-fg-subtle"> / {cap}</span>
          </dd>
        </div>
      </dl>

      {note ? <p role="status" className="mt-4 text-sm text-accent-ink">{note}</p> : null}

      <ul className="mt-8 space-y-2 text-sm leading-relaxed text-fg-muted">
        <li>Keep this tab open and visible. Coins pause when you switch tabs or minimise the window.</li>
        <li>One tab at a time. The daily limit resets at 00:00 UTC.</li>
        <li>Coins are credited to your Discord account automatically.</li>
      </ul>
    </div>
  );
}
