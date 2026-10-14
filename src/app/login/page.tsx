import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignInButton } from "@/components/auth-buttons";
import { HeroScene } from "@/components/hero-scene";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Jack Network with Discord",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        <HeroScene
          src="/media/practice-nether.webp"
          alt=""
          priority={false}
          keepStill
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, var(--panel-fade) 0%, var(--scrim-mid) 100%)",
          }}
        />

        <div className="relative w-full max-w-md border border-line bg-surface">
          <div aria-hidden="true" className="h-px w-full bg-accent" />
          <div className="flex flex-col items-center p-10 text-center sm:p-12">
            <span className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">
              Authentication
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-fg">
              Sign in to Jack Network
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              Use your Discord account to sign in to the coin store — check your
              balance, link your Minecraft account, and earn coins on the AFK
              page.
            </p>
            <div className="mt-8 w-full">
              <SignInButton />
            </div>
            <p className="mt-6 text-xs leading-relaxed text-fg-subtle">
              By signing in you agree to the{" "}
              <a
                href="/terms"
                className="text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
              >
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
