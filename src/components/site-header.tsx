"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/lib/site";
import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    <header className="sticky top-0 z-50 border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <a
          href="#top"
          className="group flex items-center gap-3 rounded-sm"
          aria-label={`${site.name} home`}
        >
          <span className="relative block h-7 w-[33px] sm:h-8 sm:w-9">
            <Image
              src="/logo-jn.png"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 33px, 36px"
              className="object-contain"
            />
          </span>
          <span className="text-sm font-semibold tracking-[0.14em] text-fg uppercase sm:text-base">
            {site.name}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted transition-colors duration-[var(--duration)] hover:text-accent"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <AuthNav />
          <ActionLink
            href={site.discord.url}
            variant="secondary"
            external
            className="hidden px-4 sm:inline-flex"
          >
            {site.discord.label}
          </ActionLink>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded border border-line-strong text-fg-muted transition-colors duration-[var(--duration)] hover:border-accent hover:text-fg md:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
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

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-line bg-surface md:hidden"
      >
        <nav aria-label="Mobile" className="px-4 py-3 sm:px-6">
          <ul className="divide-y divide-line">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between text-base text-fg-muted transition-colors duration-[var(--duration)] hover:text-accent"
                >
                  {item.label}
                  <span aria-hidden="true" className="font-mono text-fg-subtle">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <ActionLink
            href={site.discord.url}
            variant="primary"
            external
            className="mt-4 w-full"
          >
            Join {site.discord.label}
          </ActionLink>
        </nav>
      </div>
    </header>
  );
}
