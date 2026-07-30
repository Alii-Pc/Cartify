"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, ShoppingBag, ArrowRight, Package, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ShopLayout } from "@/components/layout/ShopLayout";
import type { SafeOrder } from "@/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<SafeOrder | null>(null);
  
  // Track if we've successfully verified to avoid clearing cart multiple times in dev
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setError("No session ID found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const json = await res.json();

        if (json.success && json.data) {
          setOrder(json.data.order);
          if (!verified) {
            clearCart();
            setVerified(true);
          }
        } else {
          setError(json.message || "Payment verification failed.");
        }
      } catch (err) {
        setError("An error occurred while verifying your payment.");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId, clearCart, verified]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
          <p className="text-sm font-medium text-charcoal-700/85">Verifying your secure payment...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-charcoal-900 mb-2">Verification Error</h2>
          <p className="text-sm font-medium text-red-700 mb-6">{error || "Could not load order details."}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-charcoal-800 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-charcoal-900 transition-all"
            >
              Try Again
            </button>
            <Link
              href="/checkout"
              className="rounded-full border border-charcoal-200 bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-800 hover:bg-cream-100 transition-all"
            >
              Return to Checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-[80vh] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header Success Section */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-650 mb-5 shadow-sm relative">
            <CheckCircle2 className="h-10 w-10 relative z-10" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20"></div>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl mb-3">
            Payment Successful!
          </h1>
          <p className="text-sm text-charcoal-700/80 max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. We&apos;ve received order <span className="font-semibold text-charcoal-900 font-mono">#{order.orderNumber}</span>. A confirmation email will be sent shortly.
          </p>
        </div>

        <div className="card-surface p-6 sm:p-8 mb-8 animate-fadeIn" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-olive-100 mb-6 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-charcoal-700/60 uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="font-display text-3xl font-extrabold text-olive-900">${order.total.toFixed(2)}</p>
            </div>
            
            <a
              href={`/api/orders/${order._id}/invoice`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-olive-200 bg-white px-4 py-2 text-sm font-semibold text-olive-800 hover:bg-cream-100 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Invoice</span>
            </a>
          </div>

          <h2 className="font-display text-sm font-bold text-charcoal-900 mb-4 flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-olive-750" />
            <span>Order Items</span>
          </h2>

          <div className="divide-y divide-olive-100/60 max-h-80 overflow-y-auto pr-2">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-14 w-14 rounded-lg bg-cream-200/50 border border-olive-100 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-olive-100 text-[10px] text-olive-800">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal-900 truncate">{item.name}</p>
                  <p className="text-xs text-charcoal-700/60 mt-0.5">
                    Qty: {item.quantity} &bull; ${item.price.toFixed(2)} each
                  </p>
                </div>
                <p className="text-sm font-extrabold text-charcoal-900 flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: "200ms" }}>
          <Link
            href={`/orders/${order.orderNumber}`}
            className="inline-flex justify-center items-center gap-2 rounded-full border border-olive-300 bg-white px-8 py-3.5 text-sm font-bold text-olive-800 hover:bg-cream-100 transition-all shadow-sm w-full sm:w-auto"
          >
            <span>View Order Details</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex justify-center items-center gap-2 rounded-full bg-olive-800 px-8 py-3.5 text-sm font-bold text-cream-50 hover:bg-olive-900 transition-all shadow-sm w-full sm:w-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <ShopLayout>
      <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </ShopLayout>
  );
}
