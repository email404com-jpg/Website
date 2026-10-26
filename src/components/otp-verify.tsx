"use client";

/**
 * OtpVerify — one-time-code entry with the convergence verification animation
 * (account-linking flow).
 *
 * Sequence: N digits typed (auto-submit) -> the entered digits FLY from their
 * boxes to the exact centre of the visible screen, rotating and scaling as
 * they travel, and merge into one compact square -> the square holds while the
 * caller's verification promise is pending -> the square transforms into a
 * glowing green checkmark (success, restrained particle burst) or a red cross
 * with a brief shake (failure) -> after a failure the sequence reverses: the
 * boxes fly back to their original positions and the user can retry.
 *
 * Verification is never faked here: the parent passes `onVerify`, and the
 * success/failure branch runs only after that promise settles. If it settles
 * before the convergence finishes, the result is revealed the moment the merge
 * completes — never mid-flight.
 *
 * `prefers-reduced-motion` swaps travel/particles/shake for short crossfades;
 * states, messages and retry behaviour stay identical.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type OtpVerifyProps = {
  /** Code length (default 6). */
  length?: number;
  /** Runs the caller's real verification; resolves true = success. */
  onVerify: (code: string) => Promise<boolean>;
  /** Fired once the success animation has settled (navigate here if wanted). */
  onSuccess?: () => void;
  /** Fired when the failure reset has restored the boxes (retry hook). */
  onRetry?: () => void;
  successMessage?: string;
  failureMessage?: string;
  submitLabel?: string;
  /** Focus the first box on mount (default true). */
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

type Phase = "entry" | "verifying" | "passed" | "failed" | "resetting";

type Snapshot = {
  rects: DOMRect[];
  /** Centre of the *visible* viewport (keyboard-aware). */
  cx: number;
  cy: number;
  /** Visible viewport box, for the overlay's own bounds. */
  top: number;
  height: number;
};

/* ---------------------------------------------------------------- timing */
const TRAVEL = 0.85; // clone flight to centre (s)
const STAGGER = 0.045; // per-box delay
const SQUARE_DELAY = 0.64; // merge square lands as the clones arrive
const SQUARE_DUR = 0.42;
const HOLD_FAILED = 1.75; // failure on screen before the reverse
const HOLD_PASSED = 1.9; // success on screen before onSuccess
const RESET_TRAVEL = 0.72; // boxes flying home
const EASE_OUT = [0.16, 1, 0.3, 1] as const; // expo-out: fast start, silk settle
const EASE_DRAW = [0.65, 0, 0.35, 1] as const;
const EASE_BACK = [0.34, 1.2, 0.4, 1] as const; // soft impact on the merge

const glowBox = (color: string, spread: number, alpha: number) =>
  `0 0 ${spread}px color-mix(in srgb, var(${color}) ${Math.round(alpha * 100)}%, transparent)`;

const GLOW = {
  verifying: glowBox("--color-accent", 38, 0.24),
  passed: glowBox("--color-success", 72, 0.45),
  failed: glowBox("--color-error", 60, 0.4),
} as const;

function emptyDigits(n: number): string[] {
  return Array.from({ length: n }, () => "");
}

