"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Sparkles, ArrowRight, Award, TrendingUp } from "lucide-react";
import type { SafeProduct } from "@/types";

const BESTSELLER_PRODUCTS: SafeProduct[] = [
  {
    _id: "ceramic-pour-over-set",
    name: "Ceramic Pour-Over Coffee Set",
    slug: "ceramic-pour-over-set",
    description:
      "Hand-glazed stoneware dripper and matching carafe designed for optimal thermal retention and smooth extraction.",
    price: 38.0,
    compareAtPrice: 48.0,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 42,
    stock: 24,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Material: "Stoneware Ceramic",
      Capacity: "500 ml (2 cups)",
      Care: "Dishwasher safe",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "woven-desk-organizer",
    name: "Woven Desk Organizer Basket",
    slug: "woven-desk-organizer",
    description:
      "Hand-braided natural seagrass storage tray, perfect for keeping notebooks, pens, and desk clutter neatly tucked away.",
    price: 29.0,
    compareAtPrice: 38.0,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewCount: 19,
    stock: 35,
    featured: true,
    tag: "New",
    specifications: {
      Material: "100% Natural Seagrass",
      Dimensions: "26 cm x 18 cm x 8 cm",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "belgian-linen-throw-cushion",
    name: "Linen Throw Cushion & Pillow Cover",
    slug: "belgian-linen-throw-cushion",
    description:
      "Stonewashed Belgian linen pillowcase featuring hidden brass zipper and plush feather-down interior insert.",
    price: 45.0,
    compareAtPrice: 55.0,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewCount: 31,
    stock: 18,
    featured: false,
    tag: "Sale",
    specifications: {
      Material: "100% Belgian Linen",
      Dimensions: "50 cm x 50 cm",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "minimalist-ceramic-planter",
    name: "Minimalist Ceramic Planter Pot",
    slug: "minimalist-ceramic-planter",
    description:
      "Matte textured terracotta pot with integrated drainage tray, engineered to keep indoor foliage healthy and thriving.",
    price: 34.0,
    compareAtPrice: 42.0,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewCount: 26,
    stock: 28,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Material: "High-fired Terracotta Ceramic",
      Diameter: "18 cm (7 inches)",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "matte-black-french-press",
    name: "Double-Wall Insulated French Press",
    slug: "matte-black-french-press",
    description:
      "Heavy-gauge stainless steel cafetière with double-wall vacuum insulation to maintain ideal brewing heat for 60 minutes.",
    price: 42.0,
    compareAtPrice: 54.0,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 58,
    stock: 20,
    featured: true,
    tag: "Sale",
    specifications: {
      Capacity: "1.0 Liter (34 oz / 8 cups)",
      Material: "304 Food-Grade Stainless Steel",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "organic-cotton-relaxed-fit-tee",
    name: "Organic Combed Cotton Heavyweight Tee",
    slug: "organic-cotton-relaxed-fit-tee",
    description:
      "Crafted from 220 GSM certified organic ring-spun cotton. Features pre-shrunk construction and classic crew neckline.",
    price: 28.0,
    compareAtPrice: 35.0,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewCount: 47,
    stock: 45,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Material: "100% GOTS Certified Organic Cotton",
      Fit: "Relaxed Boxy Fit",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "solid-teak-cooking-utensil-set",
    name: "Handmade Teak Wood Cooking Utensil Set",
    slug: "solid-teak-cooking-utensil-set",
    description:
      "Six-piece kitchen set hand-carved from sustainable plantation teak. Heat-resistant, non-scratch for non-stick cookware.",
    price: 36.0,
    compareAtPrice: 48.0,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 63,
    stock: 22,
    featured: true,
    tag: "New",
    specifications: {
      Material: "100% Solid Natural Teak Wood",
      Includes: "Spatula, Slotted Spoon, Ladle, Pasta Server, Salad Fork, Utensil Cup",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "aromatherapy-botanical-candle",
    name: "Amber Glass Aromatherapy Botanical Candle",
    slug: "aromatherapy-botanical-candle",
    description:
      "Hand-poured 100% natural soy wax candle scented with pure cedarwood, wild lavender, and eucalyptus essential oils.",
    price: 26.0,
    compareAtPrice: 32.0,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 88,
    stock: 40,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Wax: "100% Eco-friendly Soy Wax",
      "Burn Time": "50+ hours",
      Wick: "Lead-free Organic Cotton Wick",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function Bestsellers() {
  const [products, setProducts] = useState<SafeProduct[]>(BESTSELLER_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        const res = await fetch("/api/products?tag=Bestseller&limit=8");
        const json = await res.json();
        if (json.success && json.data?.products && json.data.products.length >= 4) {
          setProducts(json.data.products);
        }
      } catch (err) {
        console.error("Failed to load bestsellers", err);
      }
    }
    fetchBestsellers();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category.toLowerCase().includes(activeCategory));

  return (
    <section id="bestsellers" className="relative px-6 py-20 lg:px-8 bg-cream-100/50 border-t border-olive-100/60">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-olive-200/60">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">
              <Award className="h-3.5 w-3.5 text-emerald-700" />
              <span>Customer Top Rated</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl lg:text-5xl tracking-tight">
              Trending Bestsellers
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-charcoal-700/80 leading-relaxed">
              Our most-loved pieces, highly praised by thousands of verified customers for exceptional craft and daily durability.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {[
              { id: "all", label: "All Picks" },
              { id: "kitchen", label: "Kitchen" },
              { id: "home-living", label: "Home" },
              { id: "apparel", label: "Apparel" },
              { id: "beauty", label: "Self Care" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-olive-800 text-cream-50 shadow-xs"
                    : "bg-white/80 text-charcoal-700 hover:bg-white hover:text-charcoal-900 border border-olive-200/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Product Cards Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {(filteredProducts.length > 0 ? filteredProducts : products).slice(0, 8).map((product) => (
            <ProductCard key={product._id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
