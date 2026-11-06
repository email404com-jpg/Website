import { Skeleton } from "@/components/skeleton";

/** Buy Coins: split hero — copy column left, pulse-ring glyph right. */
export default function StoreCoinsLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <section className="jn-dark relative">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Skeleton className="h-3 w-32" />
            <div className="mt-4 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="mt-4 h-[clamp(3.4rem,11vw,8rem)] w-[min(100%,36rem)]" />
            <div className="mt-6 max-w-lg space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 w-56" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-sm lg:col-span-5">
            <Skeleton className="absolute inset-0 rounded-full opacity-70" />
          </div>
        </div>
      </section>
    </div>
  );
}
