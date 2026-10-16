import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Play",
    links: [
      { href: "/#server", label: "How to join" },
      { href: "/#practice-pvp", label: "Practice PvP" },
      { href: "/#survival", label: "Survival" },
      { href: "/status", label: "Server status" },
    ],
  },
  {
    title: "Economy",
    links: [
      { href: "/coins", label: "Coins" },
      { href: "https://store.jacknetwork.in", label: "Store" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/rules", label: "Rules" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/login", label: "Login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="jn-dark relative overflow-hidden border-t border-line">
      <div aria-hidden="true" className="jn-hairline absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="relative block h-9 w-[43px]">
                <Image
                  src="/logo-jn-sm.webp"
                  alt=""
                  fill
                  unoptimized
                  sizes="43px"
                  className="object-contain"
                />
              </span>
              <span className="font-display text-2xl leading-none font-extrabold tracking-[0.06em] text-fg uppercase">
                {site.name}
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
              Minecraft practice PvP and survival on one server — Java and
              Bedrock, one address.
            </p>

            <p className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 border border-line-strong px-4 py-3 font-mono text-sm">
              <span className="whitespace-nowrap text-fg">
                {site.server.address}
              </span>
              <span className="text-fg-subtle">
                {site.server.editions.join(" · ")}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="jn-eyebrow text-fg-subtle">{col.title}</p>
                <ul className="mt-4 space-y-1">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-sm text-fg-muted transition-colors duration-[var(--duration)] hover:text-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="jn-eyebrow text-fg-subtle">Community</p>
              <a
                href={site.discord.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 text-sm font-semibold text-fg transition-colors duration-[var(--duration)] hover:border-accent hover:bg-accent/10"
              >
                Join Discord
                <span aria-hidden="true">↗</span>
              </a>
              <p className="mt-4 text-sm leading-relaxed text-fg-subtle">
                Announcements, support and events.
              </p>
            </div>
          </div>
        </div>

        {/* Oversized outline wordmark */}
        <p
          aria-hidden="true"
          className="jn-outline font-display mt-14 -mb-[0.16em] text-center text-[clamp(3.4rem,13.2vw,15rem)] leading-[0.8] font-black tracking-[0.01em] whitespace-nowrap select-none"
        >
          Jack Network
        </p>
      </div>

      <div className="relative border-t border-line bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {site.copyrightYear} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
