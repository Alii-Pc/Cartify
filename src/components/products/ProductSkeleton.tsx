import React from "react";

interface ProductSkeletonProps {
  count?: number;
}

export function ProductSkeleton({ count = 8 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-olive-100 rounded-2xl flex flex-col justify-between overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-[4/3] w-full bg-cream-100" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-2 w-16 rounded bg-olive-100" />
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded bg-olive-200/80" />
              <div className="h-4 w-3/4 rounded bg-olive-200/80" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 rounded bg-amber-100" />
              <div className="h-3 w-8 rounded bg-olive-100" />
            </div>
            <div className="h-6 w-24 rounded bg-olive-200/80" />
            <div className="h-3 w-20 rounded bg-olive-100" />
          </div>

          {/* Footer skeleton */}
          <div className="px-4 pb-4">
            <div className="h-10 w-full rounded-xl bg-olive-200/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
