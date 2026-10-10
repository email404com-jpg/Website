import { ActionLink } from "@/components/action-link";
import { CopyAddress } from "@/components/copy-address";
import { ServerStatus } from "@/components/server-status";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Topology } from "@/components/topology";
import { VoxelField } from "@/components/voxel-field";
import { TiltPanel } from "@/components/tilt-panel";
import { Reveal } from "@/components/reveal";
import { SectionHeading, Eyebrow } from "@/components/section-heading";
import { FaqItem } from "@/components/faq-item";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top">
        <section className="relative overflow-hidden border-b border-line">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-[0.35]">
              <div className="relative h-full w-full">
                <VoxelField />
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <Eyebrow>{site.domain}</Eyebrow>

                <h1 className="mt-5 text-[1.9rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-fg xs:text-[2.3rem] sm:text-4xl lg:text-[3.1rem]">
                  Practice PvP and survival on one Minecraft server.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
                  Jack Network runs two game modes from a single address. Copy
                  it to join in Minecraft, or open the Discord to meet the
                  community.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                  <CopyAddress />
                  <ActionLink
                    href={site.discord.url}
                    variant="secondary"
                    external
                  >
                    Join the Discord
                  </ActionLink>
                </div>

                <dl className="mt-10 grid max-w-md grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                      Address
                    </dt>
                    <dd className="mt-1 font-mono text-sm break-all text-fg-muted">
                      {site.server.address}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                      Editions
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-fg-muted">
                      {site.server.editions.join(" · ")}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="lg:col-span-5">
                <TiltPanel>
                  <div className="relative border border-line bg-surface p-4 sm:p-6">
                    <Topology />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-line px-4 py-2.5 sm:px-6"
                    >
                      <span className="font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase">
                        Network topology
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-fg-subtle">
                        <span className="jn-blink h-1.5 w-1.5 rounded-full bg-accent" />
                        Live
                      </span>
                    </div>
                  </div>
                </TiltPanel>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-1 sm:px-6">
            <p className="font-mono text-xs tracking-[0.1em] text-fg-subtle uppercase">
              {site.server.address}
            </p>
            <p className="font-mono text-xs tracking-[0.1em] text-fg-subtle uppercase">
              {site.server.editions.join(" · ")} — Coins from chat games,
              Discord, or purchase
            </p>
          </div>
        </section>

        <section id="modes" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Reveal>
              <SectionHeading
                eyebrow="Game modes"
                title="Two ways to play"
                description="Both modes run under the same address. Switch between them without a second install."
              />
            </Reveal>

            <ol className="mt-10 border-t border-line">
              {site.modes.map((mode, index) => (
                <Reveal key={mode.id} delay={index * 80}>
                  <li className="group grid gap-3 border-b border-line py-7 transition-colors duration-[var(--duration)] hover:bg-surface sm:grid-cols-12 sm:gap-6 sm:py-9">
                    <p className="font-mono text-sm text-accent sm:col-span-1">
                      {mode.index}
                    </p>
                    <h3
                      className={`text-xl font-semibold tracking-[-0.01em] text-fg transition-colors duration-[var(--duration)] group-hover:text-accent sm:col-span-4 sm:text-2xl ${
                        index === 1 ? "sm:col-start-3" : ""
                      }`}
                    >
                      {mode.name}
                    </h3>
                    <p className="text-base leading-relaxed text-fg-muted sm:col-span-6">
                      {mode.summary}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="coins" className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Reveal>
              <SectionHeading
                eyebrow="Coins"
                title="Earn or buy — your choice"
                description="Coins work across the server. Get them by playing, by leveling up in Discord, or by buying them."
              />
            </Reveal>

            <div className="mt-10 border-t border-line">
              {site.coins.sources.map((source, i) => (
                <Reveal key={source.id} delay={i * 80}>
                  <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-12 sm:gap-6 sm:py-8">
                    <p className="font-mono text-sm text-accent sm:col-span-1">
                      {source.index}
                    </p>
                    <h3 className="text-lg font-semibold text-fg sm:col-span-4 sm:text-xl">
                      {source.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-fg-muted sm:col-span-7 sm:text-base">
                      {source.summary}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-8">
                <ActionLink href="/coins" variant="secondary">
                  How coins work
                  <span aria-hidden="true">→</span>
                </ActionLink>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="status" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-4">
                <SectionHeading
                  eyebrow="Status"
                  title="Live server status"
                  description="Player counts and version come straight from the server."
                />
                <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
                  If a value cannot be read, it stays empty rather than being
                  estimated.
                </p>
              </Reveal>

              <Reveal className="lg:col-span-8" delay={100}>
                <ServerStatus />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-4">
                <SectionHeading
                  eyebrow="Help"
                  title="Common questions"
                  description="Quick answers about joining, coins, and accounts."
                />
                <div className="mt-6">
                  <ActionLink href="/faq" variant="secondary">
                    View all questions
                    <span aria-hidden="true">→</span>
                  </ActionLink>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-8" delay={100}>
                <div className="border-t border-line">
                  {site.faq.slice(0, 4).map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="join" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Reveal>
              <div className="border border-line bg-surface-raised">
                <div aria-hidden="true" className="h-px w-full bg-accent" />

                <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                  <div className="lg:col-span-7">
                    <Eyebrow>Discord</Eyebrow>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-balance text-fg sm:text-3xl">
                      Join the Jack Network Discord
                    </h2>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-fg-muted">
                      The Discord is where players gather, and where to go if the
                      server gives you trouble.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 lg:col-span-5 lg:items-end">
                    <ActionLink
                      href={site.discord.url}
                      variant="primary"
                      external
                      className="w-full sm:w-auto"
                    >
                      Open Discord
                      <span aria-hidden="true">↗</span>
                    </ActionLink>
                    <CopyAddress variant="secondary" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
