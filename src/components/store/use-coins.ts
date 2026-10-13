"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type CoinsState =
  | { status: "loading" }
  | { status: "ok"; coins: number }
  | { status: "unconfigured" | "unlinked" | "error" };

const POLL_MS = 15_000;

/**
 * Live coin balance from /api/coins.
 * Refreshes: on sign-in, every 15s, when the tab regains focus/visibility,
 * and immediately whenever anything fires window "jn:coins-refresh"
 * (AFK beats, link changes).
 */
export function useCoins() {
  const { status: authStatus } = useSession();
  const [state, setState] = useState<CoinsState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      const data = (await res.json()) as {
        state: string;
        coins?: number;
      };
      if (data.state === "ok" && typeof data.coins === "number") {
        setState({ status: "ok", coins: data.coins });
      } else if (data.state === "unconfigured" || data.state === "unlinked") {
        setState({ status: data.state });
      } else {
        setState({ status: "error" });
      }
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void refresh();
    }, POLL_MS);

    const onCoinsRefresh = () => void refresh();
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };

    window.addEventListener("jn:coins-refresh", onCoinsRefresh);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      window.removeEventListener("jn:coins-refresh", onCoinsRefresh);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authStatus, refresh]);

  return { state, refresh };
}
