"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="card-surface p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-100 text-olive-700 mb-6">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold text-charcoal-900 mb-2">
        {title}
      </h3>
      <p className="text-charcoal-700/70 max-w-md mb-8">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {actionLabel && actionHref ? (
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
          </Link>
        ) : actionLabel && onAction ? (
          <button onClick={onAction} className="btn-primary">
            {actionLabel}
          </button>
        ) : null}
        
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className="text-olive-700 font-medium hover:text-olive-800 transition-colors">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
