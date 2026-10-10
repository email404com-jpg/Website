import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Rules",
  description: "Jack Network server rules for Minecraft PvP and survival",
};

const groups = [
  {
    title: "General conduct",
    rules: [
      "Respect other players. Harassment, hate speech, slurs, and discrimination are not tolerated in chat, DMs, or any Jack Network space.",
      "Do not spam, flood, or repeatedly message in chat. Keep chat readable for everyone.",
      "Do not advertise other Minecraft servers, Discord servers, or services in chat or support channels.",
      "Do not impersonate staff members, other players, or public figures.",
      "Keep public chat in English so staff can moderate effectively.",
    ],
  },
  {
    title: "Gameplay & fair play",
    rules: [
      "No cheating. Hacked clients, auto-aim, x-ray, fly, reach, and any unauthorized mod or plugin that gives an unfair advantage are prohibited.",
      "No exploits or bug abuse. If you find a bug, report it in Discord. Exploiting it will result in a rollback or ban.",
      "No macros, autoclickers, or input tools that automate gameplay beyond what is allowed in-game.",
      "In Practice PvP, follow the mode-specific rules posted in-game and in Discord.",
      "In Survival, do not grief or steal outside of designated PvP zones. Claim and protect your own builds.",
    ],
  },
  {
    title: "Coins & economy",
    rules: [
      "Coins can be earned through in-game chat games, Discord level-ups, or purchased from the store.",
      "No scamming or trade fraud. Deals broken in bad faith will be investigated and reversed where possible.",
      "Coin purchases are final once credited. See the Terms of Service for the full payment policy.",
      "Do not buy or sell coins for real money with other players outside official channels.",
    ],
  },
  {
    title: "Enforcement",
    rules: [
      "Staff decisions are final. You can appeal a punishment through Discord with evidence.",
      "Violations may result in a mute, kick, ban, or coin reset depending on severity and history.",
      "These rules apply on the Minecraft server, in Discord, and on this website.",
      "Rules may be updated at any time. Check this page for the latest version.",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Conduct"
            title="Server rules"
            description="These rules apply to everyone. Breaking them can result in a mute, kick, or ban."
          />

          <div className="mt-12 space-y-12">
            {groups.map((group) => (
              <Reveal key={group.title}>
                <section>
                  <h3 className="font-mono text-sm tracking-[0.14em] text-accent uppercase">
                    {group.title}
                  </h3>
                  <ol className="mt-5 space-y-4">
                    {group.rules.map((rule, i) => (
                      <li
                        key={i}
                        className="flex gap-4 text-sm leading-relaxed text-fg-muted sm:text-base"
                      >
                        <span className="mt-px shrink-0 font-mono text-xs text-fg-subtle">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 border border-line bg-surface p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                Not sure about something? Ask in{" "}
                <a
                  href="https://dsc.gg/jackknetwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                >
                  Discord
                </a>
                . Staff would rather answer a question than issue a ban.
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
