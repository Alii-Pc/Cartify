"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, RefreshCw, Check } from "lucide-react";
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

  // Helper arrays for multi-select categories and tags
  const activeCategories = selectedCategory
    ? selectedCategory.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const activeTags = selectedTag
    ? selectedTag.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const handleCategoryCheckboxToggle = (slug: string) => {
    const isSelected = activeCategories.includes(slug);
    let updated: string[];
    if (isSelected) {
      updated = activeCategories.filter((item) => item !== slug);
    } else {
      updated = [...activeCategories, slug];
    }
    onFilterChange({ category: updated.join(",") });
  };

  const handleTagCheckboxToggle = (tagValue: string) => {
    const isSelected = activeTags.includes(tagValue);
    let updated: string[];
    if (isSelected) {
      updated = activeTags.filter((item) => item !== tagValue);
    } else {
      updated = [...activeTags, tagValue];
    }
    onFilterChange({ tag: updated.join(",") });
  };

  const hasActiveFilters =
    activeCategories.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    activeTags.length > 0 ||
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

      {/* Categories (Multi-Select Checkboxes) */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
            Categories
          </h4>
          {activeCategories.length > 0 && (
            <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-bold text-olive-800">
              {activeCategories.length} selected
            </span>
          )}
        </div>
        <div className="mt-3.5 flex flex-col gap-1.5">
          {/* All Categories Option */}
          <label
            onClick={() => onFilterChange({ category: "" })}
            className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all select-none ${
              activeCategories.length === 0
                ? "bg-olive-800/10 text-olive-900 font-semibold border border-olive-300/50"
                : "bg-transparent text-charcoal-800 hover:bg-cream-100/70 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  activeCategories.length === 0
                    ? "border-olive-800 bg-olive-800 text-cream-50"
                    : "border-charcoal-400/40 bg-white"
                }`}
              >
                {activeCategories.length === 0 && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>All Categories</span>
            </div>
          </label>

          {/* Individual Category Checkboxes */}
          {categories.map((cat) => {
            const isSelected = activeCategories.includes(cat.slug);
            return (
              <label
                key={cat._id}
                onClick={() => handleCategoryCheckboxToggle(cat.slug)}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all select-none ${
                  isSelected
                    ? "bg-olive-800/10 text-olive-900 font-semibold border border-olive-300/50"
                    : "bg-transparent text-charcoal-800 hover:bg-cream-100/70 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-olive-800 bg-olive-800 text-cream-50 shadow-2xs"
                        : "border-charcoal-400/40 bg-white hover:border-olive-600"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="flex-shrink-0">{cat.emoji}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat.productCount !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ml-2 flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-olive-800 text-cream-50"
                        : "bg-olive-200/50 text-olive-800"
                    }`}
                  >
                    {cat.productCount}
                  </span>
                )}
              </label>
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
                    ? "border-olive-800 bg-olive-800 text-cream-50 font-semibold shadow-xs"
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
              className="w-full rounded-lg border border-olive-200 bg-white py-1.5 pl-6 pr-2 text-xs text-charcoal-900 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
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
              className="w-full rounded-lg border border-olive-200 bg-white py-1.5 pl-6 pr-2 text-xs text-charcoal-900 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-olive-700 px-3 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-olive-800 shadow-xs"
          >
            Go
          </button>
        </form>
      </div>

      {/* Special Collection Tags (Multi-Select Checkboxes) */}
      <div className="border-t border-olive-100 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
            Collection Tag
          </h4>
          {activeTags.length > 0 && (
            <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-bold text-olive-800">
              {activeTags.length} selected
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {TAGS.map((t) => {
            const isSelected = activeTags.includes(t.value);
            return (
              <label
                key={t.value}
                onClick={() => handleTagCheckboxToggle(t.value)}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all select-none ${
                  isSelected
                    ? "bg-olive-800/10 text-olive-900 font-semibold border border-olive-300/50"
                    : "bg-transparent text-charcoal-800 hover:bg-cream-100/70 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-olive-800 bg-olive-800 text-cream-50 shadow-2xs"
                        : "border-charcoal-400/40 bg-white hover:border-olive-600"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span>{t.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Availability / Stock (Checkbox & Toggle) */}
      <div className="border-t border-olive-100 pt-6">
        <label
          onClick={() => onFilterChange({ inStock: !inStock })}
          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all select-none ${
            inStock
              ? "bg-olive-800/10 text-olive-900 font-semibold border border-olive-300/50"
              : "bg-transparent text-charcoal-800 hover:bg-cream-100/70 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                inStock
                  ? "border-olive-800 bg-olive-800 text-cream-50 shadow-2xs"
                  : "border-charcoal-400/40 bg-white hover:border-olive-600"
              }`}
            >
              {inStock && <Check className="h-3 w-3 stroke-[3]" />}
            </div>
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-charcoal-900">
              In Stock Only
            </span>
          </div>
          <div
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
