import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { requireAdmin, successResponse, errorResponse, validateRequest } from "@/lib/api-utils";
import { sendReturnStatusUpdateEmail } from "@/lib/mailer";
import type { SafeReturnRequest, ReturnStatus, ReturnReason } from "@/types";

export const dynamic = "force-dynamic";

const updateReturnStatusSchema = z.object({
  status: z
    .enum([
      "requested",
      "under_review",
      "approved",
      "rejected",
      "pickup",
      "received",
      "refund_processing",
      "refunded",
      "cancelled",
    ])
    .optional(),
  adminNotes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(1000).optional(),
  pickupDetails: z
    .object({
      courier: z.string().optional(),
      trackingNumber: z.string().optional(),
      scheduledDate: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  timelineNote: z.string().max(500).optional(),
});

function formatReturnRequest(ret: any): SafeReturnRequest {
  return {
    _id: ret._id.toString(),
    returnNumber: ret.returnNumber,
    orderId: ret.orderId?._id ? ret.orderId._id.toString() : ret.orderId.toString(),
    orderNumber: ret.orderNumber,
    userId: ret.userId?._id ? ret.userId._id.toString() : ret.userId.toString(),
    user: ret.userId?.name
      ? {
          name: ret.userId.name,
          email: ret.userId.email,
        }
      : undefined,
    items: ret.items.map((item: any) => ({
      productId: item.productId.toString(),
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      reason: item.reason as ReturnReason,
      reasonDetails: item.reasonDetails,
    })),
    refundAmount: ret.refundAmount,
    refundMethod: ret.refundMethod,
    refundStatus: ret.refundStatus,
    refundTransactionId: ret.refundTransactionId,
    status: ret.status as ReturnStatus,
    rejectionReason: ret.rejectionReason,
    customerNote: ret.customerNote,
    adminNotes: ret.adminNotes,
    images: ret.images || [],
    pickupDetails: ret.pickupDetails
      ? {
          courier: ret.pickupDetails.courier,
          trackingNumber: ret.pickupDetails.trackingNumber,
          scheduledDate: ret.pickupDetails.scheduledDate
            ? new Date(ret.pickupDetails.scheduledDate).toISOString()
            : undefined,
          address: ret.pickupDetails.address,
        }
      : undefined,
    timeline: (ret.timeline || []).map((t: any) => ({
      status: t.status as ReturnStatus,
      title: t.title,
      note: t.note,
      updatedBy: t.updatedBy,
      timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
    })),
    createdAt: ret.createdAt.toISOString(),
    updatedAt: ret.updatedAt.toISOString(),
  };
}

/**
 * GET /api/admin/returns/[returnId] — Admin fetch return detail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { returnId } = params;
    await connectDB();

    const query: Record<string, any> = {};
    if (returnId.startsWith("RET-")) {
      query.returnNumber = returnId;
    } else {
      query._id = returnId;
    }

    const returnDoc = await ReturnRequest.findOne(query)
      .populate("userId", "name email phone")
      .populate("orderId")
      .lean();

    if (!returnDoc) {
      return errorResponse("Return request not found", 404);
    }

    return successResponse(formatReturnRequest(returnDoc));
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("GET /api/admin/returns/[returnId] error:", err);
    return errorResponse("Failed to fetch return details", 500);
  }
}

/**
 * PUT /api/admin/returns/[returnId] — Admin update return status, notes, or pickup
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { returnId } = params;
    const body = await req.json();

    const validation = await validateRequest(updateReturnStatusSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { status, adminNotes, rejectionReason, pickupDetails, timelineNote } = validation.data;

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

    const oldStatus = returnDoc.status;
    let statusChanged = false;

    if (status && status !== oldStatus) {
      returnDoc.status = status;
      statusChanged = true;

      const titles: Record<string, string> = {
        under_review: "Return Under Review",
        approved: "Return Approved",
        rejected: "Return Rejected",
        pickup: "Pickup Scheduled",
        received: "Returned Package Received",
        refund_processing: "Refund Processing Initiated",
        refunded: "Refund Completed",
        cancelled: "Return Cancelled",
      };

      returnDoc.timeline.push({
        status,
        title: titles[status] || `Status updated to ${status}`,
        note: timelineNote || rejectionReason || (status === "approved" ? "Return request has been approved by admin." : undefined),
        updatedBy: "admin",
        timestamp: new Date(),
      });
    }

    if (adminNotes !== undefined) {
      returnDoc.adminNotes = adminNotes;
    }

    if (rejectionReason !== undefined) {
      returnDoc.rejectionReason = rejectionReason;
    }

    if (pickupDetails) {
      returnDoc.pickupDetails = {
        courier: pickupDetails.courier || returnDoc.pickupDetails?.courier,
        trackingNumber: pickupDetails.trackingNumber || returnDoc.pickupDetails?.trackingNumber,
        scheduledDate: pickupDetails.scheduledDate
          ? new Date(pickupDetails.scheduledDate)
          : returnDoc.pickupDetails?.scheduledDate,
        address: pickupDetails.address || returnDoc.pickupDetails?.address,
      };
    }

    await returnDoc.save();

    // If status changed, notify customer
    if (statusChanged && status) {
      const user = await User.findById(returnDoc.userId).lean();
      if (user) {
        await Notification.create({
          userId: returnDoc.userId,
          title: `Return #${returnDoc.returnNumber} Update`,
          body: `Your return request is now: ${status.replace("_", " ").toUpperCase()}`,
          type: "order_update",
          link: `/returns/${returnDoc.returnNumber}`,
          isRead: false,
        });

        try {
          await sendReturnStatusUpdateEmail(
            returnDoc,
            user.email,
            user.name,
            status,
            timelineNote || rejectionReason
          );
        } catch (mailErr) {
          console.error("[Admin Returns API] Failed to send customer status email:", mailErr);
        }
      }
    }

    return successResponse(formatReturnRequest(returnDoc), "Return request updated successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("PUT /api/admin/returns/[returnId] error:", err);
    return errorResponse("Failed to update return request", 500);
  }
}
