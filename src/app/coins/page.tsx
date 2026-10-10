import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Coins",
  description: "How to earn and buy Jack Network coins",
};

export default function CoinsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Economy"
            title="Jack Network coins"
            description="Coins are the server's virtual currency. Earn them for free or buy them — your choice."
          />

          <div className="mt-12 space-y-10">
            {site.coins.sources.map((source) => (
              <Reveal key={source.id}>
                <section className="grid gap-4 border-t border-line pt-8 sm:grid-cols-12 sm:gap-8">
                  <p className="font-mono text-sm text-accent sm:col-span-2">
                    {source.index}
                  </p>
                  <div className="sm:col-span-10">
                    <h3 className="text-xl font-semibold text-fg sm:text-2xl">
                      {source.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted sm:text-base">
                      {source.summary}
                    </p>
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 border border-line bg-surface p-6 sm:p-8">
              <h3 className="font-mono text-sm tracking-[0.14em] text-accent uppercase">
                Store status
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                The payment system is being integrated. When it goes live, you
                will be able to buy coins directly from this website. Watch
                Discord for the announcement.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-8 border border-line bg-surface p-6 sm:p-8">
              <h3 className="font-mono text-sm tracking-[0.14em] text-accent uppercase">
                Fair play
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                Do not buy or sell coins with other players for real money
                outside official channels. Third-party trades carry scam risk
                and are not supported by Jack Network staff.
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
