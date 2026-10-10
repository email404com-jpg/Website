"use client";

import { useState } from "react";

export function FaqItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `faq-${q.replace(/\s+/g, "-").toLowerCase().slice(0, 40)}`;

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-[var(--duration)] hover:text-accent"
        >
          <span className="text-base font-medium text-fg sm:text-lg">
            {q}
          </span>
          <svg
            viewBox="0 0 16 16"
            className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-[var(--duration)] ease-[var(--ease)] ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      </h3>
      <div
        id={id}
        data-open={open}
        className="jn-acc"
      >
        <div className="jn-acc-inner">
          <p className="pb-5 pr-8 text-sm leading-relaxed text-fg-muted sm:text-base">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}
