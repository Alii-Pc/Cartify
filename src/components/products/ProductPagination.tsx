"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {/* Previous button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 rounded-full border border-olive-200 bg-white px-4 py-2 text-sm font-medium text-charcoal-800 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Prev</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                isCurrent
                  ? "bg-olive-800 text-cream-50 font-semibold shadow-sm"
                  : "border border-olive-200 bg-white text-charcoal-800 hover:bg-cream-100"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 rounded-full border border-olive-200 bg-white px-4 py-2 text-sm font-medium text-charcoal-800 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
