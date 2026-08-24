"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error has occurred. Please try again later.",
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  return (
    <div className="card-surface p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h3 className="font-display text-2xl font-semibold text-charcoal-900 mb-2">
        {title}
      </h3>
      <p className="text-charcoal-700/70 max-w-md mb-8">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            {retryLabel}
          </button>
        )}
        
        <Link href="/" className="text-olive-700 font-medium hover:text-olive-800 transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
