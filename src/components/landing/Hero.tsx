"use client";

import React, { useState, useEffect } from "react";
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

export function Hero() {
  const [showcaseItems, setShowcaseItems] = useState<SafeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function fetchShowcase() {
      try {
        const res = await fetch("/api/products?featured=true&limit=3");
        const json = await res.json();
        if (json.success && json.data?.products?.length > 0) {
          setShowcaseItems(json.data.products);
        }
      } catch (err) {
        console.error("Failed to load showcase products", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchShowcase();
  }, []);

  const currentItem = showcaseItems[activeTab] || showcaseItems[0];
  const inWishlist = currentItem ? isInWishlist(currentItem._id) : false;

  const handleAddToCart = (product: SafeProduct) => {
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-olive-grain px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pt-32">
      {/* Dynamic Background Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-70 mix-blend-multiply">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-olive-300/40 via-amber-200/30 to-emerald-200/40 blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Copy & CTA */}
          <div className="relative z-10 max-w-2xl text-center lg:text-left">
            <div className="mx-auto lg:mx-0 mb-8 flex w-fit items-center gap-2 rounded-full border border-olive-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-olive-900 shadow-sm backdrop-blur-md transition-transform hover:scale-105 cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Premium Collection &bull; Honest Prices</span>
            </div>

            <h1 className="font-display text-5xl font-semibold leading-[1.1] text-charcoal-900 sm:text-6xl md:text-7xl tracking-tighter">
              Premium products <br className="hidden sm:block" />
              <span className="italic text-olive-800 font-light pr-3">
                and honest prices always.
              </span>
            </h1>

            <p className="mx-auto lg:mx-0 mt-8 max-w-xl text-base text-charcoal-700/80 sm:text-lg leading-relaxed font-medium">
              Discover our curated collection of high-quality goods. We believe in transparent pricing, sustainable materials, and exceptional craftsmanship. Experience premium quality without the retail markup.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center lg:justify-start gap-5 sm:flex-row">
              <Link
                href="/products"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-charcoal-900 px-8 py-4 text-sm font-bold text-cream-50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-olive-900/20 active:scale-95 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-olive-800 to-olive-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10">Shop Collection</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#deals"
                className="group flex items-center justify-center gap-2 rounded-full border-2 border-olive-200/80 bg-white/60 px-8 py-4 text-sm font-bold text-olive-900 transition-all hover:bg-white hover:border-olive-400 hover:shadow-xl backdrop-blur-md w-full sm:w-auto"
              >
                <Eye className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
                <span>View Deals</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Interactive Floating Products */}
          <div className="relative z-10 h-[400px] sm:h-[500px] lg:h-[600px] w-full mt-10 lg:mt-0">
            {showcaseItems.map((item, index) => {
              // Determine position and animation based on index
              const positions = [
                "top-[5%] right-[5%] w-[65%] sm:w-[55%] z-20 animate-float-slow",
                "bottom-[15%] left-[0%] w-[55%] sm:w-[50%] z-30 animate-float-medium",
                "top-[45%] left-[20%] w-[45%] sm:w-[40%] z-10 animate-float-fast opacity-90",
              ];
              
              if (index > 2) return null; // Only show up to 3 floating items

              return (
                <Link
                  key={item._id}
                  href={`/products/${item.slug}`}
                  className={`absolute ${positions[index]} rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 hover:scale-105 hover:z-40 group bg-white`}
                >
                  <img src={item.images?.[0] || ""} alt={item.name} className="w-full aspect-[4/5] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                      <p className="text-white font-display font-bold text-sm sm:text-lg leading-tight line-clamp-1">{item.name}</p>
                      <div className="flex items-center justify-between mt-1.5 w-full">
                        <p className="text-amber-400 font-semibold text-xs sm:text-sm">${item.price.toFixed(2)}</p>
                        <span className="bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] text-white">View</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {showcaseItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-olive-700/50 font-bold">Loading collection...</p>
              </div>
            )}
            
            {/* Floating Badge */}
            <div className="absolute top-1/2 left-[-5%] lg:left-[-10%] flex items-center gap-3 rounded-2xl bg-[#1c1c1c] text-white p-3.5 shadow-2xl border border-charcoal-700 animate-bounce z-50" style={{ animationDuration: '5s' }}>
              <div className="flex -space-x-2">
                <Star className="h-7 w-7 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-[11px] font-bold leading-tight tracking-wide">
                Premium<br/><span className="text-amber-500 font-medium">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Featured Collection Preview Showcase Suite */}
      {showcaseItems.length > 0 && currentItem && (
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
                {showcaseItems.map((item, idx) => (
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
                    <span>Item {idx + 1}</span>
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
                      {currentItem.tag || "Featured"} Arrival
                    </Badge>
                    <span className="rounded-full bg-charcoal-900/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cream-50 backdrop-blur-md">
                      {currentItem.category}
                    </span>
                  </div>

                  {/* Floating Rating Card */}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-xs font-bold text-charcoal-900 shadow-md backdrop-blur-md border border-olive-100">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{currentItem.rating?.toFixed(1) || "5.0"}</span>
                    <span className="text-charcoal-700/60 font-normal">
                      ({currentItem.reviewCount || 0} reviews)
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
                    {showcaseItems.map((item, idx) => (
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
      )}
    </section>
  );
}
