"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ShoppingCart, Star, Check, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import type { SafeProduct } from "@/types";

interface ProductCardProps {
  product: SafeProduct;
  onAddToCart?: (product: SafeProduct) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
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

  const getBadgeTone = (tag?: string | null): BadgeTone => {
    if (tag === "Sale") return "amber";
    if (tag === "New") return "olive";
    if (tag === "Bestseller") return "charcoal";
    return "olive";
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card-surface flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-olive"
    >
      <div>
        {/* Image Showcase */}
        <div className="relative aspect-square w-full overflow-hidden bg-cream-200/80">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-olive-100 to-olive-200">
              <span className="font-display text-sm text-olive-800/60">
                Cartify Product
              </span>
            </div>
          )}

          {/* Tag Badge */}
          {product.tag && (
            <div className="absolute left-3 top-3 z-10">
              <Badge tone={getBadgeTone(product.tag)}>{product.tag}</Badge>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 shadow-xs"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                inWishlist
                  ? "fill-amber-600 text-amber-600 animate-bounce"
                  : "text-charcoal-800 hover:text-amber-600"
              }`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-xs">
              <span className="rounded-full bg-cream-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-charcoal-900">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-charcoal-700/60">
            <span>{product.category.replace("-", " ")}</span>
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-semibold text-charcoal-900">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-charcoal-700/50">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="mt-2 line-clamp-1 font-display text-base font-semibold text-charcoal-900 group-hover:text-olive-800 transition-colors">
            {product.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-charcoal-700/75">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer / Price & CTA */}
      <div className="flex items-center justify-between border-t border-olive-100/60 px-5 py-3.5 bg-cream-50/40">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-charcoal-900">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs font-medium text-charcoal-700/50 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
            product.stock <= 0
              ? "cursor-not-allowed bg-charcoal-700/20 text-charcoal-700/40"
              : added
              ? "bg-olive-800 text-cream-50 scale-105 shadow-sm"
              : "bg-olive-700 text-cream-50 hover:bg-olive-800 hover:scale-105 active:scale-95"
          }`}
        >
          {added ? (
            <Check className="h-4 w-4 animate-bounce" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </button>
      </div>
    </Link>
  );
}
