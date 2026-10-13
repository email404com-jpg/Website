"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Full-bleed environment art. Stock screenshots are pulled into the brand
 * palette with a monochrome filter; scroll parallax lives on the outer
 * layer and the slow drift on the inner one so the two never fight.
 */
export function HeroScene({
  src,
  alt,
  priority = true,
  keepStill = false,
  mono = true,
  opacity = 1,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  /** keeps the image fully still when true */
  keepStill?: boolean;
  /** pull the art into the black/silver palette */
  mono?: boolean;
  opacity?: number;
}) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keepStill) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = layerRef.current;
    const section = el?.closest("section");
    if (!el || !section) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < -vh || rect.top > vh * 2) return;
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      const y = Math.max(-1, Math.min(1, progress)) * 40;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [keepStill]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        ref={layerRef}
        className="absolute inset-[-6%] will-change-transform"
        style={{ opacity }}
      >
        <div className={`absolute inset-0 ${keepStill ? "" : "jn-drift"}`}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className={`object-cover object-center ${mono ? "jn-mono" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}

/** Cinematic scrim: crimson key light, deep vignette, floor fade. */
export function SceneScrim({ floor = true }: { floor?: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, var(--scrim-strong) 0%, var(--scrim-mid) 40%, var(--scrim-soft) 78%, var(--scrim-edge) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 40%, var(--scrim-vignette) 100%)",
        }}
      />
      {floor && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background:
              "linear-gradient(to top, var(--background) 4%, var(--scrim-floor) 50%, transparent 100%)",
          }}
        />
      )}
    </>
  );
}
