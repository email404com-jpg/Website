"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { store } from "@/lib/store";
import { CoinGlyph } from "./coin-icon";
import { useAfk } from "./use-afk";

type View = "menu" | "earn" | "link" | "afk" | "buy";

type LinkState =
  | { state: "loading" }
  | { state: "none" }
  | { state: "pending"; code: string; expiresAt: string }
  | { state: "linked"; username: string | null; uuid: string }
  | { state: "error" };

const I = {
  stroke: "currentColor",
  fill: "none",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true as const, ...I };
  switch (name) {
    case "earn":
      return (
        <svg {...common}>
          <path d="M12 3l2.3 5.2 5.7.5-4.3 3.8 1.3 5.5L12 15l-5 3 1.3-5.5L4 8.7l5.7-.5L12 3Z" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
        </svg>
      );
    case "afk":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    default:
      return <CoinGlyph className={className} />;
  }
}

const TILES: { id: Exclude<View, "menu">; title: string; text: string; icon: string }[] = [
  { id: "earn", title: "How to earn coins", text: "Every way to grow your balance", icon: "earn" },
  { id: "link", title: "Link MC account", text: "Connect your in-game player", icon: "link" },
  { id: "afk", title: "AFK earn coins", text: "Earn while you are away", icon: "afk" },
  { id: "buy", title: "Buy coins", text: "Top up your balance", icon: "buy" },
];

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="jn-eyebrow -ml-2 mb-6 inline-flex min-h-11 items-center gap-2 px-2 text-fg-muted transition-colors hover:text-fg"
    >
      <span aria-hidden="true">←</span> Coins menu
    </button>
  );
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="jn-eyebrow flex items-center gap-3 text-accent-ink">
        <span aria-hidden="true" className="h-px w-8 bg-accent" />
        {eyebrow}
      </p>
      <h3 className="font-display mt-3 text-5xl leading-[0.9] font-black text-fg sm:text-6xl">
        {title}
      </h3>
    </div>
  );
}

/* ─────────── views ─────────── */

