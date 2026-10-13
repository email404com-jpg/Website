import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import { Providers } from "@/components/session-provider";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const body = localFont({
  src: "./fonts/manrope-latin-wght-normal.woff2",
  variable: "--font-body-face",
  weight: "200 800",
  display: "swap",
});

const display = localFont({
  src: [
    { path: "./fonts/big-shoulders-display-latin-700-normal.woff2", weight: "700" },
    { path: "./fonts/big-shoulders-display-latin-800-normal.woff2", weight: "800" },
    { path: "./fonts/big-shoulders-display-latin-900-normal.woff2", weight: "900" },
  ],
  variable: "--font-display-face",
  display: "swap",
});

const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono-face",
  weight: "100 800",
  display: "swap",
});

const title = `${site.name} — Minecraft Practice PvP & Survival`;

/**
 * Runs before first paint: resolves stored theme (dark by default, brand-first),
 * sets <html data-theme> + color-scheme so there is zero theme flash.
 */
const themeInit = `(function(){try{var t=null;try{t=localStorage.getItem("jn-theme");}catch(e){}if(t!=="light"&&t!=="dark"){t="dark";}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"#f5f5f6":"#050505");}}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
