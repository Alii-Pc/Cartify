"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Heart,
  LogOut,
  LayoutDashboard,
  PackageCheck,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFCM } from "@/hooks/useFCM";
import { PromoBanner } from "@/components/layout/PromoBanner";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/#deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { fcmToken, subscribeToNotifications } = useFCM();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setIsOpen(false);
    await logout();
  };

  return (
    <>
      <PromoBanner />
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
              placeholder="Search catalog by name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-olive-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm
                text-charcoal-800 placeholder:text-charcoal-700/40 transition-colors
                focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Notifications Button */}
          {!fcmToken && (
            <button
              onClick={subscribeToNotifications}
              aria-label="Enable Notifications"
              title="Enable Push Notifications"
              className="relative hidden md:flex rounded-full p-2.5 text-amber-600 transition-colors hover:bg-amber-100"
            >
              <Bell className="h-5 w-5" />
            </button>
          )}

          {/* In-App Notifications Drawer */}
          {isLoggedIn && <NotificationDrawer />}

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

          {/* User Account / Dropdown — Desktop */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            {isLoggedIn && user ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-olive-200/80 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-charcoal-800 shadow-xs transition-all hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-olive-200"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-olive-800 text-xs font-bold text-cream-50">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="max-w-[120px] truncate text-xs font-bold text-charcoal-900">
                    {user.name}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-charcoal-700/60 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-olive-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fadeIn z-50">
                    <div className="border-b border-olive-100/60 px-3 py-2">
                      <p className="text-xs font-bold text-charcoal-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-charcoal-700/60 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-olive-700" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                      >
                        <PackageCheck className="h-4 w-4 text-olive-700" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                      >
                        <Heart className="h-4 w-4 text-amber-600" />
                        <span>Wishlist ({wishlistCount})</span>
                      </Link>
                    </div>

                    <div className="border-t border-olive-100/60 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-olive-200 bg-white/80 px-4 py-2 text-xs font-semibold text-charcoal-800 shadow-xs transition-all hover:bg-cream-100 hover:text-olive-800"
              >
                <User className="h-4 w-4 text-olive-800" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

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

          {/* Mobile Auth Header */}
          {isLoggedIn && user ? (
            <div className="mb-4 rounded-2xl bg-white p-3.5 border border-olive-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-800 text-cream-50 font-bold text-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">{user.name}</p>
                  <p className="text-[11px] text-charcoal-700/60 truncate max-w-[180px]">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline p-1"
              >
                Logout
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 py-2">
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

            <div className="border-t border-olive-100 pt-3 space-y-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-olive-700"
                  >
                    <LayoutDashboard className="h-4 w-4 text-olive-800" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-olive-700"
                  >
                    <PackageCheck className="h-4 w-4 text-olive-800" />
                    <span>My Orders</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-olive-800 hover:underline"
                >
                  <User className="h-4 w-4 text-olive-800" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}

              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-olive-700"
              >
                <Heart className="h-4 w-4 text-amber-600" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
