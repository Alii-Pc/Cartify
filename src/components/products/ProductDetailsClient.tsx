"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ProductCard } from "@/components/products/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { ProductReviews } from "@/components/products/ProductReviews";
import {
  ShoppingCart,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
} from "lucide-react";
import type { SafeProduct, SafeCategory } from "@/types";

interface ProductDetailsClientProps {
  initialProduct: SafeProduct;
  initialRelatedProducts?: SafeProduct[];
  initialCategory?: SafeCategory | null;
}

export function ProductDetailsClient({
  initialProduct,
  initialRelatedProducts = [],
  initialCategory = null,
}: ProductDetailsClientProps) {
  const [product] = useState<SafeProduct>(initialProduct);
  const [relatedProducts] = useState<SafeProduct[]>(initialRelatedProducts);
  const [category] = useState<SafeCategory | null>(initialCategory);
  const [selectedImage, setSelectedImage] = useState<string>(
    initialProduct.images?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    setAdded(true);
    addToCart(product, quantity);
    setTimeout(() => setAdded(false), 2000);
  };

  const getBadgeTone = (tag?: string | null): BadgeTone => {
    if (tag === "Sale") return "amber";
    if (tag === "New") return "olive";
    if (tag === "Bestseller") return "charcoal";
    return "olive";
  };

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : null;

  const specEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-8 pb-28 md:pb-0">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-12 text-sm font-medium text-charcoal-500 flex flex-wrap items-center gap-2"
      >
        <Link href="/" className="hover:text-olive-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-olive-700 transition-colors"
        >
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="capitalize hover:text-olive-700 transition-colors"
        >
          {category?.name || product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start mb-20">
        {/* Hero Image & Thumbnails */}
        <div className="flex flex-col">
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-cream-100/80 to-white rounded-3xl flex items-center justify-center p-8 sm:p-12 mb-6">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-[500px] w-full object-contain mx-auto"
              />
            ) : (
              <div className="flex h-[400px] w-full items-center justify-center bg-transparent">
                <span className="font-display text-sm text-olive-800/60">
                  Product Image
                </span>
              </div>
            )}

            {product.tag && (
              <div className="absolute left-6 top-6 z-10">
                <Badge tone={getBadgeTone(product.tag)}>{product.tag}</Badge>
              </div>
            )}

            {discountPercentage && (
              <div className="absolute right-6 top-6 z-10 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream-50 shadow-sm">
                Save {discountPercentage}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-2 scrollbar-hide justify-start md:justify-center">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className={`animate-thumbnail-in relative flex-shrink-0 w-16 h-16 md:w-auto md:h-auto md:aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-olive-700 ring-2 ring-olive-700"
                        : "border-olive-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col h-full pt-2">
          <span className="text-sm font-medium text-olive-600 uppercase tracking-widest mb-3 block">
            {category?.name || product.category.replace("-", " ")}
          </span>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-charcoal-900 tracking-tight leading-[1.1]">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "fill-transparent text-olive-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-charcoal-900 ml-1">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-charcoal-500 ml-1 underline cursor-pointer hover:text-charcoal-900 transition-colors">
              {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline">
            <span className="text-3xl font-bold text-charcoal-900 font-display">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-charcoal-400 line-through ml-3">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="text-base font-semibold text-emerald-600 ml-3">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-charcoal-700">
              {product.stock > 0
                ? "In Stock and ready to ship"
                : "Out of stock"}
            </span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-charcoal-600 max-w-2xl">
            {product.description}
          </p>

          {/* Variant Swatches (Read-Only Specs) */}
          {specEntries.length > 0 && (
            <div className="mt-10 space-y-8">
              {specEntries.map(([key, value], idx) => {
                return (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wide mb-3">
                      {key}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {value
                        .split(",")
                        .map((val) => val.trim())
                        .map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                              i === 0
                                ? "border-olive-800 bg-olive-800 text-cream-50"
                                : "border-olive-200 bg-white text-charcoal-700 hover:border-olive-400"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <div className="border-t border-olive-100 pt-8 mt-10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center justify-between border border-olive-200 rounded-full px-5 py-3.5 bg-white w-full sm:w-auto min-w-[140px]">
                <button
                  type="button"
                  disabled={quantity <= 1 || product.stock <= 0}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-charcoal-600 hover:text-olive-700 disabled:opacity-40 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-lg font-bold text-charcoal-900 font-display">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || product.stock <= 0}
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="text-charcoal-600 hover:text-olive-700 disabled:opacity-40 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className={`flex-1 w-full sm:w-auto rounded-full py-4 text-base font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  product.stock <= 0
                    ? "bg-charcoal-100 text-charcoal-400 cursor-not-allowed"
                    : added
                    ? "bg-emerald-600 text-white"
                    : "bg-olive-800 text-cream-50 hover:bg-olive-900"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      Add to Bag — ${(product.price * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => product && toggleWishlist(product)}
                className={`h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-full border transition-colors duration-300 ${
                  inWishlist
                    ? "bg-red-50 border-red-300 text-red-500"
                    : "border-olive-200 bg-white text-charcoal-600 hover:border-charcoal-300"
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${inWishlist ? "fill-red-500" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 mb-24">
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <Truck className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">
            Free Shipping
          </h4>
          <p className="text-xs text-charcoal-500 mt-1">
            On all orders over $50
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <ShieldCheck className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">
            2-Year Warranty
          </h4>
          <p className="text-xs text-charcoal-500 mt-1">
            Guaranteed craftsmanship
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <RotateCcw className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">
            30-Day Returns
          </h4>
          <p className="text-xs text-charcoal-500 mt-1">
            Hassle-free return policy
          </p>
        </div>
      </div>

      {/* Specifications Table Section */}
      {specEntries.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-8">
            Specifications
          </h2>
          <div className="rounded-2xl border border-olive-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                {specEntries.map(([key, val], idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? "bg-white" : "bg-cream-50"}
                  >
                    <th className="py-4 px-6 font-medium text-charcoal-800 text-sm border-b border-olive-100 w-1/3">
                      {key}
                    </th>
                    <td className="py-4 px-6 text-charcoal-600 text-sm border-b border-olive-100">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-24">
        {product && (
          <ProductReviews productId={product._id} currentUser={user} />
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-olive-100">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mb-10 text-center sm:text-left">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} compact />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart */}
      {product && product.stock > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-olive-200 p-3 shadow-lg z-40 md:hidden">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto px-4">
            <div>
              <p className="font-display text-lg font-bold text-charcoal-900">
                ${product.price.toFixed(2)}
              </p>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <p className="text-xs text-charcoal-500 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </p>
                )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 max-w-xs rounded-full bg-olive-800 py-3 text-sm font-bold text-cream-50 shadow-md hover:bg-olive-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {added ? "Added to Bag" : "Add to Bag"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
