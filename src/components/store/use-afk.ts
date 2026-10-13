"use client";

import { useSyncExternalStore } from "react";

/**
 * AFK heartbeat manager.
 *
 * Lives at module level so the heartbeat keeps running while the coins
 * dialog is closed (the dialog unmounts its views when it closes).
 * Beats are POSTed every 30s only while running AND the tab is visible;
 * hiding the tab pauses beats (AdSense + anti-abuse requirement).
 * Every successful beat fires window "jn:coins-refresh" so the header
 * balance updates immediately.
 */

export type AfkState = {
  running: boolean;
  busy: boolean;
  sessionEarned: number;
  todayEarned: number;
  cap: number | null;
  rate: number | null;
  secondsToBeat: number;
  message: string | null;
};

const BEAT_MS = 30_000;
const TICK_MS = 1_000;

const initial: AfkState = {
  running: false,
  busy: false,
  sessionEarned: 0,
  todayEarned: 0,
  cap: null,
  rate: null,
  secondsToBeat: 0,
  message: null,
};

let state: AfkState = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<AfkState>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureTimer();
  ensureInit();
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initial;
}

function fireCoinsRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jn:coins-refresh"));
  }
}

function getTabId(): string {
  try {
    let id = sessionStorage.getItem("jn-afk-tab");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("jn-afk-tab", id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}`;
  }
}

let nextBeatAt = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let initDone = false;

async function beat() {
  if (!state.running) return;
  nextBeatAt = Date.now() + BEAT_MS;
  set({ busy: true });
  try {
    const res = await fetch("/api/afk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tabId: getTabId() }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      state?: string;
      added?: number;
      sessionEarned?: number;
      todayEarned?: number;
      cap?: number;
      rate?: number;
    };

    switch (data.state) {
      case "ok":
        set({
          sessionEarned: data.sessionEarned ?? state.sessionEarned,
          todayEarned: data.todayEarned ?? state.todayEarned,
          cap: data.cap ?? state.cap,
          message: null,
        });
        fireCoinsRefresh();
        break;
      case "restarted":
        set({ sessionEarned: 0, message: null });
        fireCoinsRefresh();
        break;
      case "capped":
        set({
          running: false,
          sessionEarned: 0,
          todayEarned: data.todayEarned ?? state.todayEarned,
          cap: data.cap ?? state.cap,
          message: "Daily cap reached — come back tomorrow.",
        });
        break;
      case "other-tab":
        set({
          running: false,
          sessionEarned: 0,
          message: "AFK earning is already running in another tab.",
        });
        break;
      case "too-fast":
        break;
      case "no-discord":
        set({
          running: false,
          sessionEarned: 0,
          message: "Link your Discord account first.",
        });
        break;
      case "unauthorized":
        set({ running: false, sessionEarned: 0, message: "Sign in to earn AFK coins." });
        break;
      default:
        set({ message: "Couldn't credit this beat — retrying." });
    }
  } catch {
    set({ message: "Connection lost — retrying." });
  } finally {
    set({ busy: false });
  }
}

function ensureTimer() {
  if (timer !== null || typeof window === "undefined") return;
  timer = setInterval(() => {
    if (!state.running) return;
    if (typeof document !== "undefined" && document.hidden) return;
    const left = nextBeatAt - Date.now();
    const secs = Math.max(0, Math.ceil(left / 1000));
    if (secs !== state.secondsToBeat) set({ secondsToBeat: secs });
    if (left <= 0) void beat();
  }, TICK_MS);
}

function ensureInit() {
  if (initDone || typeof window === "undefined") return;
  initDone = true;

  void (async () => {
    try {
      const res = await fetch("/api/afk", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        state?: string;
        todayEarned?: number;
        cap?: number;
        rate?: number;
      };
      if (data.state === "running" || data.state === "idle") {
        set({
          todayEarned: data.todayEarned ?? 0,
          cap: data.cap ?? null,
          rate: data.rate ?? null,
        });
      } else if (data.state === "no-discord") {
        set({ message: "Link your Discord account to earn AFK coins." });
      }
    } catch {
      /* first probe is best-effort */
    }
  })();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.running && Date.now() >= nextBeatAt) void beat();
  });

  window.addEventListener("pagehide", () => {
    if (!state.running) return;
    void fetch("/api/afk", { method: "DELETE", keepalive: true }).catch(() => {});
  });
}

export function startAfk() {
  if (state.running) return;
  set({ running: true, message: null, secondsToBeat: 0 });
  nextBeatAt = Date.now();
  void beat();
}

export function stopAfk() {
  if (!state.running && !state.busy) return;
  set({ running: false, sessionEarned: 0, secondsToBeat: 0, message: null });
  void fetch("/api/afk", { method: "DELETE", cache: "no-store" }).catch(() => {});
}

export function useAfk() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    state: snapshot,
    start: startAfk,
    stop: stopAfk,
  };
}
