"use client";

import { useCallback, useSyncExternalStore } from "react";

type ThemeState = "light" | "dark" | "pending";

const STORAGE_KEY = "jn-theme";
const THEME_EVENT = "jn-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): ThemeState {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): ThemeState {
  return "pending";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Clean line icons — no emoji, pure SVG, currentColor. */
function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.6 14.2A8.6 8.6 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8Z" />
    </svg>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Read straight from the DOM at click time — the DOM is the source of truth
  // (kept correct by the blocking init script), so the switch is instant.
  const toggle = useCallback(() => {
    const current =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  }, []);

  const isDark = theme !== "light";
  const label =
    theme === "pending"
      ? "Switch theme"
      : isDark
        ? "Switch to light theme"
        : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded text-fg-muted transition-colors duration-[var(--duration)] ease-[var(--ease)] hover:text-fg active:scale-95 ${className}`}
    >
      {/* Both icons ship in markup; CSS reveals the right one for the active
          theme so the button is correct even before hydration. */}
      <span className="jn-theme-icons relative block h-[18px] w-[18px]">
        <span className="absolute inset-0 flex items-center justify-center">
          <SunIcon />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
