import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Setting } from "@/models/Setting";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    // Get return window from settings or default to 30 days
    const returnSetting: any = await Setting.findOne({ key: "return_window_days" }).lean();
    const returnWindowDays = Number(returnSetting?.value) || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - returnWindowDays);

    // Find delivered orders within return window
    const eligibleOrders = await Order.find({
      userId: user._id,
      status: "delivered",
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Find all active/completed return requests for this user
    const existingReturns = await ReturnRequest.find({
      userId: user._id,
      status: { $nin: ["cancelled", "rejected"] },
    }).lean();

    const returnedOrderMap: Record<string, string[]> = {}; // orderId -> returned productId array
    for (const ret of existingReturns) {
      const oId = ret.orderId.toString();
      if (!returnedOrderMap[oId]) {
        returnedOrderMap[oId] = [];
      }
      for (const item of ret.items) {
        returnedOrderMap[oId].push(item.productId.toString());
      }
    }

    // Filter and format eligible orders
    const formattedEligibleOrders = eligibleOrders.map((order: any) => {
      const oId = order._id.toString();
      const returnedProductIds = returnedOrderMap[oId] || [];

      const availableItems = order.items.filter(
        (item: any) => !returnedProductIds.includes(item.productId.toString())
      );

      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(order.createdAt).getTime() +
            returnWindowDays * 24 * 60 * 60 * 1000 -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      return {
        _id: oId,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        total: order.total,
        status: order.status,
        daysRemaining,
        returnWindowDays,
        items: availableItems.map((item: any) => ({
          productId: item.productId.toString(),
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        isFullyReturned: availableItems.length === 0,
      };
    });

    return successResponse({
      returnWindowDays,
      orders: formattedEligibleOrders.filter((o) => !o.isFullyReturned),
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/returns/eligible-orders error:", err);
    return errorResponse("Failed to fetch eligible orders", 500);
  }
}
