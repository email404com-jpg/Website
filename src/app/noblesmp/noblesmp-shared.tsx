'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './noblesmp.module.css';

export function NobleFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Space+Mono&family=Inter:wght@400;500;600&display=swap"
    />
  );
}

export const MINECRAFT_NAME_RE = /^[A-Za-z0-9_]{3,16}$/;

export function isValidMinecraftName(name: string): boolean {
  return MINECRAFT_NAME_RE.test(name.trim());
}

export type ToastKind = 'success' | 'error' | 'info';

export type Toast = { id: number; kind: ToastKind; text: string };

let toastSeq = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = toastSeq++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, text }]);
      const timer = window.setTimeout(() => dismiss(id), 5200);
      timers.current.push(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const copy = timers.current;
    return () => copy.forEach((t) => window.clearTimeout(t));
  }, []);

  return { toasts, push, dismiss };
}

export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className={styles.toastStack} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'} className={`${styles.toast} ${styles[`toast_${t.kind}`]}`}>
          <span className={styles.toastText}>{t.text}</span>
          <button type="button" className={styles.toastClose} onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

const COPYRIGHT_YEAR = 2026;

export function SubTopbar() {
  return (
    <header className={styles.topbar}>
      <Link href="/noblesmp" className={styles.mark} aria-label="Back to Noble SMP home">
        <span className={styles.markChip}>NS</span>
        <span className={styles.markText}>NOBLE SMP</span>
      </Link>
      <Link href="/noblesmp" className={`${styles.discordBtn} ${styles.discordBtnSmall}`}>
        Back To Noble SMP
      </Link>
    </header>
  );
}

export function SubFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.footerRow}>
          <div className={styles.footerBrand}>
            <span className={styles.markChip}>NS</span>
            <span className={styles.markText}>Noble SMP</span>
          </div>
          <nav className={styles.footerLinks} aria-label="Noble SMP links">
            <Link href="/noblesmp">Home</Link>
            <Link href="/noblesmp/rules">Rules</Link>
            <Link href="/noblesmp/ranks">Ranks</Link>
            <Link href="/noblesmp/suggestions">Suggestion Box</Link>
          </nav>
        </div>
        <p className={styles.footerLegal}>&copy; {COPYRIGHT_YEAR} Noble SMP. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span className={styles.spinnerRow} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
