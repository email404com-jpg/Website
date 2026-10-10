'use client';

import { useSession } from 'next-auth/react';
import { SignInButton, SignOutButton } from './auth-buttons';

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <span className="text-xs text-fg-subtle">Loading…</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-fg-muted sm:inline">
          {session.user.name ?? 'User'}
        </span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}
