import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignInButton } from "@/components/auth-buttons";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Jack Network with Discord",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-md border border-line bg-surface-raised">
          <div aria-hidden="true" className="h-px w-full bg-accent" />
          <div className="flex flex-col items-center p-10 text-center sm:p-12">
            <span className="font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
              Authentication
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-fg">
              Sign in to Jack Network
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              Use your Discord account to authenticate. This is used for future
              features like the coin store and account linking.
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
