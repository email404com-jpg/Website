import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
  ariaLabel?: string;
};

const base =
  "group relative inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold tracking-wide transition-[background-color,border-color,color,transform] duration-[var(--duration)] ease-[var(--ease)] active:scale-[0.98]";

const variants = {
  primary:
    "overflow-hidden bg-accent text-white hover:bg-accent-hover focus-visible:bg-accent-hover",
  secondary:
    "border border-line-strong bg-surface text-fg-muted hover:border-accent hover:text-fg",
};

export function ActionLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  ariaLabel,
}: Props) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-full w-[200%] -translate-x-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[var(--duration-slow)] ease-[var(--ease)] group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
}
