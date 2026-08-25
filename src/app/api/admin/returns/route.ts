import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { User } from "@/models/User";
import { requireAdmin, successResponse, errorResponse, parsePaginationParams } from "@/lib/api-utils";
import type { SafeReturnRequest, ReturnStatus, ReturnReason } from "@/types";

export const dynamic = "force-dynamic";

function formatReturnRequest(ret: any): SafeReturnRequest {
  return {
    _id: ret._id.toString(),
    returnNumber: ret.returnNumber,
    orderId: ret.orderId.toString(),
    orderNumber: ret.orderNumber,
    userId: ret.userId?._id?.toString() || ret.userId?.toString(),
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
 * GET /api/admin/returns — List, filter, search, and aggregate all returns
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();
    const url = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(url, 10, 50);

    const q = url.searchParams.get("q")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const refundStatus = url.searchParams.get("refundStatus")?.trim() || "";
    const sort = url.searchParams.get("sort") === "oldest" ? 1 : -1;

    const query: Record<string, any> = {};

    if (q) {
      query.$or = [
        { returnNumber: { $regex: q, $options: "i" } },
        { orderNumber: { $regex: q, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (refundStatus && refundStatus !== "all") {
      query.refundStatus = refundStatus;
    }

    const [returns, total, counts] = await Promise.all([
      ReturnRequest.find(query)
        .sort({ createdAt: sort })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .lean(),
      ReturnRequest.countDocuments(query),
      ReturnRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts: Record<string, number> = {
      all: 0,
      requested: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      pickup: 0,
      received: 0,
      refund_processing: 0,
      refunded: 0,
      cancelled: 0,
    };

    let allTotal = 0;
    for (const c of counts) {
      if (statusCounts[c._id] !== undefined) {
        statusCounts[c._id] = c.count;
      }
      allTotal += c.count;
    }
    statusCounts.all = allTotal;

    return successResponse({
      returns: returns.map(formatReturnRequest),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts: statusCounts,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("GET /api/admin/returns error:", err);
    return errorResponse("Failed to fetch return requests", 500);
  }
}
