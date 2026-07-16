"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSort } from "@/components/products/ProductSort";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { SafeProduct, SafeCategory } from "@/types";

export default function CategoryDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<SafeProduct[]>([]);
  const [category, setCategory] = useState<SafeCategory | null>(null);
  const [sortParam, setSortParam] = useState("newest");

  useEffect(() => {
    if (!slug) return;

    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        // Fetch categories to find our category info
        const catRes = await fetch("/api/categories");
        const catJson = await catRes.json();
        if (catJson.success && catJson.data) {
          const matched = catJson.data.find(
            (c: SafeCategory) => c.slug.toLowerCase() === slug.toLowerCase()
          );
          if (matched) {
            setCategory(matched);
          }
        }

        // Fetch filtered products
        const prodRes = await fetch(`/api/products?category=${slug}&sort=${sortParam}&limit=50`);
        const prodJson = await prodRes.json();
        if (prodJson.success && prodJson.data) {
          setProducts(prodJson.data.products || []);
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [slug, sortParam]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-charcoal-700/60">
        <Link href="/" className="hover:text-olive-800">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/categories" className="hover:text-olive-800">
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-charcoal-900 font-semibold capitalize">
          {category?.name || slug.replace("-", " ")}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="mb-12 rounded-3xl bg-cream-100/80 border border-olive-100 p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-xs">
              {category?.emoji || "🏷️"}
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl capitalize">
                {category?.name || slug.replace("-", " ")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-charcoal-700/80 leading-relaxed">
                {category?.description ||
                  `Explore our full lineup of curated products inside the ${slug.replace("-", " ")} category.`}
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-2 rounded-full border border-olive-200 bg-white px-5 py-2.5 text-xs font-semibold text-charcoal-800 transition-colors hover:bg-cream-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Products</span>
          </Link>
        </div>
      </div>

      {/* Controls & Grid */}
      <ProductSort
        total={products.length}
        page={1}
        limit={products.length || 1}
        currentSort={sortParam}
        onSortChange={(sort) => setSortParam(sort)}
        onToggleMobileFilters={() => router.push(`/products?category=${slug}`)}
        activeFilterCount={1}
      />

      <div className="mt-6">
        {loading ? (
          <ProductSkeleton count={8} />
        ) : (
          <ProductGrid
            products={products}
            onResetFilters={() => router.push("/products")}
          />
        )}
      </div>
    </div>
  );
}
