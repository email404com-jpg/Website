"use client";

import { useEffect, useRef } from "react";

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function VoxelField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let t = 0;
    const mx = { x: 0, y: 0 };

    const N = 14;
    const heights: number[][] = [];
    for (let i = 0; i < N; i++) {
      heights[i] = [];
      for (let j = 0; j < N; j++) {
        const v =
          hash(i, j) * 0.55 +
          hash(i * 3 + 1, j * 7 + 2) * 0.3 +
          hash(i * 11 + 5, j * 13 + 9) * 0.15;
        heights[i][j] = Math.max(0, Math.floor(v * 5));
      }
    }

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawCube(
      sx: number,
      sy: number,
      s: number,
      top: string,
      left: string,
      right: string,
    ) {
      const hh = s * 0.5;
      const qh = s * 0.25;
      const ch = s * 0.6;

      ctx!.beginPath();
      ctx!.moveTo(sx, sy - hh);
      ctx!.lineTo(sx + s, sy);
      ctx!.lineTo(sx, sy + hh);
      ctx!.lineTo(sx - s, sy);
      ctx!.closePath();
      ctx!.fillStyle = top;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(sx - s, sy);
      ctx!.lineTo(sx, sy + hh);
      ctx!.lineTo(sx, sy + hh + ch);
      ctx!.lineTo(sx - s, sy + ch);
      ctx!.closePath();
      ctx!.fillStyle = left;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(sx + s, sy);
      ctx!.lineTo(sx, sy + hh);
      ctx!.lineTo(sx, sy + hh + ch);
      ctx!.lineTo(sx + s, sy + ch);
      ctx!.closePath();
      ctx!.fillStyle = right;
      ctx!.fill();

      void qh;
    }

    function frame() {
      if (!visible) return;
      t += 0.004;

      ctx!.clearRect(0, 0, w, h);

      const cx = w * 0.5 + Math.sin(t * 0.7) * 3 + mx.x * 6;
      const cy = h * 0.32 + Math.sin(t) * 2 + mx.y * 4;
      const s = Math.min(w, h) * 0.055;
      const gap = 1.15;

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const col = heights[i][j];
          if (col === 0) continue;

          const px = cx + (i - j) * s * gap;
          const py = cy + (i + j) * s * gap * 0.5;

          for (let c = 0; c < col; c++) {
            const yy = py - c * s * 0.6;
            const red =
              (i + j + c) % 7 === 0 && hash(i + c * 3, j + c * 5) > 0.82;
            const silver = hash(i * 2 + c, j * 2) > 0.6;

            const top = red
              ? "#3a0a08"
              : silver
                ? "#1c1c1c"
                : c === col - 1
                  ? "#181818"
                  : "#141414";
            const left = red ? "#2a0605" : "#0c0c0c";
            const right = red ? "#220504" : "#0a0a0a";

            drawCube(px, yy, s, top, left, right);

            if (c === col - 1 && red) {
              ctx!.strokeStyle = "rgba(225, 6, 0, 0.5)";
              ctx!.lineWidth = 1;
              ctx!.beginPath();
              ctx!.moveTo(px, yy - s * 0.5);
              ctx!.lineTo(px + s, yy);
              ctx!.lineTo(px, yy + s * 0.5);
              ctx!.lineTo(px - s, yy);
              ctx!.closePath();
              ctx!.stroke();
            }
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function onPointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mx.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mx.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    resize();

    if (reduced) {
      visible = true;
      frame();
      cancelAnimationFrame(raf);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0 },
      );
      io.observe(canvas);

      canvas.addEventListener("pointermove", onPointer);
      raf = requestAnimationFrame(frame);

      const ro = new ResizeObserver(resize);
      if (canvas.parentElement) ro.observe(canvas.parentElement);

      return () => {
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener("pointermove", onPointer);
        cancelAnimationFrame(raf);
      };
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        maskImage:
          "radial-gradient(ellipse 85% 85% at 50% 45%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 85% 85% at 50% 45%, black 55%, transparent 100%)",
      }}
    />
  );
}
