"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, ShieldCheck, Truck, RotateCcw, ChevronDown } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="border-t border-olive-100 bg-olive-950 text-cream-100 mb-20 md:mb-0">
      {/* Trust strip */}
      <div className="border-b border-olive-900/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">Free shipping over $50</span>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">30-day easy returns</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">Secure checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:gap-10 px-6 py-10 sm:py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="mb-6 sm:mb-0">
          <p className="font-display text-lg font-semibold text-cream-50">
            Cart<span className="text-olive-400">ify</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-cream-100/60">
            Thoughtfully curated products, presented without the noise.
          </p>
        </div>

        <div className="border-b border-olive-900/50 sm:border-0 pb-4 sm:pb-0">
          <button 
            onClick={() => toggleSection('shop')}
            className="flex w-full items-center justify-between sm:pointer-events-none"
          >
            <h4 className="text-sm font-semibold text-cream-50">Shop</h4>
            <ChevronDown className={`h-4 w-4 text-cream-50 sm:hidden transition-transform ${openSections['shop'] ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`mt-3 space-y-2 text-sm text-cream-100/60 overflow-hidden transition-all duration-300 sm:max-h-none sm:opacity-100 ${openSections['shop'] ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <li><Link href="/products" className="hover:text-cream-50">All Products</Link></li>
            <li><Link href="/categories" className="hover:text-cream-50">Categories</Link></li>
            <li><Link href="/#deals" className="hover:text-cream-50">Featured Deals</Link></li>
            <li><Link href="/cart" className="hover:text-cream-50">Shopping Cart</Link></li>
            <li><Link href="/wishlist" className="hover:text-cream-50">Wishlist</Link></li>
          </ul>
        </div>

        <div className="border-b border-olive-900/50 sm:border-0 pb-4 sm:pb-0">
          <button 
            onClick={() => toggleSection('support')}
            className="flex w-full items-center justify-between sm:pointer-events-none"
          >
            <h4 className="text-sm font-semibold text-cream-50">Support</h4>
            <ChevronDown className={`h-4 w-4 text-cream-50 sm:hidden transition-transform ${openSections['support'] ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`mt-3 space-y-2 text-sm text-cream-100/60 overflow-hidden transition-all duration-300 sm:max-h-none sm:opacity-100 ${openSections['support'] ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <li><Link href="/track" className="hover:text-cream-50">Track Parcel</Link></li>
            <li><Link href="/returns" className="hover:text-cream-50">Returns &amp; Refunds</Link></li>
            <li><Link href="/contact" className="hover:text-cream-50">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-cream-50">About Cartify</Link></li>
            <li><Link href="/contact#faq" className="hover:text-cream-50">FAQs &amp; Help</Link></li>
          </ul>
        </div>

        <div className="pt-2 sm:pt-0">
          <h4 className="text-sm font-semibold text-cream-50">Follow</h4>
          <div className="mt-3 flex gap-4">
            <Link href="#" aria-label="Instagram" className="text-cream-100/60 hover:text-cream-50">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Facebook" className="text-cream-100/60 hover:text-cream-50">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="text-cream-100/60 hover:text-cream-50">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-olive-900/80 px-6 py-6 text-center text-xs text-cream-100/40 lg:px-8">
        © {year} Cartify. All rights reserved.
      </div>
    </footer>
  );
}
