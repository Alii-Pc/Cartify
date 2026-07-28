import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"])
});

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();
    const user = await User.findById(params.userId)
      .select("-password -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordTokenExpires")
      .lean();

    if (!user) return errorResponse("User not found", 404);

    const recentOrders = await Order.find({ userId: params.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return successResponse({ user, recentOrders });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin get user error:", error);
    return errorResponse("Failed to fetch user", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid role", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      params.userId,
      { role: parsed.data.role },
      { new: true }
    )
      .select("-password -verificationOtp -verificationOtpExpires -resetPasswordToken -resetPasswordTokenExpires")
      .lean();

    if (!user) return errorResponse("User not found", 404);
    return successResponse(user, "User role updated successfully");
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin update user role error:", error);
    return errorResponse("Failed to update user role", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();
    const user = await User.findByIdAndDelete(params.userId);
    if (!user) return errorResponse("User not found", 404);

    await Promise.all([
      Cart.findOneAndDelete({ userId: params.userId }),
      Order.deleteMany({ userId: params.userId })
    ]);

    return successResponse(null, "User and associated data deleted successfully");
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin delete user error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}
