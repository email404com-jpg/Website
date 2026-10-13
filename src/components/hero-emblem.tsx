"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const EMBERS = [
  { left: "14%", delay: 0, dur: 7.5, drift: 22, size: 3 },
  { left: "27%", delay: 2.4, dur: 9, drift: -16, size: 2 },
  { left: "41%", delay: 4.2, dur: 8, drift: 12, size: 2.5 },
  { left: "58%", delay: 1.1, dur: 10, drift: 26, size: 3 },
  { left: "71%", delay: 3.3, dur: 7.2, drift: -20, size: 2 },
  { left: "84%", delay: 5.2, dur: 9.4, drift: 14, size: 2.5 },
];

/** Floating pixel shards at different depths — they parallax against the emblem. */
const SHARDS = [
  { left: "4%", top: "20%", s: 16, z: 90, c: "accent", dur: 7, delay: 0, r: 18 },
  { left: "90%", top: "14%", s: 11, z: 140, c: "silver", dur: 9, delay: 1.2, r: -24 },
  { left: "-2%", top: "62%", s: 10, z: 40, c: "silver", dur: 8, delay: 2.1, r: 32 },
  { left: "96%", top: "58%", s: 18, z: 110, c: "accent", dur: 10, delay: 0.6, r: -12 },
  { left: "22%", top: "-4%", s: 9, z: 160, c: "silver", dur: 8.5, delay: 3, r: 40 },
  { left: "74%", top: "92%", s: 13, z: 70, c: "accent", dur: 9.5, delay: 1.8, r: 8 },
  { left: "12%", top: "88%", s: 8, z: 120, c: "silver", dur: 7.5, delay: 2.6, r: -30 },
];

/**
 * Pointer-driven parallax for fine pointers. Writes two CSS variables
 * (--px / --py, -1..1) which the 3D rig turns into rotation. No-op for
 * touch devices and for reduced-motion users.
 */
function usePointerTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rig = ref.current;
    if (!rig) return;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const host = rig.closest("section") ?? document.body;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      rig.style.setProperty("--px", cx.toFixed(4));
      rig.style.setProperty("--py", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: Event) => {
      const e = event as PointerEvent;
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/**
 * Hero centerpiece: the Jack Network emblem as a lit, layered 3D object.
 * Built from stacked planes on a CSS perspective stage — extruded depth
 * copies, a masked specular sweep, a crimson halo, a floor disc with a
 * reflection and an orbit ring. Zero JS dependencies; transform/opacity
 * only; static pose when reduced motion is requested.
 */
export function HeroEmblem() {
  const rigRef = useRef<HTMLDivElement>(null);
  usePointerTilt(rigRef);

  const src = "/logo-jn.webp";

  return (
    <div
      className="jn-stage relative mx-auto w-full"
      role="img"
      aria-label="Jack Network emblem"
    >
      <div ref={rigRef} className="jn-tilt-rig">
        {/* Ground plane */}
        <div aria-hidden="true" className="jn-halo" />
        <div aria-hidden="true" className="jn-floor" />
        <div aria-hidden="true" className="jn-orbit">
          <span className="jn-orbit-ring" />
        </div>

        {/* Embers rising from the floor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[6%] h-[60%]"
        >
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="jn-ember absolute bottom-0 rounded-full bg-accent-hover"
              style={
                {
                  left: e.left,
                  width: e.size,
                  height: e.size,
                  boxShadow: "0 0 10px 2px rgb(232 48 85 / 0.55)",
                  "--dur": `${e.dur}s`,
                  "--delay": `${e.delay}s`,
                  "--drift": `${e.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Pixel shards drifting at different depths */}
        {SHARDS.map((sh, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`jn-shard ${sh.c === "accent" ? "jn-shard-accent" : "jn-shard-silver"}`}
            style={
              {
                left: sh.left,
                top: sh.top,
                width: sh.s,
                height: sh.s,
                "--z": `${sh.z}px`,
                "--r": `${sh.r}deg`,
                "--dur": `${sh.dur}s`,
                "--delay": `${sh.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* The emblem itself */}
        <div className="jn-float relative mx-auto aspect-[803/680] w-full">
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-layer-shadow"
          />
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-depth-4"
          />
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-depth-3"
          />
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-depth-2"
          />
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-depth-1"
          />
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            priority
            sizes="(min-width: 1024px) 520px, 80vw"
            className="jn-layer jn-layer-main"
          />
          <div aria-hidden="true" className="jn-spec" />

          {/* Mirror reflection on the floor */}
          <div aria-hidden="true" className="jn-reflect">
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 520px, 80vw"
              className="jn-layer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
