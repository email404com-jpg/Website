import { Skeleton, SkeletonHeaderBar } from "@/components/skeleton";

/** Login: header + the centred sign-in card (mirrors login/page.tsx). */
export default function LoginLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-screen flex-col">
      <SkeletonHeaderBar />
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-md border border-line bg-surface">
          <span aria-hidden="true" className="block h-px w-full bg-accent" />
          <div className="flex flex-col items-center p-10 text-center sm:p-12">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-7 w-56" />
            <Skeleton className="mt-6 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-8 h-12 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
