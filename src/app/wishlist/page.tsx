"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { SafeProduct } from "@/types";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: SafeProduct) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((product) => {
      addToCart(product, 1);
    });
    clearWishlist();
  };

  const getBadgeTone = (tag?: string | null): BadgeTone => {
    if (tag === "Sale") return "amber";
    if (tag === "New") return "olive";
    if (tag === "Bestseller") return "charcoal";
    return "olive";
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-charcoal-700/70">
            {wishlistCount === 0
              ? "You have no saved items yet"
              : `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"} saved for later`}
          </p>
        </div>

        {wishlistCount > 0 && (
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="rounded-full bg-olive-800 px-5 py-2.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-olive-900 shadow-xs flex items-center gap-2"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Move All to Cart</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              Clear Wishlist
            </button>
          </div>
        )}
      </div>

      {wishlistCount === 0 ? (
        <div className="card-surface p-16 text-center flex flex-col items-center justify-center my-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6 border border-amber-200">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            Your wishlist is waiting to be filled
          </h2>
          <p className="mt-2 max-w-md text-sm text-charcoal-700/70 leading-relaxed">
            Found something you love but not ready to check out right away? Tap the heart icon on any product to save it right here.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-olive-800 px-8 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-900 shadow-sm"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => {
            const image =
              product.images && product.images.length > 0 ? product.images[0] : "";

            return (
              <div
                key={product._id}
                className="group card-surface flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-olive"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden bg-cream-200/80">
                    <Link href={`/products/${product.slug}`}>
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-olive-100 text-xs text-olive-800">
                          No Img
                        </div>
                      )}
                    </Link>

                    {product.tag && (
                      <div className="absolute left-3 top-3 z-10">
                        <Badge tone={getBadgeTone(product.tag)}>{product.tag}</Badge>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product._id)}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-charcoal-800 transition-colors hover:bg-red-50 hover:text-red-600 shadow-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-charcoal-700/60">
                      <span>{product.category.replace("-", " ")}</span>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="font-semibold text-charcoal-900">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-2 block font-display text-base font-semibold text-charcoal-900 hover:text-olive-800 transition-colors truncate"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-charcoal-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs font-medium text-charcoal-700/50 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-olive-100/60 p-4 bg-cream-50/40">
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => handleMoveToCart(product)}
                    className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-all ${
                      product.stock <= 0
                        ? "cursor-not-allowed bg-charcoal-700/20 text-charcoal-700/40"
                        : "bg-olive-800 text-cream-50 hover:bg-olive-900 shadow-xs active:scale-98"
                    }`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{product.stock <= 0 ? "Out of Stock" : "Move to Cart"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
