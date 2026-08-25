import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderNumber = url.searchParams.get("orderNumber")?.trim();
    const trackingNumber = url.searchParams.get("trackingNumber")?.trim();
    const q = url.searchParams.get("q")?.trim();

    const searchTerm = orderNumber || trackingNumber || q;

    if (!searchTerm) {
      return errorResponse("Please provide an order number or tracking number", 400);
    }

    await connectDB();

    // Query by orderNumber or trackingNumber
    const query: Record<string, any> = {
      $or: [
        { orderNumber: { $regex: `^${searchTerm}$`, $options: "i" } },
        { trackingNumber: { $regex: `^${searchTerm}$`, $options: "i" } },
      ],
    };

    const order = await Order.findOne(query).lean();

    if (!order) {
      return errorResponse("No shipment found for the provided reference number", 404);
    }

    // Default tracking milestones if trackingHistory is empty
    const defaultMilestones = [
      {
        status: "pending",
        title: "Order Placed",
        description: "Your order details have been securely recorded in our system.",
        location: "Cartify Fulfillment Center",
        timestamp: order.createdAt,
      },
    ];

    if (order.status !== "pending") {
      defaultMilestones.push({
        status: "confirmed",
        title: "Order Confirmed",
        description: "Payment verified and inventory allocated for processing.",
        location: "Cartify Processing Unit",
        timestamp: order.paidAt || order.createdAt,
      });
    }

    if (["processing", "packed", "shipped", "out_for_delivery", "delivered"].includes(order.status)) {
      defaultMilestones.push({
        status: "processing",
        title: "Processing & Quality Check",
        description: "Items are being inspected, prepared, and packaged.",
        location: "Central Warehouse Hub",
        timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 2),
      });
    }

    if (["packed", "shipped", "out_for_delivery", "delivered"].includes(order.status)) {
      defaultMilestones.push({
        status: "packed",
        title: "Package Ready for Dispatch",
        description: "Package sealed with shipping labels attached.",
        location: "Outbound Logistics Facility",
        timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 5),
      });
    }

    if (["shipped", "out_for_delivery", "delivered"].includes(order.status)) {
      defaultMilestones.push({
        status: "shipped",
        title: "Dispatched with Carrier",
        description: `Handed over to ${order.courier || "courier partner"} for transit.`,
        location: "Sorting Hub",
        timestamp: order.shippedAt || new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 12),
      });
    }

    if (["out_for_delivery", "delivered"].includes(order.status)) {
      defaultMilestones.push({
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Courier driver is en route to the delivery destination.",
        location: `${order.shippingAddress?.city || "Local"} Delivery Center`,
        timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 36),
      });
    }

    if (order.status === "delivered") {
      defaultMilestones.push({
        status: "delivered",
        title: "Delivered Successfully",
        description: "Package delivered to customer address.",
        location: `${order.shippingAddress?.city || "Destination"}, ${order.shippingAddress?.state || ""}`,
        timestamp: order.deliveredAt || new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 48),
      });
    }

    // Use order.trackingHistory if populated, otherwise use synthesized defaultMilestones
    const history =
      order.trackingHistory && order.trackingHistory.length > 0
        ? order.trackingHistory.map((h: any) => ({
            status: h.status,
            title: h.title,
            description: h.description,
            location: h.location,
            timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : new Date().toISOString(),
          }))
        : defaultMilestones.map((m) => ({
            status: m.status,
            title: m.title,
            description: m.description,
            location: m.location,
            timestamp: new Date(m.timestamp).toISOString(),
          }));

    const trackingData = {
      orderNumber: order.orderNumber,
      status: order.status,
      courier: order.courier || "Standard Carrier",
      trackingNumber: order.trackingNumber || `TRK-${order.orderNumber.replace("CFY-", "")}`,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString()
        : new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 4).toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      destination: {
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        country: order.shippingAddress?.country,
      },
      itemCount: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
      items: order.items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
      })) || [],
      history,
    };

    return successResponse(trackingData, "Tracking information retrieved");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/tracking error:", err);
    return errorResponse("Failed to fetch tracking details", 500);
  }
}
