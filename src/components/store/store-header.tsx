"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { site } from "@/lib/site";
import { AuthNav } from "@/components/auth-nav";
import { CoinGlyph } from "./coin-icon";
import { CoinsDialog } from "./coins-dialog";
import { useCoins } from "./use-coins";

function CoinButton() {
  const { state, refresh } = useCoins();
  const [open, setOpen] = useState(false);

  const value =
    state.status === "ok"
      ? state.coins.toLocaleString("en-US")
      : state.status === "loading"
        ? "…"
        : "—";
  const hint =
    state.status === "unlinked"
      ? "Link your Minecraft account to see your balance"
      : state.status === "unconfigured" || state.status === "error"
        ? `Balance unavailable${state.status === "error" && state.reason ? ` (${state.reason})` : ""}`
        : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={hint}
        aria-label={`Coins: ${value}. Open coins menu`}
        className="group inline-flex h-11 items-center gap-2.5 rounded-sm border border-line-strong bg-white/[0.03] px-3.5 transition-[border-color,background-color] duration-[var(--duration)] hover:border-accent hover:bg-accent/10"
      >
        <CoinGlyph className="h-[18px] w-[18px] text-accent-ink transition-transform duration-500 group-hover:rotate-[20deg]" />
        <span className="jn-eyebrow text-fg-subtle">Coins:</span>
        <span className="font-mono text-sm font-semibold text-fg tabular-nums">{value}</span>
      </button>
      <CoinsDialog
        open={open}
        onClose={() => setOpen(false)}
        balanceText={value}
        onLinked={refresh}
      />
    </>
  );
}

export function StoreHeader() {
  const { status } = useSession();

  return (
    <header className="jn-dark sticky top-0 z-40 border-b border-line bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-8">
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-3" aria-label="Jack Network store home">
          <span className="relative block h-8 w-[38px]">
            <Image src="/logo-jn-sm.webp" alt="" fill priority unoptimized sizes="38px" className="object-contain transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span className="font-display hidden text-[1.35rem] leading-none font-extrabold tracking-[0.06em] text-fg xs:inline">
            Jack <span className="text-accent">Store</span>
          </span>
        </Link>

        <a
          href={site.url}
          className="jn-eyebrow ml-3 hidden min-h-11 items-center gap-2 text-fg-subtle transition-colors hover:text-fg md:inline-flex"
        >
          <span aria-hidden="true">←</span> jacknetwork.in
        </a>

        <div className="ml-auto flex items-center gap-2">
          {status === "authenticated" ? <CoinButton /> : null}
          <AuthNav externalLogin />
        </div>
      </div>
    </header>
  );
}
