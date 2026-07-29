import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { parsePaginationParams } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();
    const url = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(url, 10, 50);

    const q = url.searchParams.get("q") || "";

    const query: any = {};
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ stock: 1, createdAt: -1 }) // Sort lowest stock first
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .select("name images category price stock sku inStock")
        .lean(),
      Product.countDocuments(query)
    ]);

    return successResponse({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin inventory list error:", error);
    return errorResponse("Failed to fetch inventory", 500);
  }
}
