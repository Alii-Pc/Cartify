import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Cart } from "@/models/Cart";
import { sendOrderEmails } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let event;
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    await connectDB();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (orderId) {
        const order = await Order.findById(orderId);
        
        if (order && order.paymentStatus !== "paid") {
          order.status = "confirmed";
          order.paymentStatus = "paid";
          order.paidAt = new Date();
          order.stripePaymentIntentId = session.payment_intent as string;
          order.invoiceNumber = `INV-${order.orderNumber}`;

          await order.save();

          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity },
            });
          }

          if (userId) {
            await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
          }

          try {
            await sendOrderEmails(order);
          } catch (mailErr) {
            console.error("Failed to send order emails from webhook:", mailErr);
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
                data: order.toObject(),
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
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      
      if (orderId) {
        const order = await Order.findOne({ stripeSessionId: session.id });
        if (order) {
          order.status = "cancelled";
          order.paymentStatus = "failed";
          await order.save();
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
