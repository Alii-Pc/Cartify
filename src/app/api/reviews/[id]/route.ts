import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

async function updateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].numOfReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
}

/**
 * PUT /api/reviews/[id]
 * Update a user's own review
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    const body = await req.json();
    const { rating, comment } = body;

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse("Review not found", 404);
    }

    // Only the author can update their review
    if (!review.user || review.user.toString() !== user._id.toString()) {
      return errorResponse("Not authorized to update this review", 403);
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return errorResponse("Rating must be between 1 and 5", 400);
      }
      review.rating = rating;
    }
    if (comment) {
      review.comment = comment;
    }

    await review.save();

    // Update product stats
    await updateProductRating(review.product.toString());

    return successResponse(review, "Review updated successfully");
  } catch (err: any) {
    console.error("PUT /api/reviews/[id] error:", err);
    return errorResponse("Failed to update review", 500);
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a user's own review
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse("Review not found", 404);
    }

    // Only the author can delete their review
    if (!review.user || review.user.toString() !== user._id.toString()) {
      return errorResponse("Not authorized to delete this review", 403);
    }

    await Review.findByIdAndDelete(id);

    // Update product stats
    await updateProductRating(review.product.toString());

    return successResponse(null, "Review deleted successfully");
  } catch (err: any) {
    console.error("DELETE /api/reviews/[id] error:", err);
    return errorResponse("Failed to delete review", 500);
  }
}
