"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

type State = "idle" | "copied" | "error";

export function CopyAddress({
  variant = "primary",
}: {
  variant?: "primary" | "secondary";
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const value = site.server.address;
    let ok = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        ok = document.execCommand("copy");
        document.body.removeChild(field);
      }
    } catch {
      ok = false;
    }

    setState(ok ? "copied" : "error");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  const buttonClass =
    variant === "primary"
      ? "overflow-hidden bg-accent text-white hover:bg-accent-hover"
      : "border border-line-strong bg-surface text-fg-muted hover:border-accent hover:text-fg";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className={`group relative inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold tracking-wide transition-[background-color,border-color,color,transform] duration-[var(--duration)] ease-[var(--ease)] active:scale-[0.98] ${buttonClass}`}
      >
        {variant === "primary" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-full w-[200%] -translate-x-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[var(--duration-slow)] ease-[var(--ease)] group-hover:translate-x-full"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {state === "copied" ? (
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 8.5 6.5 12 13 4.5" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4 transition-transform duration-[var(--duration)] group-hover:translate-y-[1px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
              <path d="M10.5 3.5h-8v8" />
            </svg>
          )}
          {state === "copied"
            ? "Copied"
            : state === "error"
              ? "Press Ctrl+C"
              : "Copy address"}
        </span>
      </button>

      <p
        role="status"
        aria-live="polite"
        className="font-mono text-xs text-fg-subtle"
      >
        {state === "copied"
          ? `${site.server.address} copied to clipboard`
          : state === "error"
            ? "Clipboard blocked — copy the address manually"
            : ""}
      </p>
    </div>
  );
}
