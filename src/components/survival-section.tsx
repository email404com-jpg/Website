import Image from "next/image";
import { site } from "@/lib/site";
import { ActionLink } from "@/components/action-link";
import { TiltPanel } from "@/components/tilt-panel";
import { Reveal } from "@/components/reveal";

export function SurvivalSection() {
  const mode = site.modes[1];

  return (
    <section
      id="survival"
      className="jn-dark relative overflow-hidden border-b border-line"
    >
      {/* soft crimson key from the lower left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 10% 100%, rgb(215 25 63 / 0.14), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Art — left, angled frame */}
          <Reveal className="lg:col-span-7">
            <TiltPanel>
              <figure className="jn-art-frame group relative m-0 block">
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[16/11]"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 56px 100%, 0 calc(100% - 56px))",
                  }}
                >
                  <Image
                    src={mode.image}
                    alt={mode.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="jn-mono object-cover object-center"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgb(8 9 11 / 0.85) 0%, rgb(8 9 11 / 0) 45%, transparent 70%)",
                    }}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5 sm:p-7">
                    <span className="font-mono text-xs whitespace-nowrap text-fg sm:text-sm">
                      {site.server.address}
                    </span>
                    <span className="jn-eyebrow text-fg-muted">
                      Java · Bedrock
                    </span>
                  </figcaption>
                </div>
              </figure>
            </TiltPanel>
          </Reveal>

          {/* Copy — right */}
          <Reveal className="relative lg:col-span-5" delay={100}>
            <p
              aria-hidden="true"
              className="jn-outline font-display pointer-events-none absolute -top-28 right-0 -z-0 text-[8rem] leading-none font-black opacity-60 sm:-top-36 sm:text-[11rem]"
            >
              {mode.index}
            </p>

            <div className="relative">
              <p className="jn-eyebrow flex items-center gap-3 text-accent-ink">
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                Mode {mode.index} · Open world
              </p>

              <h2 className="font-display mt-5 text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.86] font-black tracking-[0.005em] text-fg">
                {mode.name}
              </h2>

              <p className="font-display mt-5 text-2xl font-extrabold tracking-[0.04em] text-accent-ink sm:text-3xl">
                {mode.tagline}
              </p>

              <p className="mt-4 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
                {mode.description}
              </p>

              <ul className="mt-8 grid gap-0 border-t border-line">
                {mode.traits.map((trait) => (
                  <li
                    key={trait}
                    className="flex items-center gap-3 border-b border-line py-3.5 text-sm text-fg-muted"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent" />
                    {trait}
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <ActionLink href="#server" variant="secondary" className="w-full sm:w-auto">
                  How to join
                  <span aria-hidden="true" className="jn-arrow">→</span>
                </ActionLink>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
