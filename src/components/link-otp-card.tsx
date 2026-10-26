"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth-buttons";
import { OtpVerify } from "@/components/otp-verify";

type LinkState =
  | { state: "signed-out" }
  | { state: "loading" }
  | { state: "none" }
  | { state: "linked"; username: string | null; uuid: string | null }
  | { state: "error" };

function Skeleton() {
  return <div className="h-40 animate-pulse bg-surface-raised" aria-hidden="true" />;
}

/**
 * The /link page body: sign in, then enter the 6-digit code minted in game
 * with /link. Verification runs through OtpVerify, which only ever shows
 * success after POST /api/link/redeem actually returns 2xx.
 */
export function LinkOtpCard() {
  const { status } = useSession();
  const [data, setData] = useState<LinkState>({ state: "loading" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/link", { cache: "no-store" });
      if (res.status === 401) return setData({ state: "signed-out" });
      if (!res.ok) return setData({ state: "error" });
      setData((await res.json()) as LinkState);
    } catch {
      setData({ state: "error" });
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [status, load]);

  const verify = useCallback(async (code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/link/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        // Stay on the success animation; onSuccess refetches once it settles.
        return true;
      }
      if (res.status === 409) {
        // Already linked elsewhere — surface the linked card on retry.
        void load();
      }
      return false;
    } catch {
      return false;
    }
  }, [load]);

  if (status === "loading") return <Skeleton />;

  if (status === "unauthenticated" || data.state === "signed-out") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow text-fg-subtle">Account</p>
        <h2 className="mt-3 font-display text-3xl font-black uppercase text-fg">
          Sign in first
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
          Linking ties a Minecraft player to the Discord account you sign in
          with. Sign in and the code field will appear here.
        </p>
        <div className="mt-6">
          <SignInButton callbackUrl="/link" />
        </div>
      </section>
    );
  }

  if (data.state === "loading") return <Skeleton />;

  if (data.state === "error") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow text-error">Error</p>
        <p className="mt-3 text-sm text-fg-muted">
          Something went wrong loading your link status. Refresh and try again.
        </p>
        <button type="button" onClick={() => void load()} className="jn-btn jn-btn-ghost mt-6">
          Retry
        </button>
      </section>
    );
  }

  if (data.state === "linked") {
    return (
      <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
        <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
        <p className="jn-eyebrow flex items-center gap-2 text-success">
          <span className="jn-blink h-2 w-2 rounded-full bg-success" />{" "}
          Already linked
        </p>
        <p className="mt-3 font-display text-4xl font-black uppercase text-fg">
          {data.username ?? "Player"}
        </p>
        <p className="mt-1 font-mono text-xs break-all text-fg-subtle">{data.uuid}</p>
        <p className="mt-6 max-w-prose text-sm leading-relaxed text-fg-muted">
          This Discord login is already connected to a Minecraft account, so no
          code can be entered. Unlink it first if you want to move the link to a
          different player.
        </p>
        <a href="/unverify" className="jn-btn jn-btn-ghost mt-6 inline-flex">
          Unverify this account
        </a>
      </section>
    );
  }

  // state === "none" — the OTP field with the convergence animation.
  return (
    <section className="relative border border-line-strong bg-surface p-6 sm:p-8">
      <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-20 bg-accent" />
      <p className="jn-eyebrow text-fg-subtle">Enter your link code</p>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
        Run <span className="font-mono text-accent-ink">/link</span> in game, then
        type the 6-digit code it gives you. One code, one account, 10 minutes.
      </p>

      <ol className="mt-6 mb-8 border-t border-line">
        {["Join play.jacknetwork.in", "Run /link", "Enter the code below"].map(
          (t, i) => (
            <li key={t} className="flex items-center gap-5 border-b border-line py-4">
              <span className="font-display w-10 text-4xl leading-none font-black text-fg-disabled">
                0{i + 1}
              </span>
              <span className="text-sm text-fg">{t}</span>
            </li>
          ),
        )}
      </ol>

      <OtpVerify
        onVerify={verify}
        onSuccess={() => void load()}
        onRetry={() => void load()}
        successMessage="OTP Verified Successfully"
        failureMessage="Verification Failed"
      />
    </section>
  );
}
