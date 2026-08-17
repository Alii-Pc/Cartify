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
 * DELETE /api/admin/reviews/[id]
 * Delete any review (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user || user.role !== "admin") {
      return errorResponse("Admin authorization required", 403);
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

    await Review.findByIdAndDelete(id);

    // Update product stats
    await updateProductRating(review.product.toString());

    return successResponse(null, "Review deleted successfully by admin");
  } catch (err: any) {
    console.error("DELETE /api/admin/reviews/[id] error:", err);
    return errorResponse("Failed to delete review", 500);
  }
}
