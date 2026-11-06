import { Skeleton } from "@/components/skeleton";

/** AFK Coins: back link + eyebrow + title + earning panel + ad slot. */
export default function AfkLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <section className="jn-dark relative">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
          <Skeleton className="h-3 w-24" />
          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="mt-4 h-[clamp(3.2rem,11vw,7rem)] w-[min(100%,34rem)]" />
          <div className="mt-8 border border-line bg-surface p-6">
            <div className="flex items-center gap-5">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
            </div>
            <Skeleton className="mt-6 h-12 w-full" />
          </div>
          <Skeleton className="mt-10 h-24 w-full opacity-70" />
        </div>
      </section>
    </div>
  );
}
