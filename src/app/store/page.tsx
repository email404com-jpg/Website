import Image from "next/image";
import Link from "next/link";
import { store } from "@/lib/store";
import { Reveal } from "@/components/reveal";
import { CoinGlyph } from "@/components/store/coin-icon";

export default function StoreHub() {
  return (
    <div className="jn-dark relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 0%, rgb(215 25 63 / 0.22), transparent 70%)" }} />
      <div aria-hidden="true" className="jn-grain" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-8 sm:pt-20 sm:pb-32">
        <p className="jn-eyebrow jn-enter flex items-center gap-3 text-accent-ink">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Jack Network Store
        </p>
        <h1 className="font-display jn-enter mt-5 text-[clamp(3.4rem,11vw,8.5rem)] leading-[0.86] font-black text-hero-ink" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
          Choose your <span className="text-accent">battlefield</span>
        </h1>
        <p className="jn-enter mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg" style={{ "--enter-delay": "160ms" } as React.CSSProperties}>
          One Discord login for the whole network. Pick a mode to spend coins
          on ranks and upgrades, or top up your balance.
        </p>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {store.categories.map((c, i) => (
            <li key={c.id}>
              <Reveal delay={i * 90}>
                <Link
                  href={c.href}
                  className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden border border-line bg-surface p-6 transition-[border-color,transform] duration-500 ease-[var(--ease)] hover:-translate-y-1 hover:border-accent sm:min-h-[30rem] sm:p-8"
                >
                  {c.image ? (
                    <>
                      <Image src={c.image} alt={c.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className={`object-cover transition-transform duration-[1200ms] ease-[var(--ease)] group-hover:scale-110 ${c.id === "survival" ? "jn-mono" : "saturate-[1.2] brightness-[1.15]"}`} />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                    </>
                  ) : (
                    <>
                      <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 35%, rgb(215 25 63 / 0.4), transparent 70%)" }} />
                      <CoinGlyph className="absolute top-[18%] left-1/2 h-40 w-40 -translate-x-1/2 text-accent-ink opacity-90 transition-transform duration-[1200ms] ease-[var(--ease)] group-hover:scale-110 group-hover:rotate-[14deg]" />
                    </>
                  )}

                  <span aria-hidden="true" className="jn-outline font-display relative text-8xl leading-none font-black transition-colors duration-500 group-hover:[-webkit-text-stroke-color:rgb(215_25_63/0.7)]">
                    {c.index}
                  </span>

                  <span className="relative">
                    <span className="font-display block text-5xl leading-[0.9] font-black text-hero-ink sm:text-6xl">{c.name}</span>
                    <span className="mt-3 block text-sm text-fg-muted">{c.tagline}</span>
                    <span className="jn-eyebrow mt-6 inline-flex items-center gap-3 text-accent-ink">
                      Enter
                      <span aria-hidden="true" className="h-px w-8 bg-accent transition-[width] duration-500 group-hover:w-16" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
