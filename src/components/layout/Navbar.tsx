"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/#deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
  { href: "/#about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-olive-100 bg-cream-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-olive-800 transition-opacity hover:opacity-90"
        >
          Cart<span className="text-olive-500">ify</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal-700/80 transition-colors hover:text-olive-800"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search bar - desktop */}
        <div className="hidden flex-1 items-center md:flex">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-olive-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm
                text-charcoal-800 placeholder:text-charcoal-700/40 transition-colors
                focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-cream-50 shadow-xs animate-pulse">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Link */}
          <Link
            href="/login"
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100 md:block"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-olive-800 px-1 text-[10px] font-bold text-cream-50 shadow-xs">
                {itemCount}
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
        <div className="border-t border-olive-100 bg-cream-50 px-6 py-4 md:hidden shadow-lg animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-olive-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm
                text-charcoal-800 placeholder:text-charcoal-700/40 focus:border-olive-500
                focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </form>
          <div className="flex flex-col gap-4 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-charcoal-800 hover:text-olive-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-olive-100 pt-3 flex items-center justify-between">
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-olive-700"
              >
                <Heart className="h-4 w-4 text-amber-600" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-olive-700"
              >
                <User className="h-4 w-4 text-olive-800" />
                <span>Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
