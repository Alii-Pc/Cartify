"use client";

import React, { useState, useEffect } from "react";
import { Loader } from "@/components/ui/Loader";
import { Star, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Review {
  _id: string;
  user: { _id: string; name: string; email: string };
  product: { _id: string; name: string; slug: string; images: string[] };
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reviews?page=${pageNum}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
        setTotalReviews(data.data.total);
      } else {
        setError(data.message || "Failed to load reviews");
      }
    } catch (err) {
      setError("An error occurred while loading reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchReviews(page);
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && reviews.length === 0) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader /></div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Reviews & Ratings</h1>
          <p className="mt-1 text-sm text-charcoal-600">
            Manage customer reviews across all products. Total reviews: {totalReviews}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-olive-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-olive-50 text-xs uppercase text-charcoal-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Review</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-olive-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {review.product ? (
                        <div className="flex items-center gap-3">
                          {review.product.images?.[0] ? (
                            <img src={review.product.images[0]} alt={review.product.name} className="h-10 w-10 rounded-md object-cover bg-olive-100" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-olive-100 flex items-center justify-center text-olive-400">P</div>
                          )}
                          <Link href={`/products/${review.product.slug}`} className="font-medium text-charcoal-900 hover:text-amber-600 transition-colors line-clamp-1 max-w-[150px]" target="_blank">
                            {review.product.name}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-charcoal-400 italic">Deleted Product</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {review.user ? (
                        <div>
                          <div className="font-medium text-charcoal-900">{review.user.name}</div>
                          <div className="text-xs text-charcoal-500">{review.user.email}</div>
                          {review.isVerifiedPurchase && (
                            <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                              Verified
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-charcoal-400 italic">Deleted User</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-olive-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-charcoal-700 line-clamp-2 max-w-xs" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 whitespace-nowrap">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-olive-100 bg-olive-50/50 px-6 py-4">
            <div className="text-sm text-charcoal-600">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchReviews(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-olive-200 bg-white px-3 py-1.5 text-sm font-medium text-charcoal-700 hover:bg-olive-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchReviews(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-olive-200 bg-white px-3 py-1.5 text-sm font-medium text-charcoal-700 hover:bg-olive-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
