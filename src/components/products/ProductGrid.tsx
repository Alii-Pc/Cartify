"use client";

import React from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { PackageOpen, RefreshCw } from "lucide-react";
import type { SafeProduct } from "@/types";

interface ProductGridProps {
  products: SafeProduct[];
  onResetFilters?: () => void;
  onAddToCart?: (product: SafeProduct) => void;
}

export function ProductGrid({
  products,
  onResetFilters,
  onAddToCart,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-100/80 text-olive-800">
          <PackageOpen className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-charcoal-900">
          No products found
        </h3>
        <p className="mt-2 max-w-sm text-sm text-charcoal-700/70">
          We couldn&apos;t find any items matching your exact search criteria or filters. Try adjusting your selections.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-6 flex items-center gap-2 rounded-full bg-olive-700 px-6 py-2.5 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-800 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
