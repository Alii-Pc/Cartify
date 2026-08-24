"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ProductSortProps {
  total: number;
  page: number;
  limit: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  onToggleMobileFilters: () => void;
  activeFilterCount: number;
  gridCols?: 2 | 3 | 4;
  onGridColsChange?: (cols: 2 | 3 | 4) => void;
}

// Simple custom SVG components for grid layouts
const Grid2Icon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="3" width="7" height="18" rx="1" />
  </svg>
);

const Grid3Icon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="4" height="18" rx="0.5" />
    <rect x="10" y="3" width="4" height="18" rx="0.5" />
    <rect x="17" y="3" width="4" height="18" rx="0.5" />
  </svg>
);

const Grid4Icon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="3" height="18" rx="0.5" />
    <rect x="8" y="3" width="3" height="18" rx="0.5" />
    <rect x="13" y="3" width="3" height="18" rx="0.5" />
    <rect x="18" y="3" width="3" height="18" rx="0.5" />
  </svg>
);

export function ProductSort({
  total,
  page,
  limit,
  currentSort,
  onSortChange,
  onToggleMobileFilters,
  activeFilterCount,
  gridCols = 4,
  onGridColsChange,
}: ProductSortProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-4 border-b border-olive-100/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Results summary */}
      <div className="text-sm font-medium text-charcoal-700">
        Showing <span className="font-semibold text-charcoal-900">{startItem}-{endItem}</span> of{" "}
        <span className="font-semibold text-charcoal-900">{total}</span> products
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        {/* Mobile filter toggle */}
        <button
          onClick={onToggleMobileFilters}
          className="flex items-center gap-2 rounded-full border border-olive-200 bg-white px-4 py-2 text-sm font-medium text-charcoal-800 transition-colors hover:bg-cream-100 lg:hidden shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 text-olive-700" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-olive-700 px-1.5 text-xs font-semibold text-cream-50">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="flex flex-1 items-center gap-2 sm:flex-initial">
          <ArrowUpDown className="hidden h-4 w-4 text-charcoal-700/60 sm:block" />
          <label htmlFor="sort-select" className="sr-only">
            Sort products
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-full border border-olive-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-charcoal-800 transition-colors focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 sm:w-auto"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Most Popular</option>
          </select>
        </div>

        {/* Grid Density Toggle (Desktop only) */}
        {onGridColsChange && (
          <div className="hidden lg:flex items-center gap-1 border-l border-olive-200 pl-3 ml-3">
            <button
              onClick={() => onGridColsChange(2)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 2
                  ? "bg-olive-800 text-cream-50"
                  : "text-charcoal-600 hover:bg-olive-100"
              }`}
              aria-label="2 columns"
            >
              <Grid2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onGridColsChange(3)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 3
                  ? "bg-olive-800 text-cream-50"
                  : "text-charcoal-600 hover:bg-olive-100"
              }`}
              aria-label="3 columns"
            >
              <Grid3Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onGridColsChange(4)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 4
                  ? "bg-olive-800 text-cream-50"
                  : "text-charcoal-600 hover:bg-olive-100"
              }`}
              aria-label="4 columns"
            >
              <Grid4Icon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
