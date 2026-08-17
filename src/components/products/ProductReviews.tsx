import React, { useState, useEffect } from "react";
import { Star, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-string"; // Wait, I don't know if date-fns is installed. Let's just use standard Date formatting.

interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  currentUser: any; // Ideally user object from context/auth
}

export function ProductReviews({ productId, currentUser }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews);
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
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment) return;

    setSubmitting(true);
    setError("");

    try {
      const url = editingId ? `/api/reviews/${editingId}` : "/api/reviews";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setComment("");
        setRating(5);
        setEditingId(null);
        fetchReviews(); // Reload reviews to get updated stats
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const startEditing = (review: Review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if current user has already reviewed
  const userReview = currentUser ? reviews.find(r => r.user._id === currentUser._id || r.user._id === currentUser.id) : null;

  return (
    <div className="mt-16 border-t border-olive-200 pt-10">
      <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Customer Reviews</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Review Summary & CTA */}
        <div className="md:col-span-1">
          <div className="bg-olive-50 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-2">Write a Review</h3>
            <p className="text-sm text-charcoal-600 mb-4">
              Share your thoughts with other customers. Only users who have purchased this product can leave a review.
            </p>
            {!currentUser ? (
              <p className="text-sm text-charcoal-500 italic">Please log in to leave a review.</p>
            ) : userReview && !editingId ? (
              <p className="text-sm font-medium text-olive-600 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> You have already reviewed this product.
              </p>
            ) : (
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm && !editingId) {
                    setRating(5);
                    setComment("");
                  }
                }}
                className="w-full bg-charcoal-900 text-white py-2 rounded-full font-medium hover:bg-charcoal-800 transition-colors"
              >
                {showForm ? "Cancel" : editingId ? "Edit Review" : "Write Review"}
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Review List & Form */}
        <div className="md:col-span-2">
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Your Review" : "Submit Your Review"}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? "fill-amber-400 text-amber-400" : "text-olive-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border-olive-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-sm p-3 border"
                  placeholder="What did you like or dislike? What did you use this product for?"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-charcoal-600 bg-olive-100 hover:bg-olive-200 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-full transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-olive-100 rounded-xl w-full"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-olive-50 rounded-2xl">
              <Star className="w-10 h-10 text-olive-300 mx-auto mb-3" />
              <p className="text-charcoal-500 font-medium">No reviews yet.</p>
              <p className="text-sm text-charcoal-400 mt-1">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                const isAuthor = currentUser && (review.user._id === currentUser._id || review.user._id === currentUser.id);
                return (
                  <div key={review._id} className="bg-white p-5 rounded-2xl border border-olive-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-charcoal-900">{review.user.name}</span>
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating ? "fill-amber-400 text-amber-400" : "text-olive-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-charcoal-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      
                      {isAuthor && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startEditing(review)}
                            className="text-olive-400 hover:text-charcoal-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(review._id)}
                            className="text-olive-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-charcoal-700 text-sm whitespace-pre-wrap">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
