"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Jumps to the top on a fresh route change.
 *
 * `html { scroll-behavior: smooth }` (kept for in-page anchors) makes Next's
 * own scroll-to-top *animate* while the incoming page swaps in, so the view
 * could be left mid-page and force the visitor to scroll back up. Forcing an
 * instant scroll here after the new page has rendered pins it to the top.
 *
 * The first paint and history back/forward are left alone so the browser's own
 * scroll restoration still works.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const popped = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true; // initial load: keep whatever the browser set
      return;
    }
    if (popped.current) {
      popped.current = false; // back/forward: let scroll restoration run
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
