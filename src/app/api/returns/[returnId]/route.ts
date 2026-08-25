import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Order } from "@/models/Order";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";
import type { SafeReturnRequest, ReturnStatus, ReturnReason } from "@/types";

export const dynamic = "force-dynamic";

function formatReturnRequest(ret: any): SafeReturnRequest {
  return {
    _id: ret._id.toString(),
    returnNumber: ret.returnNumber,
    orderId: ret.orderId.toString(),
    orderNumber: ret.orderNumber,
    userId: ret.userId.toString(),
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
 * GET /api/returns/[returnId] — Fetch details for a specific return
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { returnId } = params;

    await connectDB();

    const query: Record<string, any> = { userId: user._id };
    if (returnId.startsWith("RET-")) {
      query.returnNumber = returnId;
    } else {
      query._id = returnId;
    }

    const returnDoc = await ReturnRequest.findOne(query).lean();
    if (!returnDoc) {
      return errorResponse("Return request not found", 404);
    }

    const formatted = formatReturnRequest(returnDoc);
    return successResponse(formatted);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("GET /api/returns/[returnId] error:", err);
    return errorResponse("Failed to fetch return details", 500);
  }
}
