import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Credits",
  description: "Image credits and attributions for Jack Network",
};

export default function CreditsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          eyebrow="Legal"
          title="Credits"
          description="Attributions for third-party imagery used on this site."
        />
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-base leading-relaxed text-fg-muted">
            {site.credits.images}
          </p>
          <p className="mt-6 text-base leading-relaxed text-fg-muted">
            Jack Network is not an official Minecraft service and is not
            affiliated with, endorsed by, or operated by Mojang AB or Microsoft.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
