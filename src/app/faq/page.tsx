import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { FaqItem } from "@/components/faq-item";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Jack Network",
};

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          eyebrow="Help"
          title="Frequently asked questions"
          description="Quick answers to common questions about the server, coins, and accounts."
          art="/media/survival-taiga.webp"
        />

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <div className="border-t border-line">
              {site.faq.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-12 border-l-2 border-accent pl-5">
              <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                Still stuck? Join the{" "}
                <a
                  href={site.discord.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                >
                  Discord
                </a>{" "}
                and open a support ticket. Someone will help you out.
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
