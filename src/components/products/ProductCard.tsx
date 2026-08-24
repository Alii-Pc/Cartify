"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Star, Check, Heart, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import type { SafeProduct } from "@/types";

interface ProductCardProps {
  product: SafeProduct;
  onAddToCart?: (product: SafeProduct) => void;
  compact?: boolean;
}

export function ProductCard({ product, onAddToCart, compact = false }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const inWishlist = isInWishlist(product._id);

  const mainImage =
    !imageError && product.images && product.images.length > 0
      ? product.images[0]
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      addToast("warning", `"${product.name}" is currently out of stock.`);
      return;
    }
    setAdded(true);
    addToCart(product, 1);
    addToast("success", `Added "${product.name}" to cart!`);

    if (onAddToCart) {
      onAddToCart(product);
    }
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      toggleWishlist(product);
      addToast("info", `Removed "${product.name}" from wishlist.`);
    } else {
      toggleWishlist(product);
      addToast("success", `Saved "${product.name}" to wishlist!`);
    }
  };

  // Generate discount percentage if compareAtPrice is present
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const getTagBadgeClass = (tag?: string | null): string => {
    if (tag === "Sale") return "bg-red-600 text-white";
    if (tag === "New") return "bg-emerald-600 text-white";
    if (tag === "Bestseller") return "bg-charcoal-900 text-white";
    return "bg-olive-600 text-white";
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white border border-olive-100 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg"
    >
      <div>
        {/* Image Showcase */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-olive-100 to-olive-200">
              <span className="font-display text-sm text-olive-800/60">
                Cartify Product
              </span>
            </div>
          )}

          {/* Badges top-left */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
            {product.tag && (
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md ${getTagBadgeClass(product.tag)}`}>
                {product.tag}
              </span>
            )}
            {discountPercent && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-md px-2 py-0.5">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm ${
              inWishlist
                ? "bg-red-50 border border-red-200"
                : "bg-white/90 border border-olive-200 hover:bg-white"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                inWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-charcoal-600 hover:text-red-500"
              }`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-md bg-charcoal-900/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${compact ? "p-3 pb-1.5" : "p-4 pb-2"}`}>
          <div className="text-[11px] text-charcoal-500 uppercase tracking-wide truncate">
            {product.category.replace("-", " ")}
          </div>

          <h3 className={`mt-1 line-clamp-2 font-semibold text-charcoal-900 leading-snug group-hover:text-olive-700 transition-colors ${compact ? "text-xs" : "text-sm"}`}>
            {product.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="hidden sm:flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex sm:hidden items-center">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-charcoal-800">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-olive-600">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-baseline flex-wrap">
            <span className={`font-bold text-charcoal-900 ${compact ? "text-lg" : "text-xl"}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-sm text-charcoal-400 line-through ml-2">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
                <span className="hidden sm:inline text-sm font-semibold text-emerald-600 ml-2">
                  Save ${(product.compareAtPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>
          
          <div className="hidden sm:flex text-xs text-charcoal-500 mt-1.5 items-center gap-1">
            <Truck className="h-3 w-3" />
            <span>Free Delivery</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className={`px-4 pb-4 ${compact ? "mt-1" : "mt-2"}`}>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 sm:py-2.5 text-sm font-semibold transition-all ${
            product.stock <= 0
              ? "bg-charcoal-100 text-charcoal-400 cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-olive-700 text-cream-50 hover:bg-olive-800"
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

