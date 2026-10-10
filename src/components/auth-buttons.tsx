'use client';

import { signIn, signOut } from 'next-auth/react';

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn('discord')}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-accent px-5 text-sm font-semibold tracking-wide text-white transition-[background-color,transform] duration-[var(--duration)] ease-[var(--ease)] hover:bg-accent-hover active:scale-[0.98]"
    >
      Login with Discord
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line-strong bg-surface px-5 text-sm font-semibold text-fg-muted transition-[border-color,color,transform] duration-[var(--duration)] ease-[var(--ease)] hover:border-accent hover:text-fg active:scale-[0.98]"
    >
      Logout
    </button>
  );
}
