"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function PaymentCancelPage() {
  return (
    <ShopLayout>
      <div className="bg-cream-50 min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="card-surface p-8 sm:p-12 max-w-md w-full text-center animate-fadeIn">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6 shadow-sm">
            <XCircle className="h-10 w-10" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-charcoal-900 mb-3">
            Payment Cancelled
          </h1>
          
          <p className="text-sm text-charcoal-700/80 mb-8 leading-relaxed">
            Your payment was not processed and you have not been charged. If you experienced an issue during checkout, please try again.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/checkout"
              className="inline-flex justify-center items-center gap-2 rounded-full bg-olive-800 px-6 py-3.5 text-sm font-bold text-cream-50 hover:bg-olive-900 transition-all shadow-sm w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Checkout</span>
            </Link>
            
            <Link
              href="/products"
              className="inline-flex justify-center items-center gap-2 rounded-full border border-olive-300 bg-white px-6 py-3.5 text-sm font-bold text-olive-800 hover:bg-cream-100 transition-all shadow-sm w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
