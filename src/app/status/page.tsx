import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServerStatus } from "@/components/server-status";
import { CopyAddress } from "@/components/copy-address";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Status",
  description: "Jack Network server status",
};

export default function StatusPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Status"
              title="Server status"
              description="Live player counts and version, polled every 10 seconds."
            />
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10">
              <ServerStatus />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CopyAddress variant="secondary" />
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
