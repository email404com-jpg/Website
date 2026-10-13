import Image from "next/image";
import { site } from "@/lib/site";
import { ActionLink } from "@/components/action-link";
import { Reveal } from "@/components/reveal";

const EMBERS = [
  { left: 8, delay: 0, dur: 7.5, drift: 26, size: 3 },
  { left: 19, delay: 2.2, dur: 9, drift: -18, size: 2 },
  { left: 33, delay: 4.5, dur: 8, drift: 12, size: 2.5 },
  { left: 47, delay: 1.2, dur: 10, drift: 30, size: 3 },
  { left: 62, delay: 3.4, dur: 7, drift: -22, size: 2 },
  { left: 76, delay: 5.6, dur: 9.5, drift: 16, size: 2.5 },
  { left: 90, delay: 0.8, dur: 8.5, drift: -14, size: 3 },
];

export function PracticePvpSection() {
  const mode = site.modes[0];

  return (
    <section
      id="practice-pvp"
      className="jn-dark relative isolate overflow-hidden border-b border-line"
    >
      {/* Full-bleed Nether art, darkened */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={mode.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[30%_50%] saturate-[1.25] brightness-[1.35]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(95deg, var(--scrim-strong) 0%, rgb(8 9 11 / 0.7) 40%, rgb(8 9 11 / 0.3) 78%, rgb(8 9 11 / 0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-28"
          style={{
            background: "linear-gradient(to bottom, var(--background), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background: "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="jn-ember absolute bottom-[-12px] rounded-full bg-accent-hover"
            style={
              {
                left: `${e.left}%`,
                width: e.size,
                height: e.size,
                boxShadow: "0 0 8px 1px rgb(215 25 63 / 0.5)",
                "--dur": `${e.dur}s`,
                "--delay": `${e.delay}s`,
                "--drift": `${e.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Oversized numeral */}
      <p
        aria-hidden="true"
        className="jn-outline font-display pointer-events-none absolute -right-4 -bottom-[0.2em] text-[clamp(12rem,28vw,28rem)] opacity-60 leading-[0.78] font-black"
      >
        {mode.index}
      </p>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32 lg:py-40">
        <Reveal>
          <p className="jn-eyebrow flex items-center gap-3 text-accent-ink">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Mode {mode.index} · Competitive
          </p>

          <h2 className="font-display mt-5 text-[clamp(3.6rem,12vw,9.5rem)] leading-[0.84] font-black tracking-[0.005em] text-hero-ink">
            {mode.name}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6" delay={80}>
            <p className="font-display text-2xl font-extrabold tracking-[0.04em] text-accent-ink sm:text-3xl">
              {mode.tagline}
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg">
              {mode.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionLink href="/status" variant="primary" className="w-full sm:w-auto">
                See live status
                <span aria-hidden="true" className="jn-arrow">→</span>
              </ActionLink>
              <ActionLink href="#server" variant="secondary" className="w-full sm:w-auto">
                How to join
              </ActionLink>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={160}>
            <ul className="border-t border-line-strong">
              {mode.traits.map((trait, i) => (
                <li
                  key={trait}
                  className="flex items-center justify-between gap-4 border-b border-line-strong py-5"
                >
                  <span className="font-display text-2xl font-extrabold tracking-[0.03em] text-fg">
                    {trait}
                  </span>
                  <span className="font-mono text-xs text-accent-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
