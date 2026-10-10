"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { SignInButton, SignOutButton } from "./auth-buttons";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-11 w-16 animate-pulse rounded bg-surface-raised sm:w-20"
      />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={28}
            height={28}
            className="hidden rounded-full border border-line-strong sm:block"
          />
        ) : null}
        <span className="hidden max-w-24 truncate text-sm text-fg-muted lg:inline">
          {session.user.name ?? "User"}
        </span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton compact />;
}
