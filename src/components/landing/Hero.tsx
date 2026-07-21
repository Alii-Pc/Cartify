"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Star,
  Check,
  Heart,
  Eye,
  ShieldCheck,
  Truck,
  Award,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Badge } from "@/components/ui/Badge";
import type { SafeProduct } from "@/types";

const HERO_SHOWCASE_ITEMS: SafeProduct[] = [
  {
    _id: "hero-1",
    name: "Ceramic Pour-Over Coffee Set",
    slug: "ceramic-pour-over-set",
    description:
      "Hand-thrown matte stoneware pour-over dripper paired with a thermal double-walled carafe. Engineered for optimal heat retention and precise extraction.",
    price: 38.0,
    compareAtPrice: 48.0,
    category: "kitchen",
    stock: 14,
    rating: 4.9,
    reviewCount: 128,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    ],
    tag: "New",
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "hero-2",
    name: "Linen Weekend Travel Bag",
    slug: "linen-weekend-bag",
    description:
      "Spacious heavy-duty natural linen duffel featuring reinforced vegetable-tanned leather handles and water-resistant organic cotton lining.",
    price: 74.0,
    compareAtPrice: 95.0,
    category: "apparel",
    stock: 8,
    rating: 4.8,
    reviewCount: 84,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    ],
    tag: "Sale",
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "hero-3",
    name: "Matte Steel Water Bottle (1L)",
    slug: "matte-steel-water-bottle",
    description:
      "Triple-walled vacuum-insulated stainless steel bottle. Keeps cold drinks chilled for 24 hours and piping hot coffee warm for 12 hours.",
    price: 22.0,
    compareAtPrice: 28.0,
    category: "outdoors",
    stock: 25,
    rating: 5.0,
    reviewCount: 240,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80",
    ],
    tag: "Bestseller",
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const currentItem = HERO_SHOWCASE_ITEMS[activeTab] || HERO_SHOWCASE_ITEMS[0];
  if (!currentItem) return null;
  const inWishlist = isInWishlist(currentItem._id);

  const handleAddToCart = (product: SafeProduct) => {
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-olive-grain px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-28">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-olive-200/40 via-amber-100/30 to-cream-200/50 blur-3xl" />

      {/* Hero Headline & Intro */}
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-olive-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-olive-800 shadow-xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
          <span>New Season &bull; Handcrafted Curations</span>
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight text-charcoal-900 sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
          Shopping that feels{" "}
          <span className="bg-gradient-to-r from-olive-800 via-olive-600 to-amber-700 bg-clip-text text-transparent">
            unhurried &amp; refined
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-charcoal-700/80 sm:text-lg leading-relaxed">
          Cartify brings together artisanal quality goods and a serene,
          matte-olive shopping experience — no clutter, no pressure, just what
          you came for.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 rounded-full bg-olive-800 px-8 py-4 text-sm font-bold text-cream-50 transition-all hover:bg-olive-900 hover:scale-105 active:scale-95 shadow-md w-full sm:w-auto"
          >
            <span>Explore Complete Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#deals"
            className="flex items-center justify-center rounded-full border border-olive-300 bg-white/80 px-8 py-4 text-sm font-bold text-olive-900 transition-all hover:bg-white hover:border-olive-400 backdrop-blur-sm shadow-xs w-full sm:w-auto"
          >
            <span>View Today&apos;s Flash Deals</span>
          </Link>
        </div>
      </div>

      {/* Interactive Featured Collection Preview Showcase Suite */}
      <div className="mx-auto mt-14 max-w-6xl sm:mt-20">
        <div className="card-surface overflow-hidden rounded-3xl border border-olive-200/80 bg-white/75 shadow-2xl backdrop-blur-xl">
          {/* Top Glass Showcase Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-olive-100 bg-cream-50/90 px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
              <span className="font-display text-sm font-bold uppercase tracking-wider text-charcoal-900">
                Featured Collection Lookbook
              </span>
              <span className="hidden md:inline-block text-xs text-charcoal-700/60">
                &bull; Interactive Live Preview
              </span>
            </div>

            {/* Tab Switchers */}
            <div className="flex items-center gap-1 rounded-full bg-olive-100/70 p-1 border border-olive-200/60 overflow-x-auto">
              {HERO_SHOWCASE_ITEMS.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setActiveTab(idx as 0 | 1 | 2)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === idx
                      ? "bg-olive-800 text-cream-50 shadow-sm scale-100"
                      : "text-charcoal-800 hover:text-olive-900 hover:bg-white/50"
                  }`}
                >
                  <span>{idx === 0 ? "☕ Ceramic" : idx === 1 ? "👜 Travel" : "💧 Hydration"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Showcase Body: Split Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Big Product Image & Visuals (7 cols) */}
            <div className="lg:col-span-7 relative bg-cream-100/60 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-olive-100 group">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-inner">
                <img
                  src={currentItem.images?.[0] || ""}
                  alt={currentItem.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Floating Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                  <Badge tone={currentItem.tag === "Sale" ? "amber" : "olive"}>
                    {currentItem.tag} Arrival
                  </Badge>
                  <span className="rounded-full bg-charcoal-900/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cream-50 backdrop-blur-md">
                    {currentItem.category}
                  </span>
                </div>

                {/* Floating Rating Card */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-bold text-charcoal-900 shadow-md backdrop-blur-md border border-olive-100">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>{currentItem.rating.toFixed(1)}</span>
                  <span className="text-charcoal-700/60 font-normal">
                    ({currentItem.reviewCount} reviews)
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(currentItem)}
                  aria-label="Wishlist toggle"
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-md border border-olive-100"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      inWishlist
                        ? "fill-amber-600 text-amber-600 animate-bounce"
                        : "text-charcoal-800 hover:text-amber-600"
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Quick Perks Strip inside left */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] font-semibold text-charcoal-800 border-t border-olive-200/50 pt-5">
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="h-4 w-4 text-olive-800" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-olive-800" />
                  <span>2-Year Guarantee</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Award className="h-4 w-4 text-olive-800" />
                  <span>Artisan Crafted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Specs, Actions & Mini Selector (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white/60">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-olive-800/80">
                  <span>Spotlight Item #{activeTab + 1}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Zap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                    In Stock ({currentItem.stock} left)
                  </span>
                </div>

                <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-charcoal-900 leading-snug">
                  {currentItem.name}
                </h3>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-extrabold text-olive-900">
                    ${currentItem.price.toFixed(2)}
                  </span>
                  {currentItem.compareAtPrice &&
                    currentItem.compareAtPrice > currentItem.price && (
                      <span className="text-base font-medium text-charcoal-700/50 line-through">
                        ${currentItem.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  {currentItem.compareAtPrice &&
                    currentItem.compareAtPrice > currentItem.price && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                        Save ${ (currentItem.compareAtPrice - currentItem.price).toFixed(0) }
                      </span>
                    )}
                </div>

                <p className="mt-4 text-sm text-charcoal-700/85 leading-relaxed">
                  {currentItem.description}
                </p>

                {/* Interactive Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(currentItem)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-bold transition-all shadow-md w-full ${
                      addedId === currentItem._id
                        ? "bg-emerald-700 text-cream-50 scale-102"
                        : "bg-olive-800 text-cream-50 hover:bg-olive-900 active:scale-95"
                    }`}
                  >
                    {addedId === currentItem._id ? (
                      <>
                        <Check className="h-4 w-4 animate-bounce" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/products/${currentItem.slug}`}
                    className="flex items-center justify-center gap-2 rounded-full border border-olive-300 bg-cream-50/80 px-5 py-3.5 text-sm font-bold text-olive-900 hover:bg-olive-100 transition-colors w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Full Details</span>
                  </Link>
                </div>
              </div>

              {/* Mini Interactive Switcher Box below */}
              <div className="mt-8 border-t border-olive-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-3">
                  Select item to preview:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {HERO_SHOWCASE_ITEMS.map((item, idx) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setActiveTab(idx as 0 | 1 | 2)}
                      className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                        activeTab === idx
                          ? "border-olive-800 bg-olive-100/60 shadow-xs ring-1 ring-olive-800"
                          : "border-olive-200/60 bg-cream-50/40 hover:border-olive-400 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.images?.[0] || ""}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover mb-1.5 shadow-xs"
                      />
                      <span className="text-[11px] font-bold text-charcoal-900 line-clamp-1 w-full">
                        {item.name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] font-semibold text-olive-800">
                        ${item.price.toFixed(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Promo Strip of the Showcase Suite */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-olive-100 bg-olive-950 px-6 py-3.5 text-cream-100 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-charcoal-900">
                Coupon Code
              </span>
              <span>Use <strong className="text-amber-400 font-mono">WELCOME10</strong> at checkout for 10% off your entire cart</span>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors underline"
            >
              <span>Browse All 24+ Curated Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
