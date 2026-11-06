import {
  SkeletonFooterBar,
  SkeletonHeaderBar,
  SkeletonLines,
  SkeletonPageHero,
} from "@/components/skeleton";

/**
 * Route loading state for every main-host page without its own loading.tsx
 * (and the root segment itself). Header + PageHero + copy lines + footer —
 * the same geometry as an inner page so the swap is seamless.
 */
export default function RootLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-screen flex-col">
      <SkeletonHeaderBar />
      <main className="flex-1">
        <SkeletonPageHero />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20">
          <SkeletonLines widths={["100%", "96%", "88%", "92%", "60%"]} />
        </div>
      </main>
      <SkeletonFooterBar />
    </div>
  );
}
