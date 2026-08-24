"use client";

import React from "react";

interface ProductSkeletonProps {
  count?: number;
  gridCols?: 2 | 3 | 4;
}

export function ProductSkeleton({ count = 8, gridCols = 4 }: ProductSkeletonProps) {
  const gridClasses = {
    2: "grid-cols-2 gap-3",
    3: "grid-cols-2 sm:grid-cols-3 gap-4",
    4: "grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${gridClasses[gridCols]}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-olive-100 rounded-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="aspect-[4/3] w-full skeleton-base rounded-none" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-3 w-16 skeleton-base" />
            <div className="space-y-2">
              <div className="h-5 w-full skeleton-base" />
              <div className="h-5 w-3/4 skeleton-base" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-4 w-24 skeleton-base" />
            </div>
            <div className="flex items-center pt-2">
              <div className="h-6 w-20 skeleton-base" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="px-4 pb-4">
            <div className="h-10 w-full skeleton-base rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
