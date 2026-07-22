"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, Flame, Clock, Sparkles } from "lucide-react";
import type { SafeProduct } from "@/types";

const now = new Date().toISOString();

const FEATURED_ITEMS: SafeProduct[] = [
  {
    _id: "6695b1f0e24a1b001a2b3c01",
    name: "Ceramic Pour-Over Coffee Set",
    slug: "ceramic-pour-over-set",
    description: "Hand-thrown matte stoneware pour-over dripper paired with a thermal double-walled carafe.",
    price: 38.0,
    compareAtPrice: 48.0,
    category: "kitchen",
    stock: 14,
    rating: 4.9,
    reviewCount: 128,
    images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"],
    tag: "New",
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "6695b1f0e24a1b001a2b3c02",
    name: "Linen Weekend Travel Bag",
    slug: "linen-weekend-bag",
    description: "Spacious heavy-duty natural linen duffel featuring reinforced vegetable-tanned leather handles.",
    price: 74.0,
    compareAtPrice: 95.0,
    category: "apparel",
    stock: 8,
    rating: 4.8,
    reviewCount: 84,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"],
    tag: "Sale",
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "6695b1f0e24a1b001a2b3c03",
    name: "Matte Steel Water Bottle (1L)",
    slug: "matte-steel-water-bottle",
    description: "Vacuum-insulated food-grade stainless steel bottle keeping beverages cold for 24 hours.",
    price: 22.0,
    compareAtPrice: 28.0,
    category: "outdoors",
    stock: 25,
    rating: 5.0,
    reviewCount: 240,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"],
    tag: "Bestseller",
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "6695b1f0e24a1b001a2b3c04",
    name: "Woven Bamboo Desk Organizer",
    slug: "woven-desk-organizer",
    description: "Minimalist multi-compartment desktop caddy woven from natural organic bamboo fiber.",
    price: 29.0,
    compareAtPrice: 35.0,
    category: "home-living",
    stock: 12,
    rating: 4.7,
    reviewCount: 62,
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"],
    tag: "New",
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
];

export function FeaturedProducts() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_ITEMS.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-olive-900 via-olive-850 to-olive-900 p-8 sm:p-12 text-cream-50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Over 24+ Unique Items</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream-50">
              Want to see our entire curated catalog?
            </h3>
            <p className="text-xs sm:text-sm text-cream-100/70 max-w-xl leading-relaxed">
              Filter by price, sort by bestsellers, and discover thoughtful essentials designed to elevate your everyday routine.
            </p>
          </div>

          <Link
            href="/products"
            className="flex-shrink-0 inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-sm font-bold text-olive-950 transition-all hover:bg-cream-100 hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>Explore All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
