"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/#categories", label: "Categories" },
  { href: "/#deals", label: "Deals" },
  { href: "/#about", label: "About" },
];

// Cart count is static for now — Step 5+ will wire this up to real cart state.
const CART_ITEM_COUNT = 0;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-olive-100 bg-cream-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-olive-800"
        >
          Cart<span className="text-olive-500">ify</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal-700/80 transition-colors hover:text-olive-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search bar - desktop */}
        <div className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-olive-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm
                text-charcoal-800 placeholder:text-charcoal-700/40 transition-colors
                focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100 md:block"
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {CART_ITEM_COUNT > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-olive-700 px-1 text-[10px] font-semibold text-cream-50">
                {CART_ITEM_COUNT}
              </span>
            )}
          </Link>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-olive-800 md:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-olive-100 bg-cream-50 px-6 py-4 md:hidden">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-olive-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm
                text-charcoal-800 placeholder:text-charcoal-700/40 focus:border-olive-500
                focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </div>
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-charcoal-700/80 hover:text-olive-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-charcoal-700/80 hover:text-olive-700"
            >
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
