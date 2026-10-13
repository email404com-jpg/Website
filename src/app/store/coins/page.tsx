import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { store } from "@/lib/store";
import { CoinGlyph } from "@/components/store/coin-icon";

export const metadata: Metadata = { title: "Buy Coins", alternates: { canonical: `${store.url}/coins` } };

export default function Page() {
  return (
    <section className="jn-dark relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 70% at 70% 30%, rgb(215 25 63 / 0.3), transparent 70%)" }} />
      <div aria-hidden="true" className="jn-grain" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link href="/" className="jn-eyebrow inline-flex min-h-11 items-center gap-2 text-fg-subtle transition-colors hover:text-fg">
            <span aria-hidden="true">←</span> All categories
          </Link>
          <p className="jn-eyebrow mt-4 flex items-center gap-3 text-accent-ink">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Store · 03
          </p>
          <h1 className="font-display mt-4 text-[clamp(3.4rem,11vw,8rem)] leading-[0.86] font-black text-hero-ink">
            Buy <span className="text-accent">coins</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg">
            Coin packs will be sold here once payments go live. Purchases are
            final once credited — see the{" "}
            <a href={`${site.url}/terms`} className="text-fg underline decoration-accent underline-offset-4">Terms</a>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={site.discord.url} target="_blank" rel="noopener noreferrer" className="jn-btn jn-btn-primary">
              Get the announcement <span aria-hidden="true">↗</span>
            </a>
            <a href={`${site.url}/coins`} className="jn-btn jn-btn-ghost">Earn coins for free</a>
          </div>
        </div>
        <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center lg:col-span-5" aria-hidden="true">
          <span className="jn-pulse-ring absolute inset-6 rounded-full border border-accent/50" />
          <span className="jn-pulse-ring absolute inset-6 rounded-full border border-accent/30 [animation-delay:1.4s]" />
          <CoinGlyph className="jn-float h-2/3 w-2/3 text-accent-ink drop-shadow-[0_0_40px_rgb(215_25_63/0.5)]" />
        </div>
      </div>
    </section>
  );
}
