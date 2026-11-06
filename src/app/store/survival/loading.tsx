import { SkeletonStoreCategory } from "@/components/skeleton";

/** Survival: hero band + ranks catalog grid. */
export default function SurvivalLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <SkeletonStoreCategory />
    </div>
  );
}
