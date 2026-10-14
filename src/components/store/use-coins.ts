"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type CoinsState =
  | { status: "loading" }
  | { status: "ok"; coins: number }
  | { status: "unconfigured" | "unlinked" }
  | { status: "error"; reason?: string };

/** Live coin balance from /api/coins, refreshed every 30s and on demand. */
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
    const id = setInterval(refresh, 30000);
    const onPing = () => void refresh();
    window.addEventListener("jn:coins-refresh", onPing);
    return () => {
      clearInterval(id);
      window.removeEventListener("jn:coins-refresh", onPing);
    };
  }, [authStatus, refresh]);

  return { state, refresh };
}
