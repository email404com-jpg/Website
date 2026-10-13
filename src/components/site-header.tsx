"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { CopyIconButton } from "@/components/copy-address";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthNav } from "@/components/auth-nav";

const DISCORD_PATH =
  "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.68 15.383c-.953 0-1.72-.87-1.72-1.937 0-1.068.75-1.938 1.72-1.938.976 0 1.73.876 1.72 1.938 0 1.068-.75 1.937-1.72 1.937Zm6.64 0c-.953 0-1.72-.87-1.72-1.937 0-1.068.75-1.938 1.72-1.938.976 0 1.73.876 1.72 1.938 0 1.068-.744 1.937-1.72 1.937Z";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      className={`jn-dark sticky top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-3 sm:gap-2 sm:px-8">
        <Link
          href="/"
          className="group flex min-h-11 shrink-0 items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <span className="relative block h-8 w-[38px]">
            <Image
              src="/logo-jn-sm.webp"
              alt=""
              fill
              priority
              unoptimized
              sizes="38px"
              className="object-contain transition-transform duration-300 ease-[var(--ease)] group-hover:scale-110"
            />
          </span>
          <span className="font-display hidden text-[1.35rem] leading-none font-extrabold tracking-[0.06em] text-fg xs:inline">
            Jack <span className="text-accent">Network</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="jn-navlink inline-flex min-h-11 items-center px-3 font-mono text-[11px] tracking-[0.16em] text-fg-muted uppercase transition-colors duration-[var(--duration)] hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
          <a
            href={site.discord.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join the Jack Network Discord"
            className="hidden h-11 items-center gap-2 rounded-sm border border-line-strong px-3.5 font-mono text-[11px] tracking-[0.16em] text-fg-muted uppercase transition-colors duration-[var(--duration)] hover:border-fg-muted hover:bg-white/5 hover:text-fg xl:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d={DISCORD_PATH} />
            </svg>
            Discord
          </a>

          <CopyIconButton />
          <ThemeToggle />
          <AuthNav />

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-fg-muted transition-colors duration-[var(--duration)] hover:text-fg lg:hidden"
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-[var(--duration)] ease-[var(--ease)] ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute top-1/2 left-0 block h-[1.5px] w-full -translate-y-1/2 bg-current transition-opacity duration-[var(--duration)] ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-[var(--duration)] ease-[var(--ease)] ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-background lg:hidden"
      >
        <nav aria-label="Mobile" className="px-5 pt-2 pb-6">
          <ul className="divide-y divide-line">
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-14 items-center justify-between font-display text-3xl font-extrabold tracking-[0.02em] text-fg-muted transition-colors duration-[var(--duration)] hover:text-fg"
                >
                  <span>
                    <span className="mr-4 font-mono text-[11px] tracking-[0.18em] text-accent-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-base text-fg-subtle transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={site.discord.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="jn-btn jn-btn-ghost mt-6 w-full"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d={DISCORD_PATH} />
            </svg>
            Join the Discord
          </a>
        </nav>
      </div>
    </header>
  );
}
