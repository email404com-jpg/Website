import { site } from "@/lib/site";

export function StoreFooter() {
  const link =
    "inline-flex min-h-11 items-center text-sm text-fg-muted transition-colors hover:text-fg";
  return (
    <footer className="jn-dark border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-fg-subtle">
          © {site.copyrightYear} {site.name}. All rights reserved.
        </p>
        <nav aria-label="Store footer" className="flex flex-wrap gap-x-6">
          <a className={link} href={site.url}>jacknetwork.in</a>
          <a className={link} href={`${site.url}/terms`}>Terms</a>
          <a className={link} href={`${site.url}/rules`}>Rules</a>
          <a className={link} href={site.discord.url} target="_blank" rel="noopener noreferrer">Discord</a>
        </nav>
      </div>
    </footer>
  );
}
