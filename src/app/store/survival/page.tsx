import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/lib/store";
import { Catalog } from "@/components/store/catalog";

export const metadata: Metadata = { title: "Survival", alternates: { canonical: `${store.url}/survival` } };

export default function Page() {
  const cat = store.categories[1];
  return (
    <>
      <section className="jn-dark relative isolate overflow-hidden border-b border-line">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image src={cat.image!} alt="" fill priority sizes="100vw" className="jn-mono object-cover opacity-45" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, var(--scrim-strong) 0%, var(--scrim-mid) 55%, var(--scrim-soft) 100%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, var(--background), transparent)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-20">
          <Link href="/" className="jn-eyebrow inline-flex min-h-11 items-center gap-2 text-fg-subtle transition-colors hover:text-fg">
            <span aria-hidden="true">←</span> All categories
          </Link>
          <p className="jn-eyebrow jn-enter mt-4 flex items-center gap-3 text-accent-ink">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Store · {cat.index}
          </p>
          <h1 className="font-display jn-enter mt-4 text-[clamp(3.4rem,11vw,8rem)] leading-[0.86] font-black text-hero-ink" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
            {cat.name}
          </h1>
          <p className="jn-enter mt-5 max-w-lg text-base text-fg-muted sm:text-lg" style={{ "--enter-delay": "160ms" } as React.CSSProperties}>
            {cat.tagline}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display mb-8 text-4xl font-black text-fg sm:text-5xl">Ranks</h2>
        <Catalog items={store.catalog.survival.ranks} mode="Survival" />
      </section>
    </>
  );
}
