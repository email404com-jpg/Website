import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login with Discord',
};

import { SignInButton } from '@/components/auth-buttons';

export default function LoginPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="border border-line bg-surface-raised">
          <div aria-hidden="true" className="h-px w-full bg-accent" />
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg sm:text-3xl">
              Login
            </h1>
            <p className="mt-3 text-base leading-relaxed text-fg-muted">
              Sign in with your Discord account.
            </p>
            <div className="mt-6">
              <SignInButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
