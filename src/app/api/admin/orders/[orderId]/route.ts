import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { adminMessaging } from "@/lib/firebase-admin";
import { sendTrackingUpdateEmail } from "@/lib/mailer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const trackingEventInputSchema = z.object({
  status: z.string().optional(),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  timestamp: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  courier: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  addTrackingEvent: trackingEventInputSchema.optional(),
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
      return errorResponse("Validation error", 400, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    await connectDB();

    const order = await Order.findById(params.orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const {
      status,
      paymentStatus,
      courier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      addTrackingEvent,
    } = parsed.data;

    let statusChanged = false;
    let latestEvent: { status: string; title: string; description?: string; location?: string; timestamp?: Date } | null = null;

    if (status && status !== order.status) {
      order.status = status;
      statusChanged = true;
      if (status === "shipped" && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (status === "delivered" && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (courier !== undefined) order.courier = courier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (estimatedDelivery !== undefined) {
      order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : undefined;
    }

    // Append manual tracking event if provided
    if (addTrackingEvent) {
      const newEvent = {
        status: addTrackingEvent.status || order.status,
        title: addTrackingEvent.title,
        description: addTrackingEvent.description,
        location: addTrackingEvent.location,
        timestamp: addTrackingEvent.timestamp ? new Date(addTrackingEvent.timestamp) : new Date(),
      };
      if (!order.trackingHistory) {
        order.trackingHistory = [];
      }
      order.trackingHistory.push(newEvent as any);
      latestEvent = newEvent;
    } else if (statusChanged && status) {
      // Auto-append status milestone if none manually supplied
      const defaultTitles: Record<string, string> = {
        confirmed: "Order Confirmed",
        processing: "Processing & Quality Check",
        packed: "Package Ready for Courier Dispatch",
        shipped: "Package Picked Up by Courier",
        out_for_delivery: "Package Out for Delivery",
        delivered: "Delivered to Recipient",
        cancelled: "Order Cancelled",
      };

      const defaultLocations: Record<string, string> = {
        confirmed: "Cartify Processing Hub",
        processing: "Main Fulfillment Center",
        packed: "Outbound Logistics Dock",
        shipped: `${courier || order.courier || "Carrier"} Transit Hub`,
        out_for_delivery: `${order.shippingAddress?.city || "Local"} Distribution Facility`,
        delivered: `${order.shippingAddress?.city || "Customer Address"}`,
        cancelled: "Order Support Office",
      };

      const title = defaultTitles[status];
      if (title) {
        const autoEvent = {
          status,
          title,
          description: `Order status transitioned to ${status.replace("_", " ").toUpperCase()}`,
          location: defaultLocations[status] || "Fulfillment Hub",
          timestamp: new Date(),
        };
        if (!order.trackingHistory) {
          order.trackingHistory = [];
        }
        order.trackingHistory.push(autoEvent as any);
        latestEvent = autoEvent;
      }
    }

    await order.save();

    // User notification & email
    if (statusChanged || latestEvent) {
      try {
        const user = await User.findById(order.userId).lean();

        // Save In-App Notification
        await Notification.create({
          userId: order.userId,
          title: `Order Update #${order.orderNumber}`,
          body: latestEvent?.title || `Your order status is now: ${order.status.replace("_", " ").toUpperCase()}`,
          type: "order_update",
          isRead: false,
          readBy: [],
          link: `/orders/${order.orderNumber}`,
        });

        // Send FCM if configured
        if (adminMessaging && user && user.fcmTokens && user.fcmTokens.length > 0) {
          const message = {
            notification: {
              title: `Order #${order.orderNumber}: ${latestEvent?.title || order.status.toUpperCase()}`,
              body: latestEvent?.description || `Status is now: ${order.status.toUpperCase()}`,
            },
            tokens: user.fcmTokens,
          };
          await adminMessaging.sendEachForMulticast(message);
        }

        // Send Email
        if (latestEvent && user?.email) {
          await sendTrackingUpdateEmail(order, {
            status: latestEvent.status,
            title: latestEvent.title,
            description: latestEvent.description,
            location: latestEvent.location,
          });
        }
      } catch (notifyErr) {
        console.error("Failed to dispatch order notification/email:", notifyErr);
      }
    }

    return successResponse(order.toObject(), "Order updated successfully");
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin update order error:", error);
    return errorResponse("Failed to update order", 500);
  }
}
