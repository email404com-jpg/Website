"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type Payload = {
  state: "ok" | "unconfigured" | "error";
  online?: boolean;
  players?: { online: number; max: number };
  version?: string;
};

type Phase = "loading" | "ready";

export function ServerStatus() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch("/api/server", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((data: Payload) => {
        if (cancelled) return;
        setPayload(data);
        setPhase("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setPayload({ state: "error" });
        setPhase("ready");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setPhase("loading");
    setAttempt((n) => n + 1);
  }

  const showPlayers =
    payload?.state === "ok" && payload.players !== undefined;

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-fg-muted">
          Server status
        </h2>

        {phase === "loading" ? (
          <span className="inline-flex items-center gap-2 text-xs text-fg-subtle">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            Checking
          </span>
        ) : payload?.state === "ok" && payload.online ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-success">
            <span className="jn-blink h-2 w-2 rounded-full bg-success" />
            Online
          </span>
        ) : payload?.state === "ok" ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-fg-muted">
            <span className="h-2 w-2 rounded-full bg-fg-disabled" />
            Offline
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-fg-subtle">
            <span className="h-2 w-2 rounded-full bg-fg-disabled" />
            Unavailable
          </span>
        )}
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-8">
        {phase === "loading" ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="h-8 w-40 bg-surface-raised" />
            <div className="h-4 w-56 bg-surface-raised" />
            <div className="h-4 w-32 bg-surface-raised" />
          </div>
        ) : payload?.state === "ok" ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                Players
              </p>
              <p className="mt-2 font-mono text-2xl text-fg">
                {showPlayers ? (
                  <>
                    {payload.players?.online}
                    <span className="text-fg-subtle">
                      {" / "}
                      {payload.players?.max}
                    </span>
                  </>
                ) : (
                  <span className="text-fg-subtle">—</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                Version
              </p>
              <p className="mt-2 font-mono text-2xl text-fg">
                {payload.version ?? <span className="text-fg-subtle">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                Address
              </p>
              <p className="mt-2 font-mono text-base break-all text-fg sm:text-lg">
                {site.server.address}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl">
            <p className="text-lg text-fg">
              {payload?.state === "unconfigured"
                ? "Live status is not connected yet."
                : "Status service did not respond."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {payload?.state === "unconfigured"
                ? "Player counts and version will appear here once the server endpoint is wired up. Nothing below is estimated."
                : "Nothing is shown because the check failed. Retry, or open the address directly in Minecraft."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line-strong bg-surface px-5 text-sm font-semibold text-fg-muted transition-[border-color,color,transform] duration-[var(--duration)] ease-[var(--ease)] hover:border-accent hover:text-fg active:scale-[0.98]"
            >
              Retry check
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
