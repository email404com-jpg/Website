import type { Metadata } from "next";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: { default: "Store — Jack Network", template: "%s — Jack Store" },
  description:
    "Ranks, upgrades and coins for the Jack Network Minecraft server. Sign in once with Discord.",
  alternates: { canonical: store.url },
  openGraph: { url: store.url, title: "Jack Network Store" },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </>
  );
}