export function OtpVerify({
  length = 6,
  onVerify,
  onSuccess,
  onRetry,
  successMessage = "OTP Verified Successfully",
  failureMessage = "Verification Failed",
  submitLabel = "Verify code",
  autoFocus = true,
  disabled = false,
  className = "",
}: OtpVerifyProps) {
  const reduce = useReducedMotion();
  const [digits, setDigits] = useState<string[]>(() => emptyDigits(length));
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>("entry");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  const timers = useRef<number[]>([]);
  // Guards against a double submit (button click racing the auto-submit).
  const submitted = useRef(false);
  // Inline callbacks from parents change identity each render; hold them in
  // refs so in-flight timers and effects are never restarted by a re-render.
  const verifyRef = useRef(onVerify);
  const successRef = useRef(onSuccess);
  const retryRef = useRef(onRetry);

  useEffect(() => {
    verifyRef.current = onVerify;
    successRef.current = onSuccess;
    retryRef.current = onRetry;
  });

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const code = digits.join("");
  // NB: "abc".includes("") === true — check the slots, not the string.
  const complete = digits.length === length && digits.every((d) => d !== "");
  const entry = phase === "entry";
  const busy = !entry;

  /* ------------------------------------------------------- input handling */
  // The /link code alphabet is A-Z + 2-9 (no 0/1/O/I), so letters count too.
  const sanitize = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const focusBox = useCallback((i: number) => {
    setActive(i);
    boxes.current[i]?.focus();
  }, []);

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    if (busy || disabled) return;
    const clean = sanitize(e.target.value);
    if (!clean) {
      const next = [...digits];
      next[i] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    let target = i;
    if (clean.length > 1 && digits[i] === "") {
      // paste / SMS autofill landing on an empty box — distribute
      for (let k = 0; k < clean.length && i + k < length; k += 1) {
        next[i + k] = clean[k];
      }
      target = Math.min(i + clean.length - 1, length - 1);
    } else {
      // plain typing (also overwrites a filled box): the new char is last
      next[i] = clean[clean.length - 1];
      target = Math.min(i + 1, length - 1);
    }
    setDigits(next);
    focusBox(target);
  };

  const handlePaste = (i: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (busy || disabled) return;
    const clean = sanitize(e.clipboardData.getData("text"));
    if (!clean) return;
    e.preventDefault();
    const next = [...digits];
    for (let k = 0; k < clean.length && i + k < length; k += 1) {
      next[i + k] = clean[k];
    }
    setDigits(next);
    focusBox(Math.min(i + clean.length - 1, length - 1));
  };

  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (busy || disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        next[i - 1] = "";
        setDigits(next);
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  /* -------------------------------------------------------------- submit */
  const run = useCallback(async () => {
    if (busy || disabled || !complete || submitted.current) return;
    clearTimers();
    const rects = boxes.current.map((el) => el?.getBoundingClientRect() ?? null);
    if (rects.some((r) => r === null)) return;
    submitted.current = true;

    const vv = window.visualViewport;
    const vw = vv?.width ?? window.innerWidth;
    const vh = vv?.height ?? window.innerHeight;
    const vTop = vv?.offsetTop ?? 0;
    const vLeft = vv?.offsetLeft ?? 0;
    setSnapshot({
      rects: rects as DOMRect[],
      cx: vLeft + vw / 2,
      cy: vTop + vh / 2,
      top: vTop,
      height: vh,
    });
    setPhase("verifying");

    const convergeMs = reduce ? 320 : (TRAVEL + STAGGER * (length - 1) + 0.14) * 1000;
    const startedAt = performance.now();
    let ok = false;
    try {
      ok = await verifyRef.current(code);
    } catch {
      ok = false;
    }
    // Never reveal mid-flight: the merge finishes first, always.
    const revealIn = Math.max(0, convergeMs - (performance.now() - startedAt));
    schedule(() => {
      setPhase(ok ? "passed" : "failed");
      if (ok) schedule(() => successRef.current?.(), HOLD_PASSED * 1000);
      else schedule(() => setPhase("resetting"), HOLD_FAILED * 1000);
    }, revealIn);
  }, [busy, disabled, complete, clearTimers, reduce, length, code, schedule]);

  // Auto-submit as soon as the last digit lands (the button does the same).
  useEffect(() => {
    if (entry && complete && !disabled) {
      const t = window.setTimeout(() => void run(), 220);
      return () => window.clearTimeout(t);
    }
  }, [entry, complete, disabled, run]);

  // Re-measure the boxes the moment the reverse starts (the keyboard may
  // have come and gone, shifting the layout since the original snapshot).
  useEffect(() => {
    if (phase !== "resetting") return;
    setSnapshot((s) => {
      if (!s) return s;
      const rects = boxes.current.map((el) => el?.getBoundingClientRect() ?? null);
      if (rects.some((r) => r === null)) return s;
      return { ...s, rects: rects as DOMRect[] };
    });
  }, [phase]);

  /* --------------------------------------------- failure: reverse sequence */
  const finishReset = useCallback(() => {
    setPhase("entry");
    setSnapshot(null);
    setDigits(emptyDigits(length));
    submitted.current = false;
    focusBox(0);
    retryRef.current?.();
  }, [length, focusBox]);

  /* --------------------------------------------------------------- render */
  const overlayOn = !entry && snapshot !== null;
  const stage = phase === "verifying" || phase === "passed" || phase === "failed";
  const clones = phase === "verifying" || phase === "resetting";

  const glowNow = phase === "passed" ? GLOW.passed : phase === "failed" ? GLOW.failed : GLOW.verifying;
  const borderColor =
    phase === "passed"
      ? "var(--color-success)"
      : phase === "failed"
        ? "var(--color-error)"
        : "var(--color-line-strong)";

  const spin = (i: number) => (i % 2 === 0 ? 1 : -1) * (180 + i * 45);

  return (
    <div
      className={`flex w-full flex-col items-center ${className}`}
      role="group"
      aria-label="One-time code"
      data-phase={phase}
      data-complete={complete ? "1" : "0"}
    >
      {/* ------------------------------------------------ digit boxes */}
      <div className="grid w-full max-w-md grid-cols-6 gap-2 sm:gap-2.5">
        {digits.map((d, i) => (
          <motion.div
            key={`box-${i}`}
            className="relative"
            animate={{ scale: entry && active === i && !reduce ? 1.05 : 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <input
              ref={(el) => {
                boxes.current[i] = el;
              }}
              type="text"
              inputMode="text"
              pattern="[A-Z0-9]*"
              maxLength={length}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              aria-label={`Character ${i + 1} of ${length}`}
              value={d}
              readOnly={busy}
              tabIndex={busy || disabled ? -1 : 0}
              onChange={handleChange(i)}
              onPaste={handlePaste(i)}
              onKeyDown={handleKeyDown(i)}
              onFocus={() => setActive(i)}
              autoFocus={autoFocus && i === 0 && !disabled}
              className={`h-14 w-full rounded-[2px] border bg-surface text-center font-mono text-2xl text-fg caret-transparent outline-none transition-[border-color,box-shadow] duration-200 sm:h-16 sm:text-3xl ${
                active === i && entry
                  ? "border-accent shadow-[0_0_0_3px_rgb(215_25_63_/_0.18)]"
                  : "border-line-strong"
              } ${disabled ? "opacity-50" : ""}`}
            />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void run()}
        disabled={disabled || busy || !complete}
        className="jn-btn jn-btn-primary mt-6 w-full disabled:opacity-50 sm:w-auto"
      >
        {phase === "verifying" ? "Verifying…" : submitLabel}
      </button>

      <p aria-live="polite" className="sr-only">
        {phase === "passed" ? successMessage : phase === "failed" ? failureMessage : ""}
      </p>

      {/* ------------------------------------------- animation overlay */}
      <AnimatePresence>
        {overlayOn && snapshot && (
          <motion.div
            key="otp-overlay"
            className="pointer-events-auto fixed left-0 right-0 z-50 flex flex-col items-center justify-center bg-background/90"
            style={{ top: snapshot.top, height: snapshot.height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* travelling clones — the digits themselves */}
            {clones &&
              snapshot.rects.map((r, i) => {
                const toCentre = phase === "verifying";
                const target = toCentre
                  ? {
                      x: snapshot.cx - r.width / 2,
                      y: snapshot.cy - r.height / 2,
                      rotate: reduce ? 0 : spin(i),
                      scale: reduce ? 0.6 : 0.5,
                      opacity: 0,
                    }
                  : { x: r.left, y: r.top, rotate: 0, scale: 1, opacity: 1 };
                const trans = toCentre
                  ? {
                      duration: reduce ? 0.24 : TRAVEL,
                      delay: reduce ? 0 : i * STAGGER,
                      ease: EASE_OUT,
                      opacity: {
                        duration: reduce ? 0.2 : 0.34,
                        delay: reduce ? 0.04 : i * STAGGER + TRAVEL * 0.55,
                        ease: "linear" as const,
                      },
                    }
                  : {
                      duration: reduce ? 0.24 : RESET_TRAVEL,
                      delay: reduce ? 0 : i * 0.03,
                      ease: EASE_OUT,
                    };
                const origin = toCentre
                  ? { x: r.left, y: r.top, rotate: 0, scale: 1, opacity: 1 }
                  : {
                      x: snapshot.cx - r.width / 2,
                      y: snapshot.cy - r.height / 2,
                      rotate: reduce ? 0 : spin(i),
                      scale: reduce ? 0.6 : 0.5,
                      opacity: 0,
                    };
                return (
                  <motion.div
                    key={`clone-${i}`}
                    className="absolute left-0 top-0 grid place-items-center rounded-[2px] border border-line-strong bg-surface font-mono text-2xl text-fg shadow-[var(--shadow)] sm:text-3xl"
                    style={{ width: r.width, height: r.height }}
                    initial={origin}
                    animate={target}
                    transition={trans}
                  >
                    {digits[i]}
                  </motion.div>
                );
              })}

            {/* centre stage: the merged square -> check / cross */}
            <div className="relative z-10 flex flex-col items-center">
              <AnimatePresence>
                {stage && (
                  <motion.div
                    key="square"
                    className="relative grid h-20 w-20 place-items-center overflow-visible rounded-[3px] border bg-surface sm:h-24 sm:w-24"
                    initial={{ scale: reduce ? 0.85 : 0.45, opacity: 0 }}
                    animate={{ scale: phase === "failed" && !reduce ? [1, 0.94, 1.06, 1] : 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.22, ease: EASE_DRAW } }}
                    transition={{
                      scale: {
                        duration: reduce ? 0.24 : phase === "failed" ? 0.45 : SQUARE_DUR,
                        delay: reduce ? 0.04 : phase === "failed" || phase === "passed" ? 0 : SQUARE_DELAY,
                        ease: phase === "failed" ? "easeInOut" : EASE_BACK,
                      },
                      opacity: {
                        duration: reduce ? 0.2 : 0.3,
                        delay: reduce ? 0.04 : phase === "failed" || phase === "passed" ? 0 : SQUARE_DELAY,
                      },
                      borderColor: { duration: 0.35 },
                    }}
                    style={{ borderColor }}
                  >
                    {/* breathing glow while verifying; steady result glow after */}
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[3px]"
                      style={{ boxShadow: glowNow }}
                      initial={{ opacity: 0.6 }}
                      animate={
                        phase === "verifying" && !reduce
                          ? { opacity: [0.6, 1, 0.6] }
                          : { opacity: 1 }
                      }
                      transition={
                        phase === "verifying" && !reduce
                          ? { duration: 1.35, repeat: Infinity, ease: "easeInOut", delay: SQUARE_DELAY }
                          : { duration: 0.4 }
                      }
                    />

                    {phase === "passed" && (
                      <motion.svg
                        key="check"
                        viewBox="0 0 48 48"
                        className="h-10 w-10 sm:h-11 sm:w-11"
                        fill="none"
                        initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: reduce ? 0.2 : 0.3, ease: EASE_BACK, delay: 0.06 }}
                      >
                        <motion.path
                          d="M13 25.5 L21 33 L35 16"
                          stroke="var(--color-success)"
                          strokeWidth={4.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: reduce ? 0.25 : 0.5, ease: EASE_DRAW, delay: 0.1 }}
                        />
                      </motion.svg>
                    )}

                    {phase === "failed" && (
                      <motion.svg
                        key="cross"
                        viewBox="0 0 48 48"
                        className="h-9 w-9 sm:h-10 sm:w-10"
                        fill="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.12, delay: 0.05 }}
                      >
                        <motion.path
                          d="M17 17 L31 31"
                          stroke="var(--color-error)"
                          strokeWidth={4.5}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: reduce ? 0.2 : 0.3, ease: EASE_DRAW, delay: 0.08 }}
                        />
                        <motion.path
                          d="M31 17 L17 31"
                          stroke="var(--color-error)"
                          strokeWidth={4.5}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: reduce ? 0.2 : 0.3, ease: EASE_DRAW, delay: 0.24 }}
                        />
                      </motion.svg>
                    )}

                    {/* success only: ten restrained shards, no confetti */}
                    {phase === "passed" && !reduce && (
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                        {Array.from({ length: 10 }, (_, i) => {
                          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
                          const dist = 56 + (i % 3) * 16;
                          return (
                            <motion.span
                              key={`p-${i}`}
                              className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-[1px] bg-success"
                              initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
                              animate={{
                                x: Math.cos(a) * dist,
                                y: Math.sin(a) * dist,
                                scale: 0.35,
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                ease: EASE_OUT,
                                x: { duration: 0.8, delay: 0.16 + i * 0.02 },
                                y: { duration: 0.8, delay: 0.16 + i * 0.02 },
                                scale: { duration: 0.8, delay: 0.16 + i * 0.02 },
                                opacity: {
                                  duration: 0.8,
                                  delay: 0.16 + i * 0.02,
                                  times: [0, 0.2, 1],
                                },
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(phase === "passed" || phase === "failed") && (
                  <motion.p
                    key="msg"
                    className={`mt-6 max-w-[86vw] text-center font-display text-lg uppercase tracking-[0.14em] sm:text-2xl ${
                      phase === "passed" ? "text-success" : "text-error"
                    }`}
                    initial={{ y: reduce ? 0 : 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.45, delay: reduce ? 0.08 : 0.3, ease: EASE_OUT }}
                  >
                    {phase === "passed" ? successMessage : failureMessage}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* failure -> the reverse sequence hands control back */}
              {phase === "resetting" && (
                <ResetWatcher reduced={!!reduce} onComplete={finishReset} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Invisible watcher: resolves once the last clone has landed on its box
 * (reset travel + final stagger), then restores the entry state.
 */
function ResetWatcher({
  reduced,
  onComplete,
}: {
  reduced: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    const ms = (reduced ? 0.32 : RESET_TRAVEL + 0.03 * 5 + 0.08) * 1000;
    const t = window.setTimeout(onComplete, ms);
    return () => window.clearTimeout(t);
  }, [onComplete, reduced]);
  return null;
}
