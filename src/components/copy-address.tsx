"use client";

import { useEffect, useRef, useState } from "react";
import { copyAddress } from "@/lib/copy";

type State = "idle" | "copied" | "error" | "working";

function useCopyState() {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    setState("working");
    const ok = await copyAddress();
    setState(ok ? "copied" : "error");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  return { state, copy };
}

function CopyGlyph({ copied, className }: { copied: boolean; className?: string }) {
  if (copied) {
    return (
      <svg
        viewBox="0 0 16 16"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M3 8.5 6.5 12 13 4.5" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
      <path d="M10.5 3.5h-8v8" />
    </svg>
  );
}

export function CopyAddress({
  variant = "primary",
  label,
  className = "",
}: {
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const { state, copy } = useCopyState();
  const copied = state === "copied";
  const text = copied
    ? "Copied"
    : state === "error"
      ? "Press Ctrl+C"
      : (label ?? "Copy address");

  return (
    <button
      type="button"
      onClick={copy}
      data-state={state}
      className={`jn-btn ${variant === "primary" ? "jn-btn-primary" : "jn-btn-ghost"} w-full sm:w-auto ${className}`}
    >
      <CopyGlyph copied={copied} className="h-4 w-4" />
      <span className="whitespace-nowrap">{text}</span>
    </button>
  );
}

export function CopyIconButton({ className = "" }: { className?: string }) {
  const { state, copy } = useCopyState();
  const copied = state === "copied";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={
        copied ? "Server address copied" : "Copy server address"
      }
      className={`inline-flex h-11 w-11 items-center justify-center rounded-sm border transition-[border-color,color,background-color] duration-[var(--duration)] ease-[var(--ease)] active:scale-[0.96] ${
        copied
          ? "border-accent text-accent-ink"
          : "border-line-strong text-fg-muted hover:border-fg-muted hover:bg-white/5 hover:text-fg"
      } ${className}`}
    >
      <CopyGlyph copied={copied} className="h-4 w-4" />
    </button>
  );
}
