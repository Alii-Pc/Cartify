import React from "react";

interface ProductSkeletonProps {
  count?: number;
}

export function ProductSkeleton({ count = 8 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card-surface flex flex-col justify-between overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="aspect-square w-full bg-olive-200/50" />

          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-olive-200/60" />
              <div className="h-3 w-12 rounded bg-olive-200/60" />
            </div>
            <div className="h-5 w-3/4 rounded bg-olive-200/80" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-olive-200/50" />
              <div className="h-3 w-5/6 rounded bg-olive-200/50" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between border-t border-olive-100/60 px-5 py-3.5 bg-cream-50/40">
            <div className="h-6 w-16 rounded bg-olive-200/80" />
            <div className="h-9 w-9 rounded-full bg-olive-200/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
