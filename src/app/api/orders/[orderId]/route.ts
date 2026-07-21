import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import {
  authenticateUser,
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import type { SafeOrder } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Helper to format a lean order document into a SafeOrder
 */
function formatOrder(order: any): SafeOrder {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    userId: order.userId.toString(),
    items: order.items.map((item: any) => ({
      productId: item.productId.toString(),
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      email: order.shippingAddress.email,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zipCode: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    },
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    status: order.status,
    promoCode: order.promoCode,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * GET /api/orders/[orderId] — Fetch a specific order
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { orderId } = params;

    await connectDB();

    // Support finding by either _id or orderNumber
    const query: Record<string, any> = { userId: user._id };
    if (orderId.startsWith("CFY-")) {
      query.orderNumber = orderId;
    } else {
      query._id = orderId;
    }

    const order = await Order.findOne(query).lean();
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const formattedOrder = formatOrder(order);

    return successResponse(formattedOrder);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/orders/[orderId] error:", err);
    return errorResponse("Failed to fetch order details", 500);
  }
}
