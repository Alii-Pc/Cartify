"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import type { SafeCategory } from "@/types";

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<SafeCategory[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive-100 text-olive-800">
          <Layers className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
          Shop by Category
        </h1>
        <p className="mt-4 text-base text-charcoal-700/75 leading-relaxed">
          Explore our thoughtfully curated collections. From minimalist living decor to premium everyday essentials, discover what speaks to you.
        </p>
      </div>

      {/* Grid */}
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card-surface p-8 h-48 animate-pulse flex flex-col justify-between"
            >
              <div className="h-12 w-12 rounded-full bg-olive-200/50" />
              <div className="space-y-2">
                <div className="h-5 w-36 rounded bg-olive-200/80" />
                <div className="h-4 w-full rounded bg-olive-200/50" />
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-charcoal-700/70">
            No categories available at the moment.
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group card-surface flex flex-col justify-between p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-olive"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-3xl shadow-xs transition-transform duration-300 group-hover:scale-110">
                  {category.emoji}
                </span>
                {category.productCount !== undefined && (
                  <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-800">
                    {category.productCount} {category.productCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <h2 className="font-display text-xl font-bold text-charcoal-900 group-hover:text-olive-800 transition-colors flex items-center justify-between">
                  <span>{category.name}</span>
                  <ChevronRight className="h-5 w-5 text-charcoal-700/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-olive-800" />
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-charcoal-700/80">
                  {category.description}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
