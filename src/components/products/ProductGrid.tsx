"use client";

import React from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { PackageOpen, RefreshCw } from "lucide-react";
import type { SafeProduct } from "@/types";

interface ProductGridProps {
  products: SafeProduct[];
  onResetFilters?: () => void;
  onAddToCart?: (product: SafeProduct) => void;
  gridCols?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  onResetFilters,
  onAddToCart,
  gridCols = 4,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center p-16 text-center border border-dashed border-olive-200 bg-olive-50/30">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-100 text-olive-800 shadow-inner">
          <PackageOpen className="h-10 w-10 opacity-80" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-charcoal-900">
          No matches found
        </h3>
        <p className="mt-3 max-w-md text-sm text-charcoal-700/80 leading-relaxed">
          We couldn&apos;t find any products matching your exact search criteria or filters. Try removing some filters or adjusting your search to find what you&apos;re looking for.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-8 flex items-center gap-2 rounded-full bg-olive-800 px-7 py-3 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-900 active:scale-95 shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  const gridClass = {
    2: "grid-cols-2 gap-4 sm:gap-6",
    3: "grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3",
    4: "grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",
  }[gridCols];

  return (
    <div className={`grid ${gridClass}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          compact={gridCols >= 4}
        />
      ))}
    </div>
  );
}
