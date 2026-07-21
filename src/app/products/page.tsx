"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductSort } from "@/components/products/ProductSort";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ProductPagination } from "@/components/products/ProductPagination";
import { Search, X } from "lucide-react";
import type { SafeProduct, SafeCategory, PaginatedProductsResponse } from "@/types";

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<SafeProduct[]>([]);
  const [categories, setCategories] = useState<SafeCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read URL params or set defaults
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const tagParam = searchParams.get("tag") || "";
  const inStockParam = searchParams.get("inStock") === "true";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = Number(searchParams.get("page")) || 1;

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (qParam) params.set("q", qParam);
        if (categoryParam) params.set("category", categoryParam);
        if (minPriceParam) params.set("minPrice", minPriceParam);
        if (maxPriceParam) params.set("maxPrice", maxPriceParam);
        if (tagParam) params.set("tag", tagParam);
        if (inStockParam) params.set("inStock", "true");
        if (sortParam) params.set("sort", sortParam);
        params.set("page", pageParam.toString());
        params.set("limit", "12");

        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          const data: PaginatedProductsResponse = json.data;
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    qParam,
    categoryParam,
    minPriceParam,
    maxPriceParam,
    tagParam,
    inStockParam,
    sortParam,
    pageParam,
  ]);

  const updateUrl = (updates: Record<string, string | boolean | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === false || (key === "page" && val === 1)) {
        params.delete(key);
      } else {
        params.set(key, val.toString());
      }
    });

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchQuery, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateUrl({ q: "", page: 1 });
  };

  const handleFilterChange = (newFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    tag?: string;
    inStock?: boolean;
  }) => {
    updateUrl({
      ...newFilters,
      page: 1, // Reset to page 1 on filter change
    });
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    router.push("/products", { scroll: false });
  };

  const activeCategoriesCount = categoryParam && categoryParam !== "all" ? categoryParam.split(",").filter(Boolean).length : 0;
  const activeTagsCount = tagParam ? tagParam.split(",").filter(Boolean).length : 0;
  const activeFilterCount =
    activeCategoriesCount +
    activeTagsCount +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (inStockParam ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Banner */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal-900 sm:text-4xl">
            Explore Collection
          </h1>
          <p className="mt-2 text-sm text-charcoal-700/70">
            Carefully curated everyday essentials designed for durability, simplicity, and delight.
          </p>
        </div>

        {/* Keyword Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" />
          <input
            type="search"
            placeholder="Search catalog by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-olive-200 bg-white/80 py-2.5 pl-10 pr-9 text-sm text-charcoal-800 placeholder:text-charcoal-700/40 transition-colors focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-charcoal-700/40 hover:text-charcoal-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Main Layout (Sidebar + Grid) */}
      <div className="flex items-start gap-6 lg:gap-8">
        {/* Filters Sidebar & Mobile Drawer */}
        <ProductFilters
          categories={categories}
          selectedCategory={categoryParam}
          minPrice={minPriceParam}
          maxPrice={maxPriceParam}
          selectedTag={tagParam}
          inStock={inStockParam}
          onFilterChange={handleFilterChange}
          onReset={handleResetAllFilters}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Products Column */}
        <div className="flex-1 min-w-0">
          <ProductSort
            total={total}
            page={pageParam}
            limit={12}
            currentSort={sortParam}
            onSortChange={(sort) => updateUrl({ sort, page: 1 })}
            onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          <div className="mt-6">
            {loading ? (
              <ProductSkeleton count={8} />
            ) : (
              <ProductGrid
                products={products}
                onResetFilters={handleResetAllFilters}
              />
            )}
          </div>

          {!loading && totalPages > 1 && (
            <ProductPagination
              currentPage={pageParam}
              totalPages={totalPages}
              onPageChange={(p) => updateUrl({ page: p })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <ProductSkeleton count={8} />
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
