import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/store";
import { AfkClient } from "@/components/store/afk-client";
import { AdSlot } from "@/components/store/ad-slot";

export const metadata: Metadata = {
  title: "AFK Coins",
  description: "Keep this page open and earn coins every minute.",
  alternates: { canonical: `${store.url}/afk` },
};

export default function Page() {
  return (
    <section className="jn-dark relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgb(215 25 63 / 0.28), transparent 70%)" }} />
      <div aria-hidden="true" className="jn-grain" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
        <Link href="/" className="jn-eyebrow inline-flex min-h-11 items-center gap-2 text-fg-subtle transition-colors hover:text-fg">
          <span aria-hidden="true">←</span> Store
        </Link>
        <p className="jn-eyebrow mt-4 flex items-center gap-3 text-accent-ink">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Passive earning
        </p>
        <h1 className="font-display mt-4 text-[clamp(3.2rem,11vw,7rem)] leading-[0.86] font-black text-hero-ink">
          AFK <span className="text-accent">coins</span>
        </h1>
        <AfkClient />
        <AdSlot className="mt-10" />
      </div>
    </section>
  );
}
