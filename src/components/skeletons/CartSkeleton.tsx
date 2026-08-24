"use client";

import React from "react";

export function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-4 flex gap-4">
            <div className="h-24 w-24 shrink-0 skeleton-base" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <div className="h-5 w-3/4 skeleton-base" />
                <div className="h-4 w-1/4 skeleton-base" />
              </div>
              <div className="flex justify-between items-end">
                <div className="h-8 w-24 skeleton-base" />
                <div className="h-6 w-20 skeleton-base" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="card-surface p-6 space-y-6 sticky top-24">
          <div className="h-6 w-1/2 skeleton-base" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-1/3 skeleton-base" />
              <div className="h-4 w-1/4 skeleton-base" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-1/4 skeleton-base" />
              <div className="h-4 w-1/5 skeleton-base" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-1/3 skeleton-base" />
              <div className="h-4 w-1/4 skeleton-base" />
            </div>
            <div className="border-t border-olive-100 pt-4 flex justify-between">
              <div className="h-5 w-1/3 skeleton-base" />
              <div className="h-5 w-1/3 skeleton-base" />
            </div>
          </div>
          <div className="h-12 w-full skeleton-base rounded-full" />
        </div>
      </div>
    </div>
  );
}
