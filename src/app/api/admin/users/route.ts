import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
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
    const role = url.searchParams.get("role") || "";
    const sort = url.searchParams.get("sort") === "oldest" ? 1 : -1;

    const query: any = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordTokenExpires")
        .sort({ createdAt: sort })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const usersWithOrderCount = await Promise.all(
      users.map(async (user: any) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        return { ...user, orderCount };
      })
    );

    return successResponse({
      users: usersWithOrderCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin users list error:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}
