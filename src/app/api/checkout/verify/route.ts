import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/db";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    await connectDB();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return errorResponse("Invalid session ID", 404);
    }

    let order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Fallback: update order if webhook hasn't processed it yet
    if (session.payment_status === "paid" && order.paymentStatus !== "paid") {
      order.status = "confirmed";
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      order.stripePaymentIntentId = session.payment_intent as string;
      order.invoiceNumber = `INV-${order.orderNumber}`;

      await order.save();

      // Decrement stock
      const { Product } = await import("@/models/Product");
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

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

      // Emit real-time events
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // Notify user of order update
        fetch(`${baseUrl}/api/internal/socket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "order_updated",
            room: `order_${order._id.toString()}`,
            data: order.toObject ? order.toObject() : order,
          }),
        }).catch(() => {});

        // Notify admin of new paid order
        fetch(`${baseUrl}/api/internal/socket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "admin_notification",
            room: "admin",
            data: {
              title: "New Order Paid",
              message: `Order ${order.orderNumber} has been paid successfully.`,
              time: new Date().toISOString(),
            },
          }),
        }).catch(() => {});
      } catch (e) {
        // ignore
      }
    }

    return successResponse({
      order: order.toObject ? order.toObject() : order,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/checkout/verify error:", err);
    return errorResponse("Failed to verify checkout session", 500);
  }
}
