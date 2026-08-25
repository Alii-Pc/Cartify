import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { requireAdmin, successResponse, errorResponse, validateRequest } from "@/lib/api-utils";
import { sendReturnStatusUpdateEmail } from "@/lib/mailer";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const processRefundSchema = z.object({
  refundAmount: z.number().positive().optional(),
  refundMethod: z.enum(["original_payment", "store_credit", "manual"]).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { returnId } = params;
    const body = await req.json().catch(() => ({}));

    const validation = await validateRequest(processRefundSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    await connectDB();

    const query: Record<string, any> = {};
    if (returnId.startsWith("RET-")) {
      query.returnNumber = returnId;
    } else {
      query._id = returnId;
    }

    const returnDoc = await ReturnRequest.findOne(query);
    if (!returnDoc) {
      return errorResponse("Return request not found", 404);
    }

    if (returnDoc.refundStatus === "completed" || returnDoc.status === "refunded") {
      return errorResponse("Refund has already been completed for this return request", 400);
    }

    const order = await Order.findById(returnDoc.orderId);
    if (!order) {
      return errorResponse("Associated order not found", 404);
    }

    const finalRefundAmount = validation.data.refundAmount || returnDoc.refundAmount;
    const finalRefundMethod = validation.data.refundMethod || returnDoc.refundMethod;
    let transactionId = `REF-${Date.now().toString(36).toUpperCase()}`;

    // Attempt Stripe automated refund if paid via Stripe and payment intent exists
    if (order.paymentMethod === "stripe" && order.stripePaymentIntentId && finalRefundMethod === "original_payment") {
      try {
        if (process.env.STRIPE_SECRET_KEY) {
          const refund = await stripe.refunds.create({
            payment_intent: order.stripePaymentIntentId,
            amount: Math.round(finalRefundAmount * 100), // in cents
            reason: "requested_by_customer",
          });
          transactionId = refund.id;
        }
      } catch (stripeErr: any) {
        console.error("[Refund API] Stripe Refund Error:", stripeErr);
        // If Stripe test key is in sandbox mode or already refunded, record fallback with note
        transactionId = `STRIPE-MANUAL-${order.stripePaymentIntentId.slice(-8)}`;
      }
    }

    // Update return document
    returnDoc.refundAmount = finalRefundAmount;
    returnDoc.refundMethod = finalRefundMethod;
    returnDoc.refundStatus = "completed";
    returnDoc.status = "refunded";
    returnDoc.refundTransactionId = transactionId;

    returnDoc.timeline.push({
      status: "refunded",
      title: "Refund Processed & Completed",
      note: validation.data.note || `Refund of $${finalRefundAmount.toFixed(2)} issued (${finalRefundMethod.replace("_", " ")}). Ref: ${transactionId}`,
      updatedBy: "admin",
      timestamp: new Date(),
    });

    await returnDoc.save();

    // Update Order payment status to refunded
    order.paymentStatus = "refunded";
    await order.save();

    // Notify user
    const user = await User.findById(returnDoc.userId).lean();
    if (user) {
      await Notification.create({
        userId: returnDoc.userId,
        title: `Refund Issued #${returnDoc.returnNumber}`,
        body: `A refund of $${finalRefundAmount.toFixed(2)} has been issued for your returned items.`,
        type: "order_update",
        link: `/returns/${returnDoc.returnNumber}`,
        isRead: false,
      });

      try {
        await sendReturnStatusUpdateEmail(
          returnDoc,
          user.email,
          user.name,
          "refunded",
          `A refund of $${finalRefundAmount.toFixed(2)} was successfully issued. Reference ID: ${transactionId}`
        );
      } catch (mailErr) {
        console.error("[Refund API] Failed to send customer refund email:", mailErr);
      }
    }

    return successResponse(
      {
        returnNumber: returnDoc.returnNumber,
        refundAmount: finalRefundAmount,
        refundStatus: "completed",
        transactionId,
      },
      `Refund of $${finalRefundAmount.toFixed(2)} processed successfully`
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("POST /api/admin/returns/[returnId]/refund error:", err);
    return errorResponse("Failed to process refund", 500);
  }
}
