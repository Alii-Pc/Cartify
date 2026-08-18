"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, Flame, Clock, Sparkles } from "lucide-react";
import type { SafeProduct } from "@/types";

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<SafeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true&limit=4");
        const json = await res.json();
        if (json.success && json.data?.products) {
          setFeaturedProducts(json.data.products);
        }
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num: number) => num.toString().padStart(2, "0");

  return (
    <section id="deals" className="relative overflow-hidden bg-cream-100/70 px-6 py-28 lg:px-8 border-y border-olive-100/60">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-olive-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-amber-100/40 blur-3xl" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Top Bar with Badge and Countdown */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-olive-200/60">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">
              <Flame className="h-3.5 w-3.5 text-amber-600 animate-bounce" />
              <span>Limited Time Flash Offers</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl lg:text-5xl tracking-tight">
              Featured Collection
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-charcoal-700/80 leading-relaxed">
              Handpicked customer favorites and exclusive seasonal deals. Add directly to your cart with one click or save to your wishlist for later.
            </p>
          </div>

          {/* Countdown Box */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-olive-200/80 shadow-xs self-start md:self-auto">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-800">
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>Offer Ends In:</span>
            </div>
            <div className="flex items-center gap-2 font-display font-bold text-lg text-charcoal-900">
              <span className="bg-olive-900 text-cream-50 px-2.5 py-1 rounded-lg min-w-[36px] text-center shadow-xs">
                {formatDigits(timeLeft.hours)}
              </span>
              <span className="text-olive-800 font-extrabold">:</span>
              <span className="bg-olive-900 text-cream-50 px-2.5 py-1 rounded-lg min-w-[36px] text-center shadow-xs">
                {formatDigits(timeLeft.minutes)}
              </span>
              <span className="text-olive-800 font-extrabold">:</span>
              <span className="bg-amber-600 text-cream-50 px-2.5 py-1 rounded-lg min-w-[36px] text-center shadow-xs">
                {formatDigits(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/50 animate-pulse border border-olive-100" />
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-charcoal-700/60 text-sm font-semibold">
              No featured products available right now. Check back soon!
            </div>
          )}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 relative overflow-hidden rounded-3xl border border-olive-200/60 bg-white/50 p-8 sm:p-12 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-8 group transition-all hover:shadow-md hover:bg-white/70">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-olive-200/40 blur-3xl transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative z-10 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Over 24+ Unique Items</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-900">
              Discover the entire collection
            </h3>
            <p className="text-sm text-charcoal-700/80 max-w-xl leading-relaxed font-medium">
              Filter by price, sort by bestsellers, and find thoughtful essentials designed to elevate your everyday routine.
            </p>
          </div>

          <Link
            href="/products"
            className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-olive-800 px-8 py-4 text-sm font-bold text-cream-50 transition-all hover:bg-olive-900 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <span>Explore All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
