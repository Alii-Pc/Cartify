import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid update data", 400, parsed.error.flatten().fieldErrors);
    }

    if (!parsed.data.status && !parsed.data.paymentStatus) {
      return errorResponse("No fields to update", 400);
    }

    await connectDB();
    const order = await Order.findById(params.orderId);
    if (!order) return errorResponse("Order not found", 404);

    if (parsed.data.status) {
      order.status = parsed.data.status;
    }
    if (parsed.data.paymentStatus) {
      order.paymentStatus = parsed.data.paymentStatus;
      if (parsed.data.paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    await order.save();
    return successResponse(order.toObject(), "Order updated successfully");
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin update order error:", error);
    return errorResponse("Failed to update order", 500);
  }
}
