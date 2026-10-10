import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6">
        <div className="text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
            Error
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-fg sm:text-6xl">
            404
          </h1>
          <p className="mt-3 text-base text-fg-muted">
            This page does not exist.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-accent px-6 text-sm font-semibold text-white transition-colors duration-[var(--duration)] hover:bg-accent-hover"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
