"use client";

import React from "react";

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square w-full skeleton-base rounded-2xl" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-20 shrink-0 skeleton-base rounded-xl" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="h-10 w-3/4 skeleton-base" />
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 skeleton-base" />
              <div className="h-6 w-24 skeleton-base" />
            </div>
            <div className="h-12 w-1/3 skeleton-base" />
          </div>
          
          <div className="space-y-3">
            <div className="h-4 w-full skeleton-base" />
            <div className="h-4 w-full skeleton-base" />
            <div className="h-4 w-2/3 skeleton-base" />
          </div>

          <div className="space-y-4">
            <div className="h-5 w-24 skeleton-base" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-20 skeleton-base rounded-full" />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-olive-100">
            <div className="h-14 w-32 skeleton-base rounded-full" />
            <div className="h-14 flex-1 skeleton-base rounded-full" />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton-base" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] w-full skeleton-base rounded-xl" />
              <div className="h-4 w-3/4 skeleton-base" />
              <div className="h-4 w-1/2 skeleton-base" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
