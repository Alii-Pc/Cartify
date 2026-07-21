"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } =
    useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    if (code === "WELCOME10") {
      setDiscount(subtotal * 0.1);
      setPromoApplied(true);
    } else if (code === "CARTIFY20") {
      if (subtotal < 50) {
        setPromoError("Order must be at least $50 for CARTIFY20 coupon.");
        return;
      }
      setDiscount(20);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid or expired promo code. Try WELCOME10");
    }
  };

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5.0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const grandTotal = Math.max(0, taxableAmount + shipping + tax);

  const handleSimulatedCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderSuccess(true);
      clearCart();
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="card-surface p-12 sm:p-16 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
            Order Confirmed!
          </h1>
          <p className="mt-3 max-w-md text-sm text-charcoal-700/80 leading-relaxed">
            Thank you for shopping with Cartify. We have received your order and are getting it ready for shipment right now.
          </p>
          <div className="mt-8 rounded-2xl bg-cream-100/80 border border-olive-100 p-6 w-full max-w-sm text-left text-xs space-y-2">
            <div className="flex justify-between font-semibold text-charcoal-900">
              <span>Order Number:</span>
              <span>#CFY-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between text-charcoal-700/75">
              <span>Estimated Delivery:</span>
              <span>3 - 5 Business Days</span>
            </div>
          </div>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-olive-800 px-8 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-900 shadow-sm"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-charcoal-700/70">
            {itemCount === 0
              ? "No items added yet"
              : `You have ${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors self-start sm:self-auto underline"
          >
            Clear entire cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="card-surface p-16 text-center flex flex-col items-center justify-center my-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-100 text-olive-800 mb-6">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-charcoal-900">
            Your shopping cart is empty
          </h2>
          <p className="mt-2 max-w-md text-sm text-charcoal-700/70 leading-relaxed">
            Looks like you haven&apos;t added anything yet. Discover our premium handcrafted essentials and deals.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-olive-800 px-8 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-900 shadow-sm"
          >
            <span>Explore All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start xl:gap-12">
          {/* Left Column: Line Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const image =
                product.images && product.images.length > 0 ? product.images[0] : "";

              return (
                <div
                  key={product._id}
                  className="card-surface p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-shadow hover:shadow-olive"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link
                      href={`/products/${product.slug}`}
                      className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream-200/80 relative"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-olive-100 text-xs text-olive-800">
                          No Img
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-700/60">
                        {product.category.replace("-", " ")}
                      </span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="block font-display text-base font-bold text-charcoal-900 hover:text-olive-800 truncate transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 font-display text-sm font-semibold text-charcoal-800">
                        ${product.price.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-charcoal-700/60">each</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Line Total Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-olive-100">
                    <div className="flex items-center border border-olive-200 rounded-full px-3 py-1.5 bg-white/80">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        className="p-1 text-charcoal-800 transition-colors hover:text-olive-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-display text-sm font-bold text-charcoal-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= product.stock}
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        className="p-1 text-charcoal-800 transition-colors hover:text-olive-700 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-display text-base font-extrabold text-charcoal-900">
                        ${(product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(product._id)}
                      className="p-2 text-charcoal-700/50 transition-colors hover:text-red-600 rounded-full hover:bg-red-50"
                      aria-label="Remove item from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Back to Shopping */}
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-olive-800 hover:underline"
              >
                <span>← Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="card-surface p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-xl font-bold text-charcoal-900 border-b border-olive-100 pb-4">
                Order Summary
              </h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-700/40" />
                    <input
                      type="text"
                      placeholder="WELCOME10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full rounded-full border border-olive-200 bg-white py-2 pl-9 pr-3 text-xs uppercase tracking-wider text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-charcoal-800 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-charcoal-900"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Promo applied successfully!
                  </p>
                )}
                {promoError && (
                  <p className="text-xs font-medium text-red-600">{promoError}</p>
                )}
              </form>

              {/* Breakdown */}
              <dl className="space-y-3 text-sm text-charcoal-800 border-t border-olive-100 pt-4">
                <div className="flex justify-between">
                  <dt className="text-charcoal-700/80">Subtotal ({itemCount} items)</dt>
                  <dd className="font-semibold text-charcoal-900">${subtotal.toFixed(2)}</dd>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <dt>Discount</dt>
                    <dd>-${discount.toFixed(2)}</dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="text-charcoal-700/80">Estimated Shipping</dt>
                  <dd className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 uppercase font-bold text-xs">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-charcoal-700/80">Estimated Tax (8%)</dt>
                  <dd className="font-semibold">${tax.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between border-t border-olive-200 pt-4 text-base font-extrabold text-charcoal-900">
                  <dt>Grand Total</dt>
                  <dd className="font-display text-2xl text-olive-900">
                    ${grandTotal.toFixed(2)}
                  </dd>
                </div>
              </dl>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full rounded-full bg-olive-800 py-4 text-center font-display text-base font-bold text-cream-50 shadow-md transition-all hover:bg-olive-900 hover:scale-[1.02] active:scale-98 hover:no-underline"
              >
                Proceed to Checkout
              </Link>
            </div>

            {/* Value Props */}
            <div className="card-surface p-6 space-y-4 text-xs font-medium text-charcoal-700/80">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-olive-800 flex-shrink-0" />
                <span>Free express shipping on all orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-olive-800 flex-shrink-0" />
                <span>256-bit SSL encrypted secure checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-olive-800 flex-shrink-0" />
                <span>30-day money-back guarantee &amp; free returns</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
