import {
  Skeleton,
  SkeletonFooterBar,
  SkeletonHeaderBar,
  SkeletonPageHero,
  SkeletonStatusCard,
} from "@/components/skeleton";

/** Status: header + PageHero + the live status panel + footer. */
export default function StatusLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-screen flex-col">
      <SkeletonHeaderBar />
      <main className="flex-1">
        <SkeletonPageHero />
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <SkeletonStatusCard />
          <Skeleton className="mt-8 h-11 w-48" />
        </div>
      </main>
      <SkeletonFooterBar />
    </div>
  );
}
