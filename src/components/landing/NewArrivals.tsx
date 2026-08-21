"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";
import type { SafeProduct } from "@/types";

const FALLBACK_PRODUCTS: SafeProduct[] = [
  {
    _id: "minimalist-ambient-desk-lamp",
    name: "Minimalist Ambient Desk Lamp",
    slug: "minimalist-ambient-desk-lamp",
    description:
      "Architectural touch-sensitive LED desk lamp with solid brass stem and natural white oak base. Features continuous warm dimming (2700K–3200K) and glare-free directional illumination.",
    price: 68.0,
    compareAtPrice: 85.0,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      "/images/products/table_lamp.jpg",
    ],
    rating: 4.9,
    reviewCount: 38,
    stock: 25,
    featured: true,
    tag: "New",
    specifications: {
      Material: "Solid Anodized Brass & American White Oak",
      Bulb: "Integrated warm LED (50,000 hour lifespan)",
      Control: "Capacitive touch dimming on base",
      Power: "USB-C Powered with 2m braided cable",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "true-wireless-anc-studio-earbuds",
    name: "True Wireless ANC Studio Earbuds",
    slug: "true-wireless-anc-studio-earbuds",
    description:
      "Next-generation studio wireless in-ear monitors equipped with hybrid Active Noise Cancellation, custom 11mm graphene drivers, and transparent audio pass-through mode.",
    price: 129.0,
    compareAtPrice: 159.0,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "/images/products/earbuds.jpg",
    ],
    rating: 4.9,
    reviewCount: 84,
    stock: 30,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Drivers: "11mm Custom Graphene Dynamic Drivers",
      "Battery Life": "8h (earbuds) + 24h (wireless Qi charging case)",
      "Noise Cancellation": "Hybrid ANC up to -38dB reduction",
      "Water Resistance": "IPX5 Sweat and Rain Resistant",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "stoneware-espresso-cup-set",
    name: "Handcrafted Stoneware Espresso Cup Set",
    slug: "stoneware-espresso-cup-set",
    description:
      "Set of four hand-thrown ceramic demitasse cups coated in matte earth reactive glaze. Thick thermal walls retain crema and temperature for the perfect morning shot.",
    price: 32.0,
    compareAtPrice: 40.0,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewCount: 29,
    stock: 40,
    featured: true,
    tag: "New",
    specifications: {
      Includes: "4 espresso cups (80 ml / 2.7 oz each)",
      Material: "Lead-free high-fire stoneware",
      Care: "Dishwasher, microwave, and oven safe",
      Finish: "Reactive matte glaze (each piece unique)",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "organic-turkish-bath-towel-set",
    name: "Plush Organic Turkish Bath Towel Set",
    slug: "organic-turkish-bath-towel-set",
    description:
      "Loomed from 100% certified organic Aegean long-staple cotton at an ultra-dense 700 GSM. Features double-stitched hems for cloud-like softness and rapid absorption.",
    price: 58.0,
    compareAtPrice: 72.0,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
      "/images/products/bamboo_towels.jpg",
    ],
    rating: 4.9,
    reviewCount: 65,
    stock: 22,
    featured: true,
    tag: "Bestseller",
    specifications: {
      Material: "100% Certified Organic Turkish Cotton",
      Density: "700 GSM Ultra-Heavyweight",
      Includes: "2 Full Bath Towels (75x140cm) + 2 Hand Towels (40x70cm)",
      Certifications: "GOTS & OEKO-TEX Standard 100",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "alpine-trail-pack-35l",
    name: "All-Weather Alpine Trail Pack 35L",
    slug: "alpine-trail-pack-35l",
    description:
      "Rugged technical daypack engineered from weatherproof 420D Cordura ripstop. Features ergonomic ventilated back panel, hydration bladder sleeve, and quick-access roll-top closure.",
    price: 135.0,
    compareAtPrice: 165.0,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 52,
    stock: 18,
    featured: true,
    tag: "New",
    specifications: {
      Capacity: "35 Liters",
      Material: "420D Weatherproof Cordura Ripstop",
      Hydration: "Compatible with bladders up to 3L",
      Weight: "920 grams",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "radiance-vitamin-c-hyaluronic-serum",
    name: "Radiance Vitamin C & Hyaluronic Serum",
    slug: "radiance-vitamin-c-hyaluronic-serum",
    description:
      "Concentrated antioxidant facial serum blending 15% pure L-Ascorbic Acid, multi-molecular Hyaluronic Acid, and botanical Ferulic Acid to brighten skin and boost elasticity.",
    price: 38.0,
    compareAtPrice: 48.0,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1608248597359-07f240e4f0ad?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewCount: 76,
    stock: 35,
    featured: true,
    tag: "Sale",
    specifications: {
      Volume: "30 ml (1.0 fl oz)",
      "Key Actives": "15% Vitamin C, 2% Hyaluronic Acid, 0.5% Ferulic Acid",
      Formulation: "Fragrance-Free, Non-Comedogenic, Cruelty-Free",
      Origin: "Made in USA",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "heavyweight-washed-linen-overshirt",
    name: "Heavyweight Washed Linen Overshirt",
    slug: "heavyweight-washed-linen-overshirt",
    description:
      "Tailored utility overshirt cut from 240 GSM washed French flax linen. Features dual chest flap pockets, natural corozo nut buttons, and a relaxed unstructured drape.",
    price: 84.0,
    compareAtPrice: 105.0,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 43,
    stock: 20,
    featured: true,
    tag: "New",
    specifications: {
      Fabric: "100% Normandy Heavyweight Flax Linen (240 GSM)",
      Buttons: "Natural Sustainable Corozo Nut",
      Fit: "Relaxed Tailored Fit",
      Care: "Cold machine wash, air dry",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "precision-temperature-gooseneck-kettle",
    name: "Precision Temperature Gooseneck Kettle",
    slug: "precision-temperature-gooseneck-kettle",
    description:
      "Barista-grade electric pour-over kettle with 1200W rapid boil base, to-the-degree digital temperature dial (104°F–212°F), built-in brew stopwatch, and 60-minute heat hold.",
    price: 95.0,
    compareAtPrice: 120.0,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 91,
    stock: 15,
    featured: true,
    tag: "Sale",
    specifications: {
      Capacity: "0.9 Liters (30 oz)",
      Power: "1200W Rapid Heating Element (120V)",
      "Temperature Range": "104°F to 212°F (40°C to 100°C)",
      Material: "304 Food-Grade Stainless Steel with Matte Finish",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function NewArrivals() {
  const [products, setProducts] = useState<SafeProduct[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const res = await fetch("/api/products?limit=8&sort=newest");
        const json = await res.json();
        if (json.success && json.data?.products && json.data.products.length > 0) {
          setProducts(json.data.products);
        }
      } catch (err) {
        console.error("Failed to load new arrivals", err);
      }
    }
    fetchNewArrivals();
  }, []);

  return (
    <section id="new-arrivals" className="relative px-6 py-20 lg:px-8 bg-cream-50/60">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-olive-200/60">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-olive-100 border border-olive-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-olive-800 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-olive-700" />
              <span>✨ Just Added • 2026 Collection</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl lg:text-5xl tracking-tight">
              New Arrivals
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-charcoal-700/80 leading-relaxed">
              Explore the latest handcrafted goods, smart accessories, and sustainable daily essentials freshly added to our catalog.
            </p>
          </div>

          <Link
            href="/products?tag=New"
            className="inline-flex items-center gap-2 text-sm font-bold text-olive-800 hover:text-olive-900 hover:gap-3 transition-all group self-start md:self-auto bg-white/70 border border-olive-200/80 px-5 py-2.5 rounded-full shadow-xs hover:bg-white"
          >
            <span>View All New Drops</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
