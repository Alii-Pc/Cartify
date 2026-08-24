"use client";
import React from "react";
import { X } from "lucide-react";

interface ActiveFilterChipsProps {
  selectedCategory: string; // comma-separated slugs
  categories: { slug: string; name: string; emoji?: string }[]; // for label lookup
  minPrice: string;
  maxPrice: string;
  selectedTag: string; // comma-separated tags
  inStock: boolean;
  searchQuery: string;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  selectedCategory,
  categories,
  minPrice,
  maxPrice,
  selectedTag,
  inStock,
  searchQuery,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeCategories = selectedCategory
    ? selectedCategory.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const activeTags = selectedTag
    ? selectedTag.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const hasPriceFilter = minPrice || maxPrice;
  const hasSearchFilter = Boolean(searchQuery);

  const totalFilters =
    activeCategories.length +
    activeTags.length +
    (hasPriceFilter ? 1 : 0) +
    (inStock ? 1 : 0) +
    (hasSearchFilter ? 1 : 0);

  if (totalFilters === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {hasSearchFilter && (
        <button
          onClick={() => onRemoveFilter("search")}
          className="animate-chip-in rounded-full bg-olive-100 border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-900 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-olive-200"
          style={{ animationDelay: "0ms" }}
        >
          Search: {searchQuery}
          <X className="h-3 w-3" />
        </button>
      )}

      {activeCategories.map((slug, idx) => {
        const cat = categories.find((c) => c.slug.toLowerCase() === slug);
        const label = cat ? `${cat.emoji ? cat.emoji + " " : ""}${cat.name}` : slug;
        return (
          <button
            key={`cat-${slug}`}
            onClick={() => onRemoveFilter("category", slug)}
            className="animate-chip-in rounded-full bg-olive-100 border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-900 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-olive-200"
            style={{ animationDelay: `${(idx + (hasSearchFilter ? 1 : 0)) * 50}ms` }}
          >
            Category: {label}
            <X className="h-3 w-3" />
          </button>
        );
      })}

      {hasPriceFilter && (
        <button
          onClick={() => onRemoveFilter("price")}
          className="animate-chip-in rounded-full bg-olive-100 border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-900 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-olive-200"
          style={{ animationDelay: `${(activeCategories.length + (hasSearchFilter ? 1 : 0)) * 50}ms` }}
        >
          Price: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "Any"}
          <X className="h-3 w-3" />
        </button>
      )}

      {activeTags.map((tag, idx) => (
        <button
          key={`tag-${tag}`}
          onClick={() => onRemoveFilter("tag", tag)}
          className="animate-chip-in rounded-full bg-olive-100 border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-900 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-olive-200"
          style={{ animationDelay: `${(activeCategories.length + (hasPriceFilter ? 1 : 0) + (hasSearchFilter ? 1 : 0) + idx) * 50}ms` }}
        >
          Tag: {tag}
          <X className="h-3 w-3" />
        </button>
      ))}

      {inStock && (
        <button
          onClick={() => onRemoveFilter("inStock")}
          className="animate-chip-in rounded-full bg-olive-100 border border-olive-200 px-3 py-1.5 text-xs font-medium text-olive-900 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-olive-200"
          style={{ animationDelay: `${(activeCategories.length + activeTags.length + (hasPriceFilter ? 1 : 0) + (hasSearchFilter ? 1 : 0)) * 50}ms` }}
        >
          In Stock
          <X className="h-3 w-3" />
        </button>
      )}

      {totalFilters >= 2 && (
        <button
          onClick={onClearAll}
          className="animate-chip-in rounded-full bg-charcoal-800 border border-transparent px-3 py-1.5 text-xs font-medium text-cream-50 flex items-center gap-1.5 whitespace-nowrap transition-colors hover:bg-charcoal-900"
          style={{ animationDelay: `${totalFilters * 50}ms` }}
        >
          Clear All
        </button>
      )}
    </div>
  );
}
