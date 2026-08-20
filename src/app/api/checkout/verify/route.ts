import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/db";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { adminMessaging } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let user = await authenticateUser(req);
    const sessionId = req.nextUrl.searchParams.get("session_id");
    const orderId = req.nextUrl.searchParams.get("order_id");

    if (!sessionId && !orderId) {
      return errorResponse("Session ID or Order ID is required", 400);
    }

    await connectDB();

    let order;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return errorResponse("Invalid session ID", 404);
      }

      order = await Order.findOne({ stripeSessionId: sessionId });
      if (!order) {
        return errorResponse("Order not found", 404);
      }

      if (!user) {
        user = await User.findById(order.userId);
      }

      // Fallback: update order if webhook hasn't processed it yet
      if (session.payment_status === "paid" && order.paymentStatus !== "paid") {
        order.status = "confirmed";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        order.stripePaymentIntentId = session.payment_intent as string;
        order.invoiceNumber = `INV-${order.orderNumber}`;

        await order.save();
        if (user) {
          await processOrderSuccess(order, user);
        }
      }
    } else if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
        return errorResponse("Order not found", 404);
      }

      if (!user) {
        user = await User.findById(order.userId);
      }

      // Verify that it's a COD order and belongs to the user
      if (order.paymentMethod !== "cod" || (user && order.userId.toString() !== user._id.toString())) {
        return errorResponse("Invalid order verification", 403);
      }

      // If it's a new COD order (pending), process if not already invoiced
      if (!order.invoiceNumber) {
        order.invoiceNumber = `INV-${order.orderNumber}`;
        await order.save();
        if (user) {
          await processOrderSuccess(order, user);
        }
      }
    }

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse({
      order: (order as any).toObject ? (order as any).toObject() : order,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/checkout/verify error:", err);
    return errorResponse("Failed to verify checkout session", 500);
  }
}

async function processOrderSuccess(order: any, user: any) {
  // Clear cart
  const { Cart } = await import("@/models/Cart");
  await Cart.findOneAndUpdate({ userId: user._id }, { $set: { items: [] } });

  // Send emails
  try {
    const { sendOrderEmails } = await import("@/lib/mailer");
    await sendOrderEmails(order);
  } catch (mailErr) {
    console.error("Failed to send order emails from verify:", mailErr);
  }

  // --- Notify Admins about the new order ---
  try {
    const admins = await User.find({ role: "admin" });
    const adminTokens = new Set<string>();
    const notificationPromises = [];

    for (const admin of admins) {
      if (admin.fcmTokens && admin.fcmTokens.length > 0) {
        admin.fcmTokens.forEach((token: string) => adminTokens.add(token));
      }

      notificationPromises.push(
        Notification.create({
          userId: admin._id,
          title: `New Order Received! 🛍️`,
          body: `Order #${order.orderNumber} has been placed for $${order.total.toFixed(2)}.`,
          type: "system",
          isRead: false,
          readBy: [],
          link: `/admin/orders/${order._id}`
        })
      );
    }

    await Promise.all(notificationPromises);

    const tokensArray = Array.from(adminTokens);
    if (tokensArray.length > 0 && adminMessaging) {
      const chunks = [];
      for (let i = 0; i < tokensArray.length; i += 500) {
        chunks.push(tokensArray.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        await adminMessaging.sendEachForMulticast({
          notification: {
            title: `New Order Received! 🛍️`,
            body: order.paymentMethod === "cod" ? `Order #${order.orderNumber} (Cash on Delivery).` : `Order #${order.orderNumber} has been paid.`,
          },
          tokens: chunk,
        });
      }
      console.log(`Sent new order push notification to ${tokensArray.length} admin devices from verify route.`);
    }
  } catch (notifErr) {
    console.error("Failed to send admin notifications for new order:", notifErr);
  }
}
