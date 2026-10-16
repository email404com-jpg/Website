import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { UnverifyCard } from "@/components/unverify-card";

export const metadata: Metadata = {
  title: "Unverify",
  description: "Disconnect your Minecraft account from your Discord login.",
};

export default function UnverifyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          eyebrow="Account"
          title="Unverify"
          description="Cut the link between your Discord login and your in-game Minecraft player."
          art="/media/survival-taiga.webp"
        />

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <UnverifyCard />
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8 border-l-2 border-accent pl-5">
              <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                Only unlink if you intend to move this Discord login to a
                different Minecraft account. To simply check whether you are
                linked, run <span className="font-mono text-accent-ink">/verify</span> in
                game, or open{" "}
                <a
                  href="/coins"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                >
                  the coins page
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
