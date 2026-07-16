"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, RefreshCw } from "lucide-react";
import type { SafeCategory } from "@/types";

interface ProductFiltersProps {
  categories: SafeCategory[];
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  selectedTag: string;
  inStock: boolean;
  onFilterChange: (filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    tag?: string;
    inStock?: boolean;
  }) => void;
  onReset: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const PRESET_PRICES = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under $30", min: "", max: "30" },
  { label: "$30 to $70", min: "30", max: "70" },
  { label: "$70 & Above", min: "70", max: "" },
];

const TAGS = [
  { label: "All Items", value: "" },
  { label: "New Arrivals", value: "New" },
  { label: "On Sale", value: "Sale" },
  { label: "Bestsellers", value: "Bestseller" },
];

export function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  selectedTag,
  inStock,
  onFilterChange,
  onReset,
  isMobileOpen,
  onCloseMobile,
}: ProductFiltersProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ minPrice: localMin, maxPrice: localMax });
  };

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      onFilterChange({ category: "" });
    } else {
      onFilterChange({ category: slug });
    }
  };

  const hasActiveFilters =
    Boolean(selectedCategory && selectedCategory !== "all") ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(selectedTag) ||
    inStock;

  const content = (
    <div className="flex flex-col gap-7 text-charcoal-800">
      {/* Header / Clear button */}
      <div className="flex items-center justify-between pb-4 border-b border-olive-100">
        <div className="flex items-center gap-2 font-display text-base font-semibold text-charcoal-900">
          <SlidersHorizontal className="h-4 w-4 text-olive-700" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-olive-700 transition-colors hover:text-olive-900 hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
          Categories
        </h4>
        <div className="mt-3.5 flex flex-col gap-2">
          <button
            onClick={() => onFilterChange({ category: "" })}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              !selectedCategory || selectedCategory === "all"
                ? "bg-olive-800 text-cream-50 font-semibold shadow-xs"
                : "bg-cream-100/50 text-charcoal-800 hover:bg-cream-100"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-olive-800 text-cream-50 font-semibold shadow-xs"
                    : "bg-cream-100/50 text-charcoal-800 hover:bg-cream-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </div>
                {cat.productCount !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isSelected
                        ? "bg-olive-700 text-cream-50"
                        : "bg-olive-200/60 text-olive-800"
                    }`}
                  >
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-olive-100 pt-6">
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
          Price Range
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PRESET_PRICES.map((preset) => {
            const isActive =
              preset.min === minPrice && preset.max === maxPrice;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onFilterChange({ minPrice: preset.min, maxPrice: preset.max })
                }
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                  isActive
                    ? "border-olive-800 bg-olive-800 text-cream-50 font-semibold"
                    : "border-olive-200 bg-white/70 text-charcoal-800 hover:border-olive-400"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handlePriceApply} className="mt-3.5 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-charcoal-700/50">
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full rounded-lg border border-olive-200 bg-white py-1.5 pl-6 pr-2 text-xs text-charcoal-900 focus:border-olive-500 focus:outline-none"
            />
          </div>
          <span className="text-charcoal-700/40 font-medium">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-charcoal-700/50">
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full rounded-lg border border-olive-200 bg-white py-1.5 pl-6 pr-2 text-xs text-charcoal-900 focus:border-olive-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-olive-700 px-3 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-olive-800"
          >
            Go
          </button>
        </form>
      </div>

      {/* Special Tags */}
      <div className="border-t border-olive-100 pt-6">
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
          Collection Tag
        </h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const isSelected = selectedTag === t.value;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => onFilterChange({ tag: t.value })}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border ${
                  isSelected
                    ? "border-olive-800 bg-olive-800 text-cream-50 font-semibold"
                    : "border-olive-200 bg-white/70 text-charcoal-800 hover:border-olive-400"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / Stock */}
      <div className="border-t border-olive-100 pt-6">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
            In Stock Only
          </span>
          <div
            onClick={() => onFilterChange({ inStock: !inStock })}
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              inStock ? "bg-olive-700" : "bg-charcoal-700/20"
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                inStock ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block card-surface p-6 h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-charcoal-900/60 backdrop-blur-xs lg:hidden">
          <div className="flex h-full w-full max-w-sm flex-col justify-between bg-cream-50 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-olive-200 pb-4 mb-4">
                <h3 className="font-display text-lg font-semibold text-charcoal-900">
                  Filter Products
                </h3>
                <button
                  onClick={onCloseMobile}
                  className="rounded-full p-2 text-charcoal-700 hover:bg-olive-100"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="mt-8 pt-4 border-t border-olive-200 flex gap-3 sticky bottom-0 bg-cream-50">
              <button
                onClick={() => {
                  onReset();
                  onCloseMobile();
                }}
                className="flex-1 rounded-full border border-olive-300 py-3 text-sm font-semibold text-charcoal-800 transition-colors hover:bg-cream-100"
              >
                Clear All
              </button>
              <button
                onClick={onCloseMobile}
                className="flex-1 rounded-full bg-olive-800 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-olive-900 shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
