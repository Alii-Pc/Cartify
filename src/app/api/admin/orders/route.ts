import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { requireAdmin, successResponse, errorResponse, parsePaginationParams } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();
    const url = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(url, 10, 50);
    
    const q = url.searchParams.get("q") || "";
    const status = url.searchParams.get("status") || "";
    const paymentStatus = url.searchParams.get("paymentStatus") || "";
    const sort = url.searchParams.get("sort") === "oldest" ? 1 : -1;

    const query: any = {};
    if (q) {
      query.orderNumber = { $regex: q, $options: "i" };
    }
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: sort })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .lean(),
      Order.countDocuments(query)
    ]);

    return successResponse({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin orders list error:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}
