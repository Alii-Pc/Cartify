"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift, Truck, ShieldCheck, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="w-full bg-cream-50">
      {/* 1. Panoramic Olive Hero Banner (Aspect ratio maintains full wide scene on mobile & desktop) */}
      <div className="relative w-full aspect-[16/7.2] min-h-[175px] max-h-[560px] overflow-hidden">
        {/* Background Image: High-res olive scene */}
        <Image
          src="/images/departments/hero_olive_bg.jpg"
          alt="Shop All, Curated for You"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Center Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-2 sm:px-6">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Overline with Dash */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 md:mb-3 text-[7.5px] xs:text-[9px] sm:text-xs font-semibold tracking-widest text-white/90 uppercase">
              <span>PREMIUM COLLECTION</span>
              <span className="w-4 sm:w-8 md:w-10 h-px bg-white/70 inline-block" />
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-sm xs:text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Shop All, Curated <br />
              for <span className="text-[#a8b894]">You</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-1 sm:mt-2 md:mt-3 text-[7px] xs:text-[8.5px] sm:text-xs md:text-sm lg:text-base text-cream-100/90 leading-tight sm:leading-relaxed font-normal max-w-[130px] xs:max-w-[170px] sm:max-w-xs md:max-w-md line-clamp-2 sm:line-clamp-none">
              Premium products from across our departments, selected for quality, style, and value.
            </p>

            {/* Dual CTA Buttons */}
            <div className="mt-2 sm:mt-3.5 md:mt-6 flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-[#525f41] hover:bg-[#434e35] text-white px-2.5 py-1 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <span>Shop Collections</span>
                <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Link>
              <a
                href="#departments"
                className="inline-flex items-center justify-center rounded-full border border-white/50 bg-black/20 backdrop-blur-xs hover:bg-white/15 hover:border-white text-white px-2.5 py-1 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                View Departments
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feature Highlights Strip (Single horizontal row with vertical dividers on mobile & desktop) */}
      <div className="w-full border-b border-stone-200/80 bg-[#f4f3ee] py-2 sm:py-3 px-1.5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between sm:justify-center divide-x divide-stone-300 text-[8px] xs:text-[9.5px] sm:text-xs md:text-sm text-charcoal-700 font-medium">
            <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 md:px-6">
              <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-charcoal-700 shrink-0" />
              <span className="whitespace-nowrap">Gifts for Everyone</span>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 md:px-6">
              <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-charcoal-700 shrink-0" />
              <span className="whitespace-nowrap">Free &amp; Fast Shipping</span>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 md:px-6">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-charcoal-700 shrink-0" />
              <span className="whitespace-nowrap">Easy Returns</span>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 md:px-6">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-charcoal-700 shrink-0" />
              <span className="whitespace-nowrap">Top Rated Products</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
