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
}

export function ProductSort({
  total,
  page,
  limit,
  currentSort,
  onSortChange,
  onToggleMobileFilters,
  activeFilterCount,
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

      <div className="flex items-center gap-3">
        {/* Mobile filter toggle */}
        <button
          onClick={onToggleMobileFilters}
          className="flex items-center gap-2 rounded-full border border-olive-200 bg-white px-4 py-2 text-sm font-medium text-charcoal-800 transition-colors hover:bg-cream-100 lg:hidden"
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
        <div className="flex items-center gap-2">
          <ArrowUpDown className="hidden h-4 w-4 text-charcoal-700/60 sm:block" />
          <label htmlFor="sort-select" className="sr-only">
            Sort products
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-full border border-olive-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-charcoal-800 transition-colors focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
