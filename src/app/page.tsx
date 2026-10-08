import type { ReactNode } from "react";
import { ActionLink } from "@/components/action-link";
import { CopyAddress } from "@/components/copy-address";
import { ServerStatus } from "@/components/server-status";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Topology } from "@/components/topology";
import { site } from "@/lib/site";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top">
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
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
                <div className="border border-line bg-surface p-4 sm:p-6">
                  <Topology />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modes" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <Eyebrow>Game modes</Eyebrow>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-balance text-fg sm:text-3xl">
                Two ways to play
              </h2>
              <p className="mt-3 text-base leading-relaxed text-fg-muted">
                Both modes run under the same address. Switch between them
                without a second install.
              </p>
            </div>

            <ol className="mt-10 border-t border-line">
              {site.modes.map((mode, index) => (
                <li
                  key={mode.id}
                  className="grid gap-3 border-b border-line py-7 sm:grid-cols-12 sm:gap-6 sm:py-9"
                >
                  <p className="font-mono text-sm text-accent sm:col-span-1">
                    {mode.index}
                  </p>
                  <h3
                    className={`text-xl font-semibold tracking-[-0.01em] text-fg sm:col-span-4 sm:text-2xl ${
                      index === 1 ? "sm:col-start-3" : ""
                    }`}
                  >
                    {mode.name}
                  </h3>
                  <p className="text-base leading-relaxed text-fg-muted sm:col-span-6">
                    {mode.summary}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="status" className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <Eyebrow>Status</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-balance text-fg sm:text-3xl">
                  Live server status
                </h2>
                <p className="mt-3 text-base leading-relaxed text-fg-muted">
                  Player counts and version come straight from the server.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
                  If a value cannot be read, it stays empty rather than being
                  estimated.
                </p>
              </div>

              <div className="lg:col-span-8">
                <ServerStatus />
              </div>
            </div>
          </div>
        </section>

        <section id="join" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
