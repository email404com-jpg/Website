"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { SignInButton } from "./auth-buttons";
import { loginUrl } from "@/lib/login-url";

export function AuthNav({ externalLogin = false }: { externalLogin?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-11 w-11 animate-pulse rounded-full bg-surface-raised"
      />
    );
  }

  if (!session?.user) {
    if (externalLogin) {
      return (
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = loginUrl();
          }}
          className="jn-btn jn-btn-ghost !min-h-11 !px-4 hover:!border-accent sm:!px-5"
        >
          Login
        </a>
      );
    }
    return <SignInButton compact />;
  }

  const name = session.user.name ?? "Player";
  const initial = name.trim().charAt(0).toUpperCase() || "J";

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-surface-raised text-sm font-bold text-fg transition-[border-color,box-shadow] duration-[var(--duration)] ease-[var(--ease)] ${
          open
            ? "border-accent shadow-crimson"
            : "border-line-strong hover:border-accent"
        }`}
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            fill
            unoptimized
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 overflow-hidden border border-line-strong bg-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)]"
        >
          <span aria-hidden="true" className="block h-[2px] w-full bg-accent" />
          <div className="border-b border-line px-4 py-3">
            <p className="jn-eyebrow text-fg-subtle">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-fg">
              {name}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut()}
            className="flex min-h-12 w-full items-center justify-between px-4 text-left text-sm font-semibold text-fg-muted transition-colors duration-[var(--duration)] hover:bg-white/5 hover:text-fg"
          >
            Log out
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 2.5H3.5v11H6M10 5l3 3-3 3M13 8H6.5" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
