import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Cinematic band at the top of inner pages: monochrome art bleed,
 * crimson key light, eyebrow, display title, description.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  art,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  art?: string;
  children?: ReactNode;
}) {
  return (
    <section className="jn-dark relative isolate overflow-hidden border-b border-line">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {art ? (
          <Image
            src={art}
            alt=""
            fill
            sizes="100vw"
            className="jn-mono object-cover object-center opacity-35"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, var(--scrim-strong) 0%, var(--scrim-mid) 50%, var(--scrim-soft) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 92% 0%, rgb(215 25 63 / 0.22), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{
            background: "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
        <p className="jn-eyebrow jn-enter flex items-center gap-3 text-accent-ink">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          {eyebrow}
        </p>
        <h1
          className="font-display jn-enter mt-5 max-w-4xl text-[clamp(3rem,9vw,6.5rem)] leading-[0.88] font-black tracking-[0.005em] text-balance text-hero-ink"
          style={{ "--enter-delay": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>
        {description ? (
          <p
            className="jn-enter mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg"
            style={{ "--enter-delay": "160ms" } as React.CSSProperties}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
