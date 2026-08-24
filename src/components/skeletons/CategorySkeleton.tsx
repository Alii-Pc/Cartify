"use client";

import React from "react";

interface CategorySkeletonProps {
  count?: number;
}

export function CategorySkeleton({ count = 6 }: CategorySkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card-surface p-6 flex items-start gap-4 h-full">
          <div className="h-12 w-12 shrink-0 rounded-full skeleton-base" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 w-2/3 skeleton-base" />
            <div className="space-y-2">
              <div className="h-3 w-full skeleton-base" />
              <div className="h-3 w-4/5 skeleton-base" />
            </div>
            <div className="h-5 w-16 skeleton-base rounded-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
