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
  PackageCheck,
  ChevronDown,
  Settings,
  Truck,
  ChevronRight,
  Sparkles,
  HelpCircle,
  UserPlus,
  LogIn,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFCM } from "@/hooks/useFCM";
import { PromoBanner } from "@/components/layout/PromoBanner";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { ProfileSettingsModal } from "@/components/user/ProfileSettingsModal";
import { AccountSettingsModal } from "@/components/user/AccountSettingsModal";
import type { SafeCategory, SafeProduct } from "@/types";

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState<SafeCategory[]>([]);

  // Search Spotlight Modal States
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SafeProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Call useFCM to initialize
  useFCM();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories for mega menu on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K to open, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOverlayOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOverlayOpen) {
        setSearchOverlayOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOverlayOpen]);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=6`);
        const data = await res.json();
        if (data.success && data.data && data.data.products) {
          setSearchResults(data.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOverlayOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOverlayOpen]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setIsOpen(false);
    await logout();
  };

  const handleSearchOverlaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOverlayOpen(false);
      setSearchQuery("");
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <PromoBanner />

      {/* 1. Top Utility Bar */}
      <div className="hidden md:flex items-center justify-between bg-charcoal-900 text-cream-100/70 py-1.5 px-6 lg:px-8 text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          <span>Free shipping on orders over $50</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="flex items-center gap-1 hover:text-white transition-colors">
            <HelpCircle className="h-3 w-3" />
            <span>Help</span>
          </Link>
          <span className="text-charcoal-700">|</span>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <span className="text-charcoal-700">|</span>
          {isLoggedIn && user ? (
            <span className="text-white font-semibold">Hi, {user.name}</span>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup" className="hover:text-white transition-colors">
                Join Us
              </Link>
              <span className="text-charcoal-700">|</span>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <header
        className="sticky top-0 z-50 border-b border-olive-100 bg-cream-50/95 backdrop-blur-xl transition-all duration-300"
        onMouseLeave={() => setMegaMenuOpen(false)}
      >
        {/* 2. Main Navigation Bar */}
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 transition-all duration-300 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Mobile toggle */}
            <button
              className="rounded-lg p-1 -ml-2 text-olive-800 md:hidden hover:bg-olive-100 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link
              href="/"
              className="font-display text-2xl font-bold text-olive-900 transition-opacity hover:opacity-90 flex items-center gap-1"
            >
              Cart<span className="text-olive-500">ify</span>
            </Link>
          </div>

          {/* Center Nav Links - desktop */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-semibold text-charcoal-800 transition-colors hover:text-olive-800 py-2"
                onMouseEnter={() => {
                  if (link.label === "Categories") {
                    setMegaMenuOpen(true);
                  } else {
                    setMegaMenuOpen(false);
                  }
                }}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-olive-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Link>
            ))}
          </div>

          {/* Right side icons & Search Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              aria-label="Search"
              className="rounded-full p-2 text-olive-900 transition-colors hover:bg-olive-100"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* In-App Notifications Drawer */}
            <div className="hidden md:block">
              {isLoggedIn && <NotificationDrawer />}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden md:flex rounded-full p-2 text-olive-900 transition-colors hover:bg-olive-100"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative hidden md:flex rounded-full p-2 text-olive-900 transition-colors hover:bg-olive-100"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-olive-800 px-1 text-[10px] font-bold text-cream-50 shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {isLoggedIn && user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-olive-200 bg-white/90 pl-1 pr-3 py-1 text-sm font-semibold text-charcoal-800 shadow-xs transition-all hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-olive-200"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-olive-800 text-xs font-bold text-cream-50 transition-transform">
                      <User className="h-4 w-4" />
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-charcoal-700/60 transition-transform ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-olive-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fadeIn z-50">
                      <div className="border-b border-olive-100/60 px-3 py-3">
                        <p className="text-sm font-bold text-charcoal-900 truncate">{user.name}</p>
                        <p className="text-xs text-charcoal-700/70 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1.5">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                        >
                          <User className="h-4 w-4 text-olive-700" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsSettingsModalOpen(true);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-olive-700" />
                          <span>Settings</span>
                        </button>

                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors"
                        >
                          <PackageCheck className="h-4 w-4 text-olive-700" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-cream-100 hover:text-olive-800 transition-colors sm:hidden"
                        >
                          <Heart className="h-4 w-4 text-amber-500" />
                          <span>Wishlist ({wishlistCount})</span>
                        </Link>
                      </div>

                      <div className="border-t border-olive-100/60 pt-1.5 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
                  className="flex items-center gap-2 rounded-full bg-olive-900 text-white px-5 py-2 text-sm font-semibold shadow-xs transition-all hover:bg-olive-800 hover:shadow"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 3. Category Mega-Menu */}
        {megaMenuOpen && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-b border-olive-100 shadow-xl animate-mega-menu overflow-hidden z-40"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-olive-900">Explore Categories</h3>
                <Link
                  href="/categories"
                  className="text-sm font-semibold text-olive-700 hover:text-olive-900 flex items-center gap-1 group"
                  onClick={() => setMegaMenuOpen(false)}
                >
                  View All Categories
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-olive-50 hover:border-olive-200 hover:bg-cream-50 transition-all group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream-100 text-2xl group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 group-hover:text-olive-800 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-charcoal-700/60 mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                      {cat.productCount !== undefined && (
                        <p className="text-[10px] font-medium text-olive-600 mt-1.5 uppercase tracking-wider">
                          {cat.productCount} Products
                        </p>
                      )}
                    </div>
                  </Link>
                ))}

                {categories.length === 0 && (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center text-charcoal-700/50">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Loading categories...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 4. Sleek Floating Spotlight Search (Does NOT cover the whole screen) */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-20 px-4 sm:px-6">
          {/* Soft Dimmed Blur Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => {
              setSearchOverlayOpen(false);
              setSearchQuery("");
            }}
          />

          {/* Floating Search Container */}
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-olive-200/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200">
            {/* Header Search Input Bar */}
            <form
              onSubmit={handleSearchOverlaySubmit}
              className="relative border-b border-olive-100 p-3.5 sm:p-4 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-olive-100 text-olive-800 shrink-0">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-olive-700" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, categories, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-lg font-semibold text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-olive-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center rounded-lg border border-olive-200 bg-cream-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-charcoal-500">
                    ESC
                  </kbd>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSearchOverlayOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1.5 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-olive-100 transition-colors sm:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Results / Suggestion Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
              {!searchQuery.trim() ? (
                <div className="space-y-5">
                  {/* Trending Searches */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Trending Searches</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Ceramic Vase",
                        "Linen Apron",
                        "Olive Oil Dispenser",
                        "Coffee Mug",
                        "Handmade Bowl",
                      ].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSearchQuery(term)}
                          className="rounded-full border border-olive-200/80 bg-cream-50 px-3.5 py-1.5 text-xs font-medium text-charcoal-800 hover:border-olive-600 hover:bg-olive-50 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Categories */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-2.5">
                      Popular Categories
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setSearchOverlayOpen(false)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-olive-100 bg-white hover:border-olive-300 hover:bg-cream-50 transition-colors group"
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <span className="text-xs font-semibold text-charcoal-800 group-hover:text-olive-900 truncate">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isSearching ? (
                <div className="py-12 flex flex-col items-center justify-center text-charcoal-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-olive-700" />
                  <p className="text-xs font-medium">Searching catalog...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-500 mb-2 px-1">
                    <span>Products ({searchResults.length})</span>
                    <span>Press Enter to view all</span>
                  </div>

                  <div className="space-y-1.5">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setSearchOverlayOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-olive-50/80 transition-colors group border border-transparent hover:border-olive-200"
                      >
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-cream-100 border border-olive-100 overflow-hidden relative">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-olive-600">
                              Img
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-charcoal-900 group-hover:text-olive-800 truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-olive-700 bg-olive-100/70 px-1.5 py-0.2 rounded">
                              {product.category}
                            </span>
                            <span className="text-xs font-bold text-charcoal-900">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-[11px] text-charcoal-400 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-charcoal-400 group-hover:text-olive-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/products?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      setSearchOverlayOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl bg-olive-800 text-cream-50 text-xs font-bold hover:bg-olive-900 transition-colors shadow-xs"
                  >
                    <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-charcoal-400 mx-auto mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-charcoal-800">
                    No products found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Try checking your spelling or using different keywords.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => {
                      setSearchOverlayOpen(false);
                      setSearchQuery("");
                    }}
                    className="inline-block mt-3 text-xs font-bold text-olive-800 hover:underline"
                  >
                    Browse all products &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-cream-50 flex flex-col h-full animate-mobile-drawer shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-olive-100 bg-white/50">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="font-display text-2xl font-bold text-olive-900"
              >
                Cart<span className="text-olive-500">ify</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-charcoal-600 hover:bg-olive-100 hover:text-charcoal-900 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Mobile Search */}
              <div className="p-6 pb-2">
                <form onSubmit={handleMobileSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-olive-200 bg-white py-3 pl-12 pr-4 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                  />
                </form>
              </div>

              {/* Mobile Nav Links */}
              <div className="px-4 py-4 flex flex-col">
                {NAV_LINKS.filter((l) => l.label !== "Categories").map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3.5 text-lg font-semibold text-charcoal-800 hover:text-olive-800 hover:bg-olive-100/50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Categories Accordion */}
                <div className="mt-2">
                  <button
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-lg font-semibold text-charcoal-800 hover:text-olive-800 hover:bg-olive-100/50 rounded-xl transition-colors"
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        mobileCategoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {mobileCategoriesOpen && (
                    <div className="mt-2 pl-4 pr-2 flex flex-col gap-1 border-l-2 border-olive-100 ml-6">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-charcoal-700 hover:text-olive-800 hover:bg-olive-50 rounded-xl transition-colors"
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        href="/categories"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3.5 text-sm font-bold text-olive-700 mt-2"
                      >
                        View All <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-4">
                <div className="h-px w-full bg-olive-100" />
              </div>

              {/* Utility Links */}
              <div className="px-4 pb-8 flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-olive-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-charcoal-800 font-medium">
                    <ShoppingCart className="h-5 w-5 text-olive-700" />
                    <span>Shopping Cart</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-900 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-olive-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-charcoal-800 font-medium">
                    <Heart className="h-5 w-5 text-amber-500" />
                    <span>Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Drawer Footer / Account */}
            <div className="p-6 border-t border-olive-100 bg-white">
              {isLoggedIn && user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-900 text-white font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900">{user.name}</p>
                      <p className="text-xs text-charcoal-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-olive-200 text-sm font-semibold text-charcoal-800 hover:bg-olive-50 transition-colors"
                    >
                      Profile
                    </button>
                    <Link
                      href="/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-olive-200 text-sm font-semibold text-charcoal-800 hover:bg-olive-50 transition-colors"
                    >
                      Orders
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 mt-2 py-3 rounded-xl bg-red-50 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-olive-900 text-white font-bold hover:bg-olive-800 transition-colors shadow-sm"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xl border-2 border-olive-200 text-charcoal-800 font-bold hover:border-olive-800 hover:bg-olive-50 transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
}
