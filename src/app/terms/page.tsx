import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Jack Network Terms of Service including coin purchases and payments",
};

const sections = [
  {
    title: "1. Agreement",
    body: [
      "By joining the Jack Network Minecraft server, using this website, or joining our Discord, you agree to these Terms of Service. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "2. Service description",
    body: [
      "Jack Network is a Minecraft server running practice PvP and survival game modes. The server address is play.jacknetwork.in. The service is provided free of charge to play.",
      "Jack Network is not affiliated with, endorsed by, or operated by Mojang AB or Microsoft.",
    ],
  },
  {
    title: "3. Eligibility",
    body: [
      "You must own a legitimate copy of Minecraft to join the server. You must comply with the Minecraft End User License Agreement (EULA) and Microsoft's terms.",
      "You are responsible for activity on your Minecraft account and Discord account used to authenticate on this website.",
    ],
  },
  {
    title: "4. Coins and payments",
    body: [
      "Coins are a virtual currency used within Jack Network. They have no real-world value outside the server and cannot be exchanged for money.",
      "You can earn coins for free through in-game chat games and Discord level-ups. You can also purchase coins through the store when the payment system goes live.",
      "All coin purchases are final. Once coins are credited to your account, they are non-refundable. This includes purchases made in error.",
      "Chargebacks or payment disputes initiated after coins have been delivered may result in termination of your account and a ban from the server.",
      "Coin prices and availability may change at any time. Coins already delivered will not be adjusted or removed due to price changes.",
      "Payment processing is handled by a third-party provider. Jack Network does not store or have access to your full payment card details.",
    ],
  },
  {
    title: "5. Acceptable use",
    body: [
      "You agree not to use the server or website to: cheat, harass other players, distribute malicious software, engage in fraud, violate any applicable law, or disrupt the service for others.",
      "Attempting to exploit bugs, manipulate the coin economy, or abuse the payment system will result in account action.",
    ],
  },
  {
    title: "6. Availability",
    body: [
      "The server may be taken offline temporarily for maintenance, updates, or due to circumstances beyond our control. Live status is shown on the status page.",
      "We do not guarantee uninterrupted or error-free service. We are not liable for downtime, data loss, or interrupted gameplay.",
    ],
  },
  {
    title: "7. User content",
    body: [
      "You retain ownership of what you build and create on the server. By playing, you grant Jack Network a license to display, store, and operate your content as needed to run the service.",
    ],
  },
  {
    title: "8. Liability",
    body: [
      "The service is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Jack Network is not liable for indirect, incidental, or consequential damages arising from use of the service.",
    ],
  },
  {
    title: "9. Changes and contact",
    body: [
      "These terms may be updated at any time. Continued use of the service after changes constitutes acceptance of the updated terms.",
      "Questions about these terms can be raised in Discord through a support ticket.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Legal"
            title="Terms of Service"
            description="These terms cover use of the Jack Network server, website, Discord, and coin system."
          />

          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <Reveal key={s.title}>
                <section>
                  <h3 className="text-lg font-semibold text-fg sm:text-xl">
                    {s.title}
                  </h3>
                  <div className="mt-3 space-y-3">
                    {s.body.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-fg-muted sm:text-base"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
