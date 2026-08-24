"use client";

import React from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="card-surface p-12 flex flex-col items-center justify-center text-center max-w-2xl w-full">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-olive-100 text-olive-700 mb-6">
          <PackageOpen className="h-12 w-12" />
        </div>
        <h1 className="font-display text-6xl font-bold text-olive-800 mb-4">
          404
        </h1>
        <h2 className="font-display text-2xl font-semibold text-charcoal-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-charcoal-700/70 max-w-md mb-8">
          The product you're looking for doesn't exist, is out of stock, or has been removed from our catalog.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/products" className="btn-primary">
            Browse our catalog
          </Link>
          <Link href="/" className="text-olive-700 font-medium hover:text-olive-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
