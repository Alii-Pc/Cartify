import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  parsePaginationParams,
} from "@/lib/api-utils";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * Helper function to update product rating and review count
 */
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
    // If no reviews left
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
}

/**
 * GET /api/reviews?productId=...
 * Fetch paginated reviews for a product
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse("Valid Product ID is required", 400);
    }

    const { page, limit, skip } = parsePaginationParams(req.nextUrl, 10, 50);

    await connectDB();

    const total = await Review.countDocuments({ product: productId });
    const rawReviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const reviews = rawReviews.map((r: any) => ({
      ...r,
      user: r.user || { _id: "guest", name: r.reviewerName || "Shopper" },
      reviewerName: r.user?.name || r.reviewerName || "Shopper",
    }));

    return successResponse({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("GET /api/reviews error:", err);
    return errorResponse("Failed to fetch reviews", 500);
  }
}

/**
 * POST /api/reviews
 * Create a new review (Open to all customers)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { productId, rating, comment, name } = body;

    if (!productId || !rating || !comment) {
      return errorResponse("Product ID, rating, and comment are required", 400);
    }

    if (rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }

    await connectDB();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    let isVerifiedPurchase = false;

    if (user) {
      // Check if logged-in user already reviewed this product
      const existingReview = await Review.findOne({
        user: user._id,
        product: productId,
      });
      if (existingReview) {
        return errorResponse("You have already reviewed this product", 400);
      }

      // Check if user has purchased the product to award verified buyer badge
      const hasPurchased = await Order.findOne({
        userId: user._id,
        "items.productId": productId,
        status: { $ne: "cancelled" },
      });

      isVerifiedPurchase = !!hasPurchased;

      // Create review with authenticated user link
      const newReview = new Review({
        user: user._id,
        reviewerName: user.name,
        product: productId,
        rating,
        comment: comment.trim(),
        isVerifiedPurchase,
      });

      await newReview.save();
      await updateProductRating(productId);

      return successResponse(newReview, "Review added successfully", 201);
    } else {
      // Allow guest reviewers to review products directly!
      const reviewerName = name?.trim() || "Shopper";

      const newReview = new Review({
        reviewerName,
        product: productId,
        rating,
        comment: comment.trim(),
        isVerifiedPurchase: false,
      });

      await newReview.save();
      await updateProductRating(productId);

      return successResponse(newReview, "Review added successfully", 201);
    }
  } catch (err: any) {
    console.error("POST /api/reviews error:", err);
    return errorResponse("Failed to add review", 500);
  }
}
