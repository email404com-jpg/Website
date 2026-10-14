"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-1234567890123456
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT; // ad unit id

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Google AdSense unit. Renders nothing until both env vars are set at build time. */
export function AdSlot({ className = "" }: { className?: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (!CLIENT || !SLOT || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked or not ready */
    }
  }, []);

  if (!CLIENT || !SLOT) return null;
  return (
    <div className={className}>
      <Script
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
      />
      <p className="jn-eyebrow mb-2 text-center text-fg-disabled">Advertisement</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
