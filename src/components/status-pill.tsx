"use client";

import { useEffect, useState } from "react";

type Payload = {
  state: "ok" | "unconfigured" | "error";
  online?: boolean;
  players?: { online: number; max: number };
  version?: string;
};

export function StatusPill() {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = () =>
      fetch("/api/server", { cache: "no-store", signal: controller.signal })
        .then((res) => res.json())
        .then((data: Payload) => {
          if (!cancelled) setPayload(data);
        })
        .catch(() => {
          if (!cancelled) setPayload({ state: "error" });
        });

    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const loading = payload === null;
  const online = payload?.state === "ok" && payload.online;

  const dot = online ? "bg-success" : "bg-fg-disabled";

  let text = "Checking server";
  if (!loading) {
    if (online) {
      const players = payload?.players;
      text = players
        ? `Online — ${players.online} of ${players.max} playing`
        : "Online";
    } else if (payload?.state === "ok") {
      text = "Server offline";
    } else {
      text = "Status unavailable";
    }
  }

  return (
    <a
      href="/status"
      className="inline-flex min-h-11 items-center gap-2.5 rounded-sm border border-line-strong bg-white/[0.03] px-3.5 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase transition-colors duration-[var(--duration)] hover:border-fg-muted hover:text-fg"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${dot} ${online ? "jn-blink" : ""} ${loading ? "animate-pulse" : ""}`}
      />
      <span className="whitespace-nowrap">{text}</span>
    </a>
  );
}
