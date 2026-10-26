import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { LinkOtpCard } from "@/components/link-otp-card";

export const metadata: Metadata = {
  title: "Link",
  description: "Link your Minecraft account to your Discord login with a one-time code.",
};

export default function LinkPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          eyebrow="Account"
          title="Link"
          description="Connect your Minecraft player to your Discord login — one code, entered once."
          art="/media/survival-taiga.webp"
        />

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <LinkOtpCard />
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8 border-l-2 border-accent pl-5">
              <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                The code comes from the game: join{" "}
                <span className="font-mono text-accent-ink">play.jacknetwork.in</span>{" "}
                and run <span className="font-mono text-accent-ink">/link</span>. It
                is single-use and expires after 10 minutes. Already linked? Check{" "}
                <a
                  href="/unverify"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                >
                  unverify
                </a>{" "}
                to move the link to a different account.
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
