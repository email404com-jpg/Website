import { SkeletonStoreCategory } from "@/components/skeleton";

/** Practice PvP: hero band + ranks catalog grid. */
export default function PracticeLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <SkeletonStoreCategory />
    </div>
  );
}
