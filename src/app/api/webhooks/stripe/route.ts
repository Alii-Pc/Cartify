import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Cart } from "@/models/Cart";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { sendOrderEmails } from "@/lib/mailer";
import { adminMessaging } from "@/lib/firebase-admin";

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

          // --- Notify Admins about the new order ---
          try {
            const admins = await User.find({ role: "admin" });
            const adminTokens = new Set<string>();
            const notificationPromises = [];

            for (const admin of admins) {
              // Collect tokens
              if (admin.fcmTokens && admin.fcmTokens.length > 0) {
                admin.fcmTokens.forEach((token: string) => adminTokens.add(token));
              }

              // Create in-app notification
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

            // Send Push Notification via Firebase
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
                    body: `Order #${order.orderNumber} has been paid.`,
                  },
                  tokens: chunk,
                });
              }
              console.log(`Sent new order push notification to ${tokensArray.length} admin devices.`);
            }
          } catch (notifErr) {
            console.error("Failed to send admin notifications for new order:", notifErr);
          }
          // --- End Admin Notifications ---

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
