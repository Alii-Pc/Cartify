"use client";

import React from "react";

export function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center max-w-2xl mx-auto mb-12">
        {[1, 2, 3].map((i, idx) => (
          <React.Fragment key={i}>
            <div className="h-10 w-10 rounded-full skeleton-base shrink-0" />
            {idx < 2 && <div className="h-1 w-full max-w-[120px] mx-4 skeleton-base" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Address Section */}
          <div className="card-surface p-6 space-y-6">
            <div className="h-6 w-1/4 skeleton-base mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 w-full skeleton-base" />
              <div className="h-32 w-full skeleton-base" />
            </div>
          </div>

          {/* Payment Section */}
          <div className="card-surface p-6 space-y-6">
            <div className="h-6 w-1/4 skeleton-base mb-4" />
            <div className="space-y-4">
              <div className="h-14 w-full skeleton-base" />
              <div className="h-14 w-full skeleton-base" />
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-surface p-6 space-y-6 sticky top-24">
            <div className="h-6 w-1/2 skeleton-base" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-16 w-16 skeleton-base rounded-md" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-full skeleton-base" />
                    <div className="h-4 w-1/3 skeleton-base" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-olive-100 pt-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-1/3 skeleton-base" />
                <div className="h-4 w-1/4 skeleton-base" />
              </div>
              <div className="flex justify-between">
                <div className="h-5 w-1/3 skeleton-base" />
                <div className="h-5 w-1/3 skeleton-base" />
              </div>
            </div>
            <div className="h-12 w-full skeleton-base rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
