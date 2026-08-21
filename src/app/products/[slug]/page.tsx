"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  const { user } = useAuth();
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
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 animate-pulse">
          <div className="aspect-square rounded-3xl bg-olive-200/50 max-h-[500px]" />
          <div className="space-y-8 py-4">
            <div className="h-4 w-40 rounded bg-olive-200/60" />
            <div className="h-12 w-3/4 rounded bg-olive-200/80" />
            <div className="h-8 w-32 rounded bg-olive-200/80" />
            <div className="space-y-3 pt-6">
              <div className="h-4 w-full rounded bg-olive-200/50" />
              <div className="h-4 w-full rounded bg-olive-200/50" />
              <div className="h-4 w-4/5 rounded bg-olive-200/50" />
              <div className="h-4 w-2/3 rounded bg-olive-200/50" />
            </div>
            <div className="h-14 w-full rounded-full bg-olive-200/80 mt-10" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center flex flex-col items-center justify-center">
        <h2 className="font-display text-3xl font-bold text-charcoal-900 mb-4">
          {error || "Product Not Found"}
        </h2>
        <p className="text-lg text-charcoal-600 mb-8 max-w-md mx-auto">
          The item you are looking for might have been discontinued, renamed, or is currently unavailable.
        </p>
        <Link
          href="/products"
          className="inline-flex rounded-full bg-olive-800 px-8 py-4 text-base font-semibold text-cream-50 transition-colors hover:bg-olive-900"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const specEntries = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-12 text-sm font-medium text-charcoal-500 flex flex-wrap items-center gap-2">
        <Link href="/" className="hover:text-olive-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-olive-700 transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="capitalize hover:text-olive-700 transition-colors">
          {category?.name || product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
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
                <span className="font-display text-sm text-olive-800/60">Product Image</span>
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
            <div className="flex flex-wrap gap-4 justify-center">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className={`animate-thumbnail-in relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
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
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current" : "fill-transparent text-olive-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-charcoal-900 ml-1">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-charcoal-500 ml-1 underline cursor-pointer hover:text-charcoal-900 transition-colors">
              {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline">
            <span className="text-3xl font-bold text-charcoal-900 font-display">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
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
            <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-charcoal-700">
              {product.stock > 0 ? "In Stock and ready to ship" : "Out of stock"}
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
                      {value.split(",").map((val) => val.trim()).map((v, i) => (
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
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
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
                    <span>Add to Bag — ${(product.price * quantity).toFixed(2)}</span>
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
                <Heart className={`h-6 w-6 ${inWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 mb-24">
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <Truck className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">Free Shipping</h4>
          <p className="text-xs text-charcoal-500 mt-1">On all orders over $50</p>
        </div>
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <ShieldCheck className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">2-Year Warranty</h4>
          <p className="text-xs text-charcoal-500 mt-1">Guaranteed craftsmanship</p>
        </div>
        <div className="p-6 rounded-2xl bg-cream-50 border border-olive-100 text-center">
          <RotateCcw className="h-6 w-6 text-olive-700 mx-auto" />
          <h4 className="text-sm font-semibold text-charcoal-900 mt-3">30-Day Returns</h4>
          <p className="text-xs text-charcoal-500 mt-1">Hassle-free return policy</p>
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
                  <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-cream-50"}>
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
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