function EarnView({ onNav }: { onNav: (v: View) => void }) {
  const rows = [
    { n: "01", t: site.coins.sources[0].name, d: site.coins.sources[0].summary },
    { n: "02", t: site.coins.sources[1].name, d: site.coins.sources[1].summary },
    { n: "03", t: "AFK rewards", d: store.afk.summary, go: "afk" as View },
    { n: "04", t: "Buy coins", d: "Top up directly from the store when payments open.", go: "buy" as View },
  ];
  return (
    <>
      <PanelTitle eyebrow="Coins" title="How to earn" />
      <ul className="mt-8 border-t border-line">
        {rows.map((r) => (
          <li key={r.n} className="border-b border-line">
            <div className="flex items-start gap-5 py-5">
              <span className="jn-outline-accent font-display w-14 shrink-0 text-5xl leading-none font-black">
                {r.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-extrabold tracking-[0.03em] text-fg">
                  {r.t}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{r.d}</p>
                {r.go ? (
                  <button
                    type="button"
                    onClick={() => onNav(r.go!)}
                    className="jn-eyebrow mt-2 inline-flex min-h-11 items-center gap-2 text-accent-ink transition-colors hover:text-fg"
                  >
                    Open <span aria-hidden="true">→</span>
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function LinkView({ onLinked }: { onLinked: () => void }) {
  const [link, setLink] = useState<LinkState>({ state: "loading" });
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/link", { cache: "no-store" });
      if (!res.ok) return setLink({ state: "error" });
      setLink((await res.json()) as LinkState);
    } catch {
      setLink({ state: "error" });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // poll while a code is pending so the panel flips the moment it is confirmed in game
  const pending = link.state === "pending";
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [pending, load]);

  const wasPending = useRef(false);
  useEffect(() => {
    if (link.state === "pending") wasPending.current = true;
    if (link.state === "linked" && wasPending.current) {
      wasPending.current = false;
      onLinked();
    }
  }, [link, onLinked]);

  useEffect(() => {
    if (link.state !== "pending") return;
    const tick = () =>
      setLeft(Math.max(0, Math.floor((new Date(link.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [link]);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/link", { method: "POST" });
      setLink(res.ok ? ((await res.json()) as LinkState) : { state: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    try {
      await fetch("/api/link", { method: "DELETE" });
      setLink({ state: "none" });
      onLinked();
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

  return (
    <>
      <PanelTitle eyebrow="Account" title="Link Minecraft" />

      {link.state === "loading" ? (
        <div className="mt-8 h-32 animate-pulse bg-surface-raised" aria-hidden="true" />
      ) : link.state === "linked" ? (
        <div className="relative mt-8 border border-line-strong bg-surface p-6">
          <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
          <p className="jn-eyebrow flex items-center gap-2 text-success">
            <span className="jn-blink h-2 w-2 rounded-full bg-success" /> Linked
          </p>
          <p className="mt-3 font-display text-4xl font-black text-fg normal-case">
            {link.username ?? "Player"}
          </p>
          <p className="mt-1 font-mono text-xs break-all text-fg-subtle">{link.uuid}</p>
          <button
            type="button"
            onClick={unlink}
            disabled={busy}
            className="jn-btn jn-btn-ghost mt-6 disabled:opacity-50"
          >
            Unlink account
          </button>
        </div>
      ) : link.state === "pending" ? (
        <div className="mt-8">
          <p className="text-sm leading-relaxed text-fg-muted">
            Join the server and run this command. This page updates the moment
            it is confirmed.
          </p>
          <div className="relative mt-5 border border-line-strong bg-surface p-5 sm:p-6">
            <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
            <p className="jn-eyebrow text-fg-subtle">Your link code</p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label={`Code ${link.code.split("").join(" ")}`}>
              {link.code.split("").map((c, i) => (
                <span
                  key={i}
                  className="flex h-14 w-11 items-center justify-center border border-line-strong bg-background font-mono text-3xl font-semibold text-fg sm:w-12"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-5 font-mono text-sm break-all text-accent-ink">/link {link.code}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => copy(`/link ${link.code}`)}
                className="jn-btn jn-btn-primary"
              >
                {copied ? "Copied" : "Copy command"}
              </button>
              <span className="jn-eyebrow text-fg-subtle">
                Expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-sm leading-relaxed text-fg-muted">
            Linking connects your in-game player to this Discord login so coins
            and purchases land on the right account.
          </p>
          <ol className="mt-6 border-t border-line">
            {["Generate a one-time code", "Join play.jacknetwork.in", "Run the /link command shown here"].map((t, i) => (
              <li key={t} className="flex items-center gap-5 border-b border-line py-4">
                <span className="font-display w-10 text-4xl leading-none font-black text-fg-disabled">
                  0{i + 1}
                </span>
                <span className="text-sm text-fg">{t}</span>
              </li>
            ))}
          </ol>
          <button type="button" onClick={generate} disabled={busy} className="jn-btn jn-btn-primary mt-7 disabled:opacity-50">
            Generate link code
          </button>
          {link.state === "error" ? (
            <p className="mt-4 text-sm text-error">Something went wrong. Try again.</p>
          ) : null}
        </div>
      )}
    </>
  );
}

function AfkView() {
  const { state, start, stop } = useAfk();

  return (
    <>
      <PanelTitle eyebrow="Passive" title="AFK earning" />
      <div className="relative mt-8 flex items-center gap-6 overflow-hidden border border-line-strong bg-surface p-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center" aria-hidden="true">
          <span className="jn-pulse-ring absolute inset-0 rounded-full border border-accent/60" />
          <span className="jn-pulse-ring absolute inset-0 rounded-full border border-accent/40 [animation-delay:1.2s]" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent/10 text-accent-ink">
            <Icon name="afk" className="h-7 w-7" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-fg-muted">{store.afk.summary}</p>
          <p className="font-mono mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle tabular-nums">
            <span>
              Session <span className="text-fg">+{state.sessionEarned.toLocaleString("en-US")}</span>
            </span>
            <span>
              Today{" "}
              <span className="text-fg">
                {state.todayEarned.toLocaleString("en-US")}
                {state.cap !== null ? ` / ${state.cap.toLocaleString("en-US")}` : ""}
              </span>
            </span>
            {state.rate !== null ? <span>Rate {state.rate}/min</span> : null}
            {state.running ? (
              <span className={state.secondsToBeat <= 5 ? "text-accent-ink" : undefined}>
                Next credit in {state.secondsToBeat}s
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {state.running ? (
        <button type="button" onClick={stop} disabled={state.busy} className="jn-btn jn-btn-ghost mt-6 disabled:opacity-50">
          Stop AFK earning
        </button>
      ) : (
        <button type="button" onClick={start} disabled={state.busy} className="jn-btn jn-btn-primary mt-6 disabled:opacity-50">
          Start AFK earning
        </button>
      )}

      {state.message ? (
        <p className="mt-4 text-sm text-error" role="status">
          {state.message}
        </p>
      ) : null}

      <ol className="mt-6 border-t border-line">
        {store.afk.steps.map((t, i) => (
          <li key={t} className="flex items-center gap-5 border-b border-line py-4">
            <span className="font-display w-10 text-4xl leading-none font-black text-fg-disabled">0{i + 1}</span>
            <span className="text-sm text-fg">{t}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-fg-subtle">{store.afk.note}</p>
    </>
  );
}

function BuyView() {
  return (
    <>
      <PanelTitle eyebrow="Store" title="Buy coins" />
      <div className="relative mt-8 overflow-hidden border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <div aria-hidden="true" className="absolute -right-10 -bottom-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
        <p className="jn-eyebrow text-accent-ink">Opening soon</p>
        <p className="font-display relative mt-3 text-4xl font-black text-fg">Payments are being integrated</p>
        <p className="relative mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
          Coin packs will be sold right here once payment goes live. Watch
          Discord for the announcement. Until then you can earn coins for free.
        </p>
        <a href={site.discord.url} target="_blank" rel="noopener noreferrer" className="jn-btn jn-btn-primary relative mt-6">
          Open Discord <span aria-hidden="true">↗</span>
        </a>
      </div>
    </>
  );
}

/* ─────────── dialog ─────────── */

export function CoinsDialog({
  open,
  onClose,
  balanceText,
  onLinked,
}: {
  open: boolean;
  onClose: () => void;
  balanceText: string;
  onLinked: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<View>("menu");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Coins"
      onClose={() => {
        setView("menu");
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="jn-dialog jn-dark m-auto max-h-[90svh] w-[min(94vw,680px)] overflow-hidden border border-line-strong bg-background p-0 text-fg backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <span aria-hidden="true" className="block h-[2px] w-full bg-accent" />
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-7">
        <p className="flex items-center gap-2.5 font-mono text-sm text-fg">
          <CoinGlyph className="h-5 w-5 text-accent-ink" />
          <span className="text-fg-subtle">Coins</span> {balanceText}
        </p>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center text-fg-muted transition-colors hover:text-fg"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" {...I} aria-hidden="true">
            <path d="M3 3l10 10M13 3 3 13" />
          </svg>
        </button>
      </div>

      <div className="max-h-[calc(90svh-5.5rem)] overflow-y-auto px-5 py-7 sm:px-7 sm:py-9">
        {view === "menu" ? (
          <>
            <PanelTitle eyebrow="Wallet" title="Your coins" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {TILES.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setView(t.id)}
                    className="group relative flex h-full min-h-36 w-full flex-col items-start justify-between overflow-hidden border border-line bg-surface p-5 text-left transition-[border-color,transform,background-color] duration-300 ease-[var(--ease)] hover:-translate-y-0.5 hover:border-accent hover:bg-surface-raised"
                  >
                    <span aria-hidden="true" className="jn-outline font-display absolute -top-2 right-3 text-7xl leading-none font-black transition-colors duration-300 group-hover:[-webkit-text-stroke-color:rgb(215_25_63/0.5)]">
                      0{i + 1}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center border border-line-strong text-accent-ink transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                      <Icon name={t.icon} />
                    </span>
                    <span>
                      <span className="font-display block text-2xl leading-none font-extrabold tracking-[0.03em] text-fg">
                        {t.title}
                      </span>
                      <span className="mt-1.5 block text-xs text-fg-muted">{t.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Back onClick={() => setView("menu")} />
            {view === "earn" ? <EarnView onNav={setView} /> : null}
            {view === "link" ? <LinkView onLinked={onLinked} /> : null}
            {view === "afk" ? <AfkView /> : null}
            {view === "buy" ? <BuyView /> : null}
          </>
        )}
      </div>
    </dialog>
  );
}
