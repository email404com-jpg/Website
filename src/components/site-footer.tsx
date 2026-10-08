import Image from "next/image";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative block h-7 w-[33px]">
                <Image
                  src="/logo-jn.png"
                  alt=""
                  fill
                  sizes="33px"
                  className="object-contain"
                />
              </span>
              <span className="text-sm font-semibold tracking-[0.14em] text-fg uppercase">
                {site.name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-subtle">
              Minecraft server running practice PvP and survival.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                Server
              </p>
              <p className="mt-2 font-mono text-sm break-all text-fg-muted">
                {site.server.address}
              </p>
              <p className="mt-1 text-xs text-fg-subtle">
                {site.server.editions.join(" · ")}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fg-subtle">
                Community
              </p>
              <a
                href={site.discord.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors duration-[var(--duration)] hover:text-accent hover:decoration-accent"
              >
                {site.discord.label}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.copyrightYear} {site.name}
          </p>
          <p className="font-mono">{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}
