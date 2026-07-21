"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { CheckCircle, Truck, Package, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import type { SafeOrder } from "@/types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<SafeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        } else {
          setError(json.message || "Failed to load order details");
        }
      } catch {
        setError("An error occurred while loading your order.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
            <p className="text-sm font-medium text-charcoal-700/85">Loading order details...</p>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (error || !order) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
            <p className="text-sm font-semibold text-red-700">{error || "Order not found"}</p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-olive-800 px-6 py-2.5 text-xs font-semibold text-cream-50 hover:bg-olive-900 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="bg-cream-50 min-h-[80vh] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Success Section */}
          <div className="text-center mb-10 animate-fadeIn">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-650 mb-4 shadow-xs">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
              Thank you for your order!
            </h1>
            <p className="mt-2 text-sm text-charcoal-700/70 max-w-md mx-auto">
              We&apos;ve received order <span className="font-semibold text-charcoal-900 font-mono">#{order.orderNumber}</span> and will send you updates as it ships.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
            {/* Left Column: Order Breakdown & Shipping Details (8 cols) */}
            <div className="md:col-span-8 space-y-6">
              {/* Order Items */}
              <div className="card-surface p-6 sm:p-8">
                <h2 className="font-display text-base font-bold text-charcoal-900 mb-5 pb-3 border-b border-olive-100/60 flex items-center gap-2">
                  <Package className="h-4.5 w-4.5 text-olive-750" />
                  <span>Items Ordered</span>
                </h2>

                <div className="divide-y divide-olive-100/60">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="h-16 w-16 rounded-xl bg-cream-200/50 border border-olive-100 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-olive-100 text-[10px] text-olive-805">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-display text-sm font-bold text-charcoal-900 hover:text-olive-800 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-charcoal-700/60 mt-1">
                          Qty: {item.quantity} &bull; ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <p className="text-sm font-bold text-charcoal-900 flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Shipping Address info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Shipping Address info */}
                <div className="card-surface p-6">
                  <h3 className="font-display text-sm font-bold text-charcoal-900 mb-3 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-olive-700" />
                    <span>Shipping Address</span>
                  </h3>
                  <div className="text-xs text-charcoal-700/85 space-y-1">
                    <p className="font-bold text-charcoal-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="text-charcoal-700/60 mt-2">📞 {order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="card-surface p-6">
                  <h3 className="font-display text-sm font-bold text-charcoal-900 mb-3 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-olive-700" />
                    <span>Delivery Method</span>
                  </h3>
                  <div className="text-xs text-charcoal-700/85 space-y-2">
                    <div>
                      <p className="font-semibold text-charcoal-800">Standard Shipping</p>
                      <p className="text-charcoal-700/60 mt-0.5">Estimated delivery: 3-5 business days</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-olive-100/60 text-[10px] uppercase font-bold tracking-wider text-emerald-650">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Order Confirmed &amp; Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Cost Breakdown (4 cols) */}
            <div className="md:col-span-4 space-y-6">
              <div className="card-surface p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-sm font-bold text-charcoal-900 border-b border-olive-100/60 pb-3 uppercase tracking-wide">
                  Order Breakdown
                </h2>

                <dl className="space-y-2.5 text-xs text-charcoal-800">
                  <div className="flex justify-between">
                    <dt className="text-charcoal-700/70">Subtotal</dt>
                    <dd className="font-semibold text-charcoal-900">${order.subtotal.toFixed(2)}</dd>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <dt>Discount</dt>
                      <dd>-${order.discount.toFixed(2)}</dd>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <dt className="text-charcoal-700/70">Shipping</dt>
                    <dd className="font-semibold text-charcoal-900">
                      {order.shipping === 0 ? <span className="text-emerald-650 font-bold uppercase text-[10px]">FREE</span> : `$${order.shipping.toFixed(2)}`}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-charcoal-700/70">Tax (8%)</dt>
                    <dd className="font-semibold text-charcoal-900">${order.tax.toFixed(2)}</dd>
                  </div>

                  <div className="flex justify-between border-t border-olive-100 pt-3 text-sm font-extrabold text-charcoal-900">
                    <dt>Total Payment</dt>
                    <dd className="font-display text-lg text-olive-900">${order.total.toFixed(2)}</dd>
                  </div>
                </dl>

                {order.promoCode && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-[11px] font-semibold text-emerald-750">
                    <span className="flex items-center gap-1">🏷️ Promo Applied:</span>
                    <span className="font-mono bg-emerald-100/50 px-2 py-0.5 rounded-md font-bold uppercase">{order.promoCode}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/products"
                  className="block w-full rounded-full bg-olive-800 py-3 text-center font-display text-sm font-bold text-cream-50 hover:bg-olive-900 shadow-sm hover:scale-[1.01] active:scale-99 transition-all hover:no-underline"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/orders"
                  className="block w-full rounded-full border border-olive-300 bg-white py-3 text-center font-display text-sm font-bold text-olive-800 hover:bg-cream-100 transition-all hover:no-underline"
                >
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
