import { SkeletonStoreHub } from "@/components/skeleton";

/**
 * Store loading state (StoreHeader/StoreFooter come from the store layout).
 * Covers the hub and — as the parent boundary — /store/coins.
 */
export default function StoreLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <SkeletonStoreHub />
    </div>
  );
}
