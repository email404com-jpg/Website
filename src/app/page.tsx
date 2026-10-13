import type { CSSProperties } from "react";
import Link from "next/link";
import { ActionLink } from "@/components/action-link";
import { CopyAddress } from "@/components/copy-address";
import { ServerStatus } from "@/components/server-status";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { Eyebrow } from "@/components/section-heading";
import { FaqItem } from "@/components/faq-item";
import { HeroScene, SceneScrim } from "@/components/hero-scene";
import { HeroEmblem } from "@/components/hero-emblem";
import { StatusPill } from "@/components/status-pill";
import { PracticePvpSection } from "@/components/practice-pvp-section";
import { SurvivalSection } from "@/components/survival-section";
import { site } from "@/lib/site";

function CoinIcon({ name }: { name: string }) {
  const shared = "h-5 w-5 shrink-0 text-accent";
  if (name === "chat") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={shared}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
        <path d="M8 11h8M8 14h5" />
      </svg>
    );
  }
  if (name === "discord") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={shared}
        fill="currentColor"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.68 15.383c-.953 0-1.72-.87-1.72-1.937 0-1.068.75-1.938 1.72-1.938.976 0 1.73.876 1.72 1.938 0 1.068-.75 1.937-1.72 1.937Zm6.64 0c-.953 0-1.72-.87-1.72-1.937 0-1.068.75-1.938 1.72-1.938.976 0 1.73.876 1.72 1.938 0 1.068-.744 1.937-1.72 1.937Z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={shared}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="7" rx="8" ry="3.2" />
      <path d="M4 7v5c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2V7" />
      <path d="M4 12v5c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2v-5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top">
        {/* ══════════ Hero ══════════ */}
        <section className="jn-dark relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
          <HeroScene src="/media/hero-mountains.webp" alt="" opacity={0.7} />
          <SceneScrim />

          {/* crimson key light behind the emblem + light shafts + grain */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 48% 62% at 76% 46%, rgb(215 25 63 / 0.28), transparent 70%)",
            }}
          />
          <div aria-hidden="true" className="jn-shaft left-[58%]" />
          <div aria-hidden="true" className="jn-shaft left-[74%] opacity-70" />
          <div aria-hidden="true" className="jn-grain" />

          <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-2 px-4 pt-6 pb-8 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:pt-10 lg:pb-14">
            <div className="lg:col-span-7">
              <p
                className="jn-eyebrow jn-enter flex items-center gap-3 text-fg-muted"
                style={{ "--enter-delay": "0ms" } as CSSProperties}
              >
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                {site.hero.kicker}
              </p>

              <h1
                className="font-display jn-enter mt-5 text-[clamp(3.25rem,13.5vw,8.25rem)] leading-[0.88] font-black tracking-[0.005em] text-hero-ink"
                style={{ "--enter-delay": "90ms" } as CSSProperties}
              >
                {site.hero.headlineTop}
                <br />
                <span className="text-accent">{site.hero.headlineBottom}</span>
              </h1>

              <p
                className="jn-enter mt-6 max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg"
                style={{ "--enter-delay": "220ms" } as CSSProperties}
              >
                {site.hero.description}
              </p>

              <div
                className="jn-enter mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={{ "--enter-delay": "300ms" } as CSSProperties}
              >
                <ActionLink href="#network" variant="primary" className="w-full sm:w-auto">
                  Explore the Network
                  <span aria-hidden="true" className="jn-arrow">→</span>
                </ActionLink>
                <CopyAddress
                  variant="secondary"
                  label="Join the Server"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>

            {/* 3D centerpiece: above the copy on small screens, right column on desktop */}
            <div
              className="jn-enter-fade order-first mx-auto w-[min(58vw,250px)] sm:w-[min(52vw,320px)] lg:order-none lg:col-span-5 lg:w-full lg:max-w-[540px] lg:justify-self-end"
              style={{ "--enter-delay": "150ms" } as CSSProperties}
            >
              <HeroEmblem />
            </div>
          </div>

          {/* Server console strip */}
          <div
            className="jn-enter relative border-t border-line-strong/70 bg-background/70 backdrop-blur-md"
            style={{ "--enter-delay": "420ms" } as CSSProperties}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="jn-eyebrow text-fg-subtle">Server address</span>
                <span className="font-mono text-base whitespace-nowrap text-fg sm:text-lg">
                  {site.server.address}
                </span>
                <span className="jn-eyebrow hidden text-fg-subtle md:inline">
                  {site.server.editions.join(" · ")}
                </span>
              </div>
              <StatusPill />
            </div>
          </div>
        </section>

        {/* ══════════ Network introduction ══════════ */}
        <section id="network" className="relative border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <Reveal className="lg:col-span-7">
                <Eyebrow tone="accent">{site.network.kicker}</Eyebrow>
                <h2 className="font-display mt-6 text-[clamp(2.9rem,8vw,6.5rem)] leading-[0.86] font-black tracking-[0.005em] text-balance text-fg">
                  {site.network.statement}
                </h2>
              </Reveal>

              <Reveal className="lg:col-span-4 lg:col-start-9 lg:pt-14" delay={120}>
                <p className="text-base leading-relaxed text-fg-muted sm:text-lg">
                  {site.network.bodyA}
                </p>
                <p className="mt-6 text-base leading-relaxed text-fg-subtle">
                  {site.network.bodyB}
                </p>
              </Reveal>
            </div>

            <Reveal delay={100}>
              <dl className="mt-20 grid border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
                {site.network.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="border-b border-line py-8 last:border-b-0 sm:border-b-0 sm:px-8 sm:first:pl-0 sm:last:pr-0"
                  >
                    <dd className="font-display text-4xl leading-none font-extrabold tracking-[0.02em] text-fg sm:text-5xl">
                      {fact.value}
                    </dd>
                    <dt className="jn-eyebrow mt-3 text-fg-subtle">
                      {fact.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ══════════ Modes ══════════ */}
        <div id="modes">
          <PracticePvpSection />
          <SurvivalSection />
        </div>

        {/* ══════════ Server connection ══════════ */}
        <section id="server" className="relative border-b border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <Reveal>
                  <Eyebrow tone="accent">{site.connect.kicker}</Eyebrow>
                  <h2 className="font-display mt-6 text-[clamp(2.9rem,7vw,5.5rem)] leading-[0.86] font-black tracking-[0.005em] text-balance text-fg">
                    {site.connect.title}
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted">
                    {site.connect.description}
                  </p>
                </Reveal>

                <Reveal delay={100}>
                  <ol className="mt-10 border-t border-line">
                    {site.connect.steps.map((step) => (
                      <li
                        key={step.index}
                        className="group flex items-center gap-6 border-b border-line py-5"
                      >
                        <span className="font-display w-14 shrink-0 text-5xl leading-none font-black text-fg-disabled transition-colors duration-300 group-hover:text-accent">
                          {step.index}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-fg">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                            {step.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>

              <Reveal className="lg:col-span-6" delay={120}>
                <div className="lg:sticky lg:top-24">
                  {/* the one primary address block on the page */}
                  <div className="relative border border-line-strong bg-background p-6 sm:p-8">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 h-[3px] w-20 bg-accent"
                    />
                    <p className="jn-eyebrow text-fg-subtle">Server address</p>
                    <p className="mt-4 font-mono text-[clamp(1.3rem,5.4vw,2.1rem)] leading-tight break-words text-fg">
                      {site.server.address}
                    </p>
                    <p className="jn-eyebrow mt-3 text-fg-subtle">
                      {site.server.editions.join(" · ")} · same address
                    </p>
                    <div className="mt-7">
                      <CopyAddress variant="primary" label="Copy server address" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <ServerStatus />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ Coins ══════════ */}
        <section id="coins" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-4">
                <Eyebrow tone="accent">Coins</Eyebrow>
                <h2 className="font-display mt-6 text-[clamp(2.9rem,6vw,4.75rem)] leading-[0.86] font-black tracking-[0.005em] text-balance text-fg">
                  Earn them or buy them
                </h2>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-muted">
                  Coins run through the whole server. Get them by playing, by
                  leveling up in Discord, or by buying them.
                </p>
                <div className="mt-8">
                  <ActionLink href="/coins" variant="secondary" className="w-full sm:w-auto">
                    How coins work
                    <span aria-hidden="true" className="jn-arrow">→</span>
                  </ActionLink>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-8" delay={100}>
                <ul className="divide-y divide-line border-y border-line">
                  {site.coins.sources.map((source) => (
                    <li
                      key={source.id}
                      className="group grid grid-cols-[3.5rem_1fr] items-start gap-x-5 gap-y-1 py-7 transition-colors duration-300 hover:bg-surface sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-x-8 sm:px-4"
                    >
                      <span className="jn-outline-accent font-display row-span-2 text-5xl leading-none font-black sm:row-span-1 sm:text-6xl">
                        {source.index}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-extrabold tracking-[0.03em] text-fg transition-colors duration-300 group-hover:text-accent-ink sm:text-3xl">
                          {source.name}
                        </h3>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-fg-muted">
                          {source.summary}
                        </p>
                      </div>
                      <span className="col-start-2 mt-2 sm:col-start-3 sm:mt-0">
                        <CoinIcon name={source.icon} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section id="faq" className="border-b border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <Eyebrow tone="accent">Help</Eyebrow>
                  <h2 className="font-display mt-6 text-[clamp(2.9rem,6vw,4.75rem)] leading-[0.86] font-black tracking-[0.005em] text-balance text-fg">
                    Questions, answered
                  </h2>
                  <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-muted">
                    Joining, coins, editions, accounts.
                  </p>
                  <p className="mt-6 text-sm text-fg-subtle">
                    Live player count and version are on the{" "}
                    <Link
                      href="/status"
                      className="text-fg underline decoration-accent underline-offset-4 transition-colors hover:text-accent-ink"
                    >
                      status page
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-8" delay={100}>
                <div className="border-t border-line">
                  {site.faq.slice(0, 6).map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
                <Link
                  href="/faq"
                  className="jn-eyebrow mt-6 inline-flex min-h-11 items-center gap-2 text-fg-muted transition-colors hover:text-fg"
                >
                  All questions <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ Community / closing ══════════ */}
        <section id="join" className="jn-dark relative isolate overflow-hidden">
          <HeroScene
            src="/media/hero-mountains.webp"
            alt=""
            priority={false}
            keepStill
            opacity={0.35}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--background) 0%, rgb(8 9 11 / 0.7) 35%, rgb(8 9 11 / 0.85) 70%, var(--background) 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 50% 55%, rgb(215 25 63 / 0.3), transparent 70%)",
            }}
          />
          <div aria-hidden="true" className="jn-grain" />

          <div className="relative mx-auto max-w-7xl px-4 py-28 text-center sm:px-8 sm:py-40">
            <Reveal>
              <p className="jn-eyebrow inline-flex items-center gap-3 text-accent-ink">
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                {site.discord.label}
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
              </p>
              <h2 className="font-display mt-6 text-[clamp(2.9rem,11.5vw,9.5rem)] leading-[0.9] font-black tracking-[0.005em] text-hero-ink">
                The community
                <br />
                <span className="jn-outline-accent">is the best part</span>
              </h2>
              <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
                The Discord is where players gather, and where to go if the
                server gives you trouble. Announcements land there first.
              </p>
              <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <ActionLink
                  href={site.discord.url}
                  variant="primary"
                  external
                  className="w-full sm:w-auto"
                >
                  Open Discord
                  <span aria-hidden="true" className="jn-arrow">↗</span>
                </ActionLink>
                <ActionLink href="#server" variant="secondary" className="w-full sm:w-auto">
                  How to join
                </ActionLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
