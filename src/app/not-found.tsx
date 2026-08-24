"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="card-surface p-12 flex flex-col items-center justify-center text-center max-w-2xl w-full">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-olive-100 text-olive-700 mb-6">
          <FileQuestion className="h-12 w-12" />
        </div>
        <h1 className="font-display text-6xl font-bold text-olive-800 mb-4">
          404
        </h1>
        <h2 className="font-display text-2xl font-semibold text-charcoal-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-charcoal-700/70 max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/products" className="btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
