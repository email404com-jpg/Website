/**
 * Skeleton loading placeholders for the route loading states (loading.tsx).
 *
 * Every block is an aria-hidden hairline box on the surface colour with a slow
 * shimmer sweep (`.jn-skeleton`, globals.css); the shapes mirror the real
 * header / PageHero / cards so nothing jumps when the page arrives. Motion
 * stops under prefers-reduced-motion.
 */

type SkeletonProps = { className?: string; style?: React.CSSProperties };

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div aria-hidden="true" className={`jn-skeleton ${className}`} style={style} />;
}

/** Site header chrome — mirrors SiteHeader's h-16 bar so the swap is seamless. */
export function SkeletonHeaderBar() {
  return (
    <header className="jn-dark sticky top-0 z-50 border-b border-line bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-3 sm:px-8">
        <div className="flex min-h-11 shrink-0 items-center gap-3">
          <Skeleton className="h-8 w-[38px]" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
        </div>
        <nav aria-hidden="true" className="ml-auto hidden items-center gap-6 lg:flex">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </nav>
        <div aria-hidden="true" className="ml-auto flex items-center gap-2 lg:ml-4">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="hidden h-11 w-11 sm:block" />
          <Skeleton className="h-11 w-11" />
        </div>
      </div>
    </header>
  );
}

/** Inner-page cinematic band — mirrors PageHero's geometry. */
export function SkeletonPageHero() {
  return (
    <section className="jn-dark relative border-b border-line">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="mt-5 h-[clamp(3rem,9vw,6.5rem)] w-[min(100%,42rem)]" />
        <div className="mt-6 max-w-2xl space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </section>
  );
}

/** Body copy lines. */
export function SkeletonLines({
  className = "",
  widths = ["100%", "94%", "86%", "58%"],
}: SkeletonProps & { widths?: string[] }) {
  return (
    <div aria-hidden="true" className={`space-y-4 ${className}`}>
      {widths.map((w, i) => (
        <Skeleton key={i} className="h-4" style={{ width: w }} />
      ))}
    </div>
  );
}

/** Footer top edge — mirrors SiteFooter's hairline + columns. */
export function SkeletonFooterBar() {
  return (
    <footer className="jn-dark relative border-t border-line">
      <div aria-hidden="true" className="jn-hairline absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-64 max-w-full" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Status panel — mirrors ServerStatus's bordered card. */
export function SkeletonStatusCard() {
  return (
    <div className="border border-line bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface px-5 py-6 sm:px-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-4 h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-line px-5 py-5 sm:px-6">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-3 w-52" />
      </div>
    </div>
  );
}

/** Store hub — hero band + three category boxes. */
export function SkeletonStoreHub() {
  return (
    <div className="jn-dark relative">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-8 sm:pt-20 sm:pb-32">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="mt-5 h-[clamp(3.4rem,11vw,8.5rem)] w-[min(100%,56rem)]" />
        <Skeleton className="mt-6 h-4 w-full max-w-xl" />
        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <div className="flex min-h-[26rem] flex-col justify-between border border-line bg-surface p-6 sm:min-h-[30rem] sm:p-8">
                <Skeleton className="h-16 w-24 opacity-70" />
                <div>
                  <Skeleton className="h-10 w-3/5" />
                  <Skeleton className="mt-3 h-3 w-4/5" />
                  <Skeleton className="mt-6 h-3 w-20" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Store category page — hero band + catalog grid. */
export function SkeletonStoreCategory() {
  return (
    <>
      <section className="jn-dark relative border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-20">
          <Skeleton className="h-3 w-32" />
          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="mt-4 h-[clamp(3.4rem,11vw,8rem)] w-[min(100%,44rem)]" />
          <Skeleton className="mt-5 h-4 w-full max-w-lg" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-line bg-surface p-5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="mt-4 h-8 w-3/5" />
              <Skeleton className="mt-4 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-4/5" />
              <Skeleton className="mt-6 h-11 w-full" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
