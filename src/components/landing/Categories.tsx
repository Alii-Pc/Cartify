"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Home,
  PawPrint,
  Dumbbell,
  Laptop,
  Gamepad2,
  Sparkles,
} from "lucide-react";

interface Department {
  name: string;
  subtitle: string;
  image: string;
  href: string;
  icon: React.ElementType;
}

const DEPARTMENTS: Department[] = [
  {
    name: "Home & Living",
    subtitle: "Furniture, decor & more",
    image: "/images/departments/olive_home.jpg",
    href: "/categories/home-living",
    icon: Home,
  },
  {
    name: "Pet Care",
    subtitle: "Food, toys & essentials",
    image: "/images/departments/olive_pet.jpg",
    href: "/categories/home-living",
    icon: PawPrint,
  },
  {
    name: "Sports & Fitness",
    subtitle: "Gear, apparel & accessories",
    image: "/images/departments/olive_fitness.jpg",
    href: "/categories/outdoors",
    icon: Dumbbell,
  },
  {
    name: "Electronics",
    subtitle: "Smartphones, laptops & more",
    image: "/images/departments/olive_electronics.jpg",
    href: "/categories/electronics",
    icon: Laptop,
  },
  {
    name: "Toys & Games",
    subtitle: "Learning toys, building sets & games",
    image: "/images/departments/olive_toys.jpg",
    href: "/categories/kitchen",
    icon: Gamepad2,
  },
  {
    name: "Health & Beauty",
    subtitle: "Skincare, makeup & wellness",
    image: "/images/departments/olive_beauty.jpg",
    href: "/categories/beauty",
    icon: Sparkles,
  },
];

export function Categories() {
  return (
    <section id="departments" className="w-full bg-cream-50 px-2 sm:px-6 pt-3 pb-6 sm:pt-6 sm:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header matching reference design */}
        <div className="flex items-end justify-between gap-2 mb-2.5 sm:mb-4 px-0.5">
          <div>
            {/* Overline with dash */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 text-[8px] xs:text-[9.5px] sm:text-xs font-semibold tracking-widest text-charcoal-700 uppercase">
              <span>BROWSE BY CATEGORY</span>
              <span className="w-6 sm:w-10 h-px bg-charcoal-400 inline-block" />
            </div>
            <h2 className="font-display text-sm sm:text-2xl md:text-3xl font-bold tracking-tight text-charcoal-900 leading-tight">
              Explore Departments
            </h2>
            <p className="text-[9.5px] sm:text-xs md:text-sm text-charcoal-700/80 line-clamp-1">
              Discover what you need, all in one place.
            </p>
          </div>

          <Link
            href="/categories"
            className="group inline-flex items-center gap-1 text-[9.5px] sm:text-xs md:text-sm font-medium text-charcoal-700 hover:text-charcoal-950 underline underline-offset-4 decoration-stone-300 hover:decoration-charcoal-900 transition-colors whitespace-nowrap self-end pb-0.5"
          >
            <span>View All Departments</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 6 Department Cards in 3 Columns (matching screenshot layout on mobile & desktop) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 md:gap-4">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;

            return (
              <Link
                key={dept.name}
                href={dept.href}
                className="group relative block aspect-[4/3.4] w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-cream-100 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Department Image */}
                <Image
                  src={dept.image}
                  alt={dept.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 33vw, 33vw"
                />

                {/* Bottom Card Control Bar Pill (Exact Design from Screenshot) */}
                <div className="absolute bottom-1 left-1 right-1 sm:bottom-2.5 sm:left-2.5 sm:right-2.5">
                  <div className="flex items-center justify-between gap-1 sm:gap-2 rounded-md sm:rounded-xl md:rounded-2xl bg-black/65 backdrop-blur-md px-1.5 py-1 sm:px-3 sm:py-2 text-white border border-white/10 shadow-sm transition-colors group-hover:bg-black/80">
                    {/* Left Circular Icon */}
                    <div className="flex h-4 w-4 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                      <Icon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    </div>

                    {/* Middle Text: Title & Subtitle */}
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-display text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold tracking-tight text-white leading-none sm:leading-tight truncate">
                        {dept.name}
                      </h3>
                      <p className="text-[5.5px] xs:text-[7px] sm:text-[10px] md:text-xs text-white/75 font-normal leading-none sm:leading-tight truncate mt-0.5">
                        {dept.subtitle}
                      </p>
                    </div>

                    {/* Right Circular Arrow Button */}
                    <div className="flex h-3.5 w-3.5 sm:h-6 sm:w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-0.5 group-hover:bg-white/30">
                      <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
