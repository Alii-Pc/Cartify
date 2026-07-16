"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ProductCard } from "@/components/products/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingCart,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
} from "lucide-react";
import type { SafeProduct, SafeCategory } from "@/types";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<SafeProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<SafeProduct[]>([]);
  const [category, setCategory] = useState<SafeCategory | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    if (!slug) return;

    async function fetchProductDetails() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products/${slug}`);
        const json = await res.json();

        if (json.success && json.data) {
          setProduct(json.data.product);
          setRelatedProducts(json.data.relatedProducts || []);
          if (json.data.category) {
            setCategory(json.data.category);
          }
          if (json.data.product.images?.length > 0) {
            setSelectedImage(json.data.product.images[0]);
          }
        } else {
          setError(json.message || "Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [slug]);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 animate-pulse">
          <div className="aspect-square rounded-2xl bg-olive-200/50" />
          <div className="space-y-6 py-4">
            <div className="h-4 w-40 rounded bg-olive-200/60" />
            <div className="h-10 w-3/4 rounded bg-olive-200/80" />
            <div className="h-6 w-24 rounded bg-olive-200/80" />
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full rounded bg-olive-200/50" />
              <div className="h-4 w-full rounded bg-olive-200/50" />
              <div className="h-4 w-2/3 rounded bg-olive-200/50" />
            </div>
            <div className="h-12 w-full rounded-full bg-olive-200/80 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="card-surface p-12">
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            {error || "Product Not Found"}
          </h2>
          <p className="mt-2 text-sm text-charcoal-700/70">
            The item you are looking for might have been discontinued, renamed, or is currently unavailable.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-olive-700 px-6 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-olive-800"
          >
            Back to All Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-medium text-charcoal-700/60">
        <Link href="/" className="hover:text-olive-800">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-olive-800">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category=${product.category}`} className="capitalize hover:text-olive-800">
          {category?.name || product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-charcoal-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        {/* Image Showcase & Thumbnails */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl card-surface bg-cream-200/80">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-olive-100 to-olive-200">
                <span className="font-display text-sm text-olive-800/60">Product Image</span>
              </div>
            )}

            {product.tag && (
              <div className="absolute left-4 top-4 z-10">
                <Badge tone={getBadgeTone(product.tag)}>{product.tag}</Badge>
              </div>
            )}

            {discountPercentage && (
              <div className="absolute right-4 top-4 z-10 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cream-50 shadow-sm">
                Save {discountPercentage}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    aria-label={`Select product thumbnail ${idx + 1}`}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-olive-800 ring-2 ring-olive-800/20 scale-95"
                        : "border-transparent opacity-70 hover:opacity-100"
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

        {/* Product Details & Purchase Form */}
        <div className="flex flex-col justify-between h-full py-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-olive-800/80">
                {category?.name || product.category.replace("-", " ")}
              </span>
              <div className="flex items-center gap-1.5 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold text-charcoal-900">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-charcoal-700/60">
                  ({product.reviewCount} customer reviews)
                </span>
              </div>
            </div>

            <h1 className="mt-2 font-display text-3xl font-bold text-charcoal-900 sm:text-4xl leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock status */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-charcoal-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base font-medium text-charcoal-700/50 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} units left in stock — order soon`
                    : `${product.stock} items available in stock`
                  : "Currently Out of Stock"}
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-charcoal-700/85">
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-8 border-t border-olive-100 pt-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center justify-between border border-olive-200 rounded-full px-4 py-2 bg-white/80">
                  <button
                    type="button"
                    disabled={quantity <= 1 || product.stock <= 0}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-charcoal-800 transition-colors hover:text-olive-700 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-display text-base font-bold text-charcoal-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock || product.stock <= 0}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-1 text-charcoal-800 transition-colors hover:text-olive-700 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold transition-all duration-200 shadow-sm ${
                    product.stock <= 0
                      ? "cursor-not-allowed bg-charcoal-700/20 text-charcoal-700/40"
                      : added
                      ? "bg-olive-900 text-cream-50 scale-[1.02]"
                      : "bg-olive-800 text-cream-50 hover:bg-olive-900 active:scale-95"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5 animate-bounce" />
                      <span>Added {quantity} to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart — ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product)}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 shadow-xs ${
                    inWishlist
                      ? "border-amber-500 bg-amber-50 text-amber-600 scale-105"
                      : "border-olive-200 bg-white text-charcoal-800 hover:border-amber-400 hover:text-amber-600"
                  }`}
                >
                  <Heart className={`h-6 w-6 ${inWishlist ? "fill-amber-600 animate-bounce" : ""}`} />
                </button>
              </div>
            </div>

            {/* Value Props */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-olive-100 py-6 text-center text-xs font-medium text-charcoal-700">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="h-5 w-5 text-olive-800" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-olive-800" />
                <span>2-Year Craftsmanship Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="h-5 w-5 text-olive-800" />
                <span>30-Day Hassle-Free Returns</span>
              </div>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-base font-semibold text-charcoal-900">
                  Product Specifications
                </h3>
                <dl className="mt-4 divide-y divide-olive-100 rounded-xl border border-olive-100 card-surface overflow-hidden">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 gap-4 px-5 py-3 text-xs sm:text-sm"
                    >
                      <dt className="font-semibold text-charcoal-800">{key}</dt>
                      <dd className="col-span-2 text-charcoal-700/85">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24 border-t border-olive-100 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-semibold text-charcoal-900 sm:text-3xl">
                You might also like
              </h2>
              <p className="mt-1 text-sm text-charcoal-700/70">
                Complementary items from our {category?.name || product.category.replace("-", " ")} collection.
              </p>
            </div>
            <Link
              href={`/products?category=${product.category}`}
              className="text-sm font-semibold text-olive-800 hover:underline flex items-center gap-1"
            >
              <span>View Category</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
