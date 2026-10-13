import type { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent";
}) {
  return (
    <p
      className={`jn-eyebrow flex items-center gap-3 ${tone === "accent" ? "text-accent-ink" : "text-fg-subtle"}`}
    >
      <span aria-hidden="true" className="h-px w-8 bg-accent" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display mt-4 text-4xl leading-[0.95] font-extrabold tracking-[0.005em] text-balance text-fg sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
