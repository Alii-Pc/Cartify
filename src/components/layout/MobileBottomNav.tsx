"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide on specific routes
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/payment")
  ) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Grid3X3, label: "Categories", href: "/categories" },
    { icon: Search, label: "Search", href: "/products" },
    { icon: Heart, label: "Wishlist", href: "/wishlist", count: wishlistCount },
    { icon: ShoppingBag, label: "Cart", href: "/cart", count: itemCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-olive-100 shadow-lg animate-bottom-nav">
      <div className="flex h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 ${
                isActive ? "text-olive-700" : "text-charcoal-500"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${isActive ? "fill-current" : ""}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
