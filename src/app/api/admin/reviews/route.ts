import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  parsePaginationParams,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews
 * Fetch paginated reviews across all products for admin panel
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user || user.role !== "admin") {
      return errorResponse("Admin authorization required", 403);
    }

    const { page, limit, skip } = parsePaginationParams(req.nextUrl, 10, 50);

    await connectDB();

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("GET /api/admin/reviews error:", err);
    return errorResponse("Failed to fetch reviews", 500);
  }
}
