"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type CoinsState =
  | { status: "loading" }
  | { status: "ok"; coins: number }
  | { status: "unconfigured" | "unlinked" }
  | { status: "error"; reason?: string };

/** Live coin balance from /api/coins: refreshes every 1s while the tab is visible (the server caches upstream reads for 2s, so this stays cheap) and on demand. */
export function useCoins() {
  const { status: authStatus } = useSession();
  const [state, setState] = useState<CoinsState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = (await res.json()) as {
        state: string;
        coins?: number;
        reason?: string;
      };
      if (data.state === "ok" && typeof data.coins === "number") {
        setState({ status: "ok", coins: data.coins });
      } else if (data.state === "unconfigured" || data.state === "unlinked") {
        setState({ status: data.state });
      } else {
        setState({ status: "error", reason: data.reason });
      }
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!timer) timer = setInterval(refresh, 1000);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
        start();
      } else {
        stop();
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    const onPing = () => void refresh();
    window.addEventListener("jn:coins-refresh", onPing);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("jn:coins-refresh", onPing);
    };
  }, [authStatus, refresh]);

  return { state, refresh };
}
