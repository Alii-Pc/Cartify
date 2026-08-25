import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Notification } from "@/models/Notification";
import { Setting } from "@/models/Setting";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
  parsePaginationParams,
} from "@/lib/api-utils";
import {
  sendReturnRequestConfirmationEmail,
  sendAdminReturnNotificationEmail,
} from "@/lib/mailer";
import type { SafeReturnRequest, ReturnStatus, ReturnReason } from "@/types";

export const dynamic = "force-dynamic";

const createReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        reason: z.enum([
          "defective",
          "wrong_item",
          "not_as_described",
          "quality_issue",
          "changed_mind",
          "size_fit",
          "other",
        ]),
        reasonDetails: z.string().optional(),
      })
    )
    .min(1, "At least one item must be selected for return"),
  customerNote: z.string().max(1000).optional(),
  refundMethod: z.enum(["original_payment", "store_credit", "manual"]).default("original_payment"),
  images: z.array(z.string().url()).default([]),
});

function formatReturnRequest(ret: any): SafeReturnRequest {
  return {
    _id: ret._id.toString(),
    returnNumber: ret.returnNumber,
    orderId: ret.orderId.toString(),
    orderNumber: ret.orderNumber,
    userId: ret.userId.toString(),
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
          scheduledDate: ret.pickupDetails.scheduledDate?.toISOString(),
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
 * GET /api/returns — List returns for current authenticated customer
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { page, limit, skip } = parsePaginationParams(req.nextUrl, 10, 50);
    const status = req.nextUrl.searchParams.get("status");

    await connectDB();

    const query: Record<string, any> = { userId: user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const total = await ReturnRequest.countDocuments(query);
    const returns = await ReturnRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      returns: returns.map(formatReturnRequest),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("GET /api/returns error:", err);
    return errorResponse("Failed to fetch return requests", 500);
  }
}

/**
 * POST /api/returns — Submit a new return request
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = await validateRequest(createReturnSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { orderId, items: requestedItems, customerNote, refundMethod, images } = validation.data;

    await connectDB();

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
    });

    if (!order) {
      return errorResponse("Order not found or unauthorized", 404);
    }

    // Verify order is delivered
    if (order.status !== "delivered") {
      return errorResponse(
        `Returns are only permitted for delivered orders. Current status: ${order.status}`,
        400
      );
    }

    // Check return window
    const returnSetting: any = await Setting.findOne({ key: "return_window_days" }).lean();
    const returnWindowDays = Number(returnSetting?.value) || 30;

    const returnCutoff = new Date(order.createdAt);
    returnCutoff.setDate(returnCutoff.getDate() + returnWindowDays);

    if (new Date() > returnCutoff) {
      return errorResponse(
        `The ${returnWindowDays}-day return window for this order has expired.`,
        400
      );
    }

    // Check for duplicate pending returns on these items
    const existingReturns = await ReturnRequest.find({
      orderId: order._id,
      status: { $nin: ["cancelled", "rejected"] },
    });

    const alreadyReturnedProductMap: Record<string, number> = {};
    for (const ret of existingReturns) {
      for (const item of ret.items) {
        const pId = item.productId.toString();
        alreadyReturnedProductMap[pId] = (alreadyReturnedProductMap[pId] || 0) + item.quantity;
      }
    }

    // Match requested items against order items
    const processedItems = [];
    let calculatedRefundTotal = 0;

    for (const reqItem of requestedItems) {
      const orderItem = order.items.find(
        (i: any) => i.productId.toString() === reqItem.productId
      );

      if (!orderItem) {
        return errorResponse(
          `Product ID ${reqItem.productId} is not part of Order #${order.orderNumber}`,
          400
        );
      }

      const previouslyReturned = alreadyReturnedProductMap[reqItem.productId] || 0;
      const remainingEligibleQty = orderItem.quantity - previouslyReturned;

      if (reqItem.quantity > remainingEligibleQty) {
        return errorResponse(
          `Cannot return ${reqItem.quantity} units of "${orderItem.name}". Only ${remainingEligibleQty} units are eligible.`,
          400
        );
      }

      const itemTotal = orderItem.price * reqItem.quantity;
      calculatedRefundTotal += itemTotal;

      processedItems.push({
        productId: orderItem.productId,
        name: orderItem.name,
        slug: orderItem.slug,
        image: orderItem.image,
        price: orderItem.price,
        quantity: reqItem.quantity,
        reason: reqItem.reason,
        reasonDetails: reqItem.reasonDetails || undefined,
      });
    }

    // Build pickup address default from shippingAddress
    const defaultPickupAddress = `${order.shippingAddress.addressLine1}${
      order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""
    }, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
      order.shippingAddress.zipCode
    }, ${order.shippingAddress.country}`;

    // Create the ReturnRequest document
    const newReturn = new ReturnRequest({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: user._id,
      items: processedItems,
      refundAmount: calculatedRefundTotal,
      refundMethod,
      refundStatus: "pending",
      status: "requested",
      customerNote: customerNote || undefined,
      images,
      pickupDetails: {
        address: defaultPickupAddress,
      },
      timeline: [
        {
          status: "requested",
          title: "Return Request Submitted",
          note: customerNote ? `Customer note: ${customerNote}` : "Return request initiated by customer.",
          updatedBy: "customer",
          timestamp: new Date(),
        },
      ],
    });

    await newReturn.save();

    // Create in-app notification for user
    await Notification.create({
      userId: user._id,
      title: `Return Request Submitted #${newReturn.returnNumber}`,
      body: `Your return request for Order #${order.orderNumber} ($${calculatedRefundTotal.toFixed(
        2
      )}) is under review.`,
      type: "order_update",
      link: `/returns/${newReturn.returnNumber}`,
      isRead: false,
    });

    // Send confirmation email to customer
    try {
      await sendReturnRequestConfirmationEmail(
        newReturn,
        order,
        user.email,
        user.name || order.shippingAddress.fullName
      );
    } catch (mailErr) {
      console.error("[Returns API] Failed to send customer return email:", mailErr);
    }

    // Send notification email to admin
    try {
      await sendAdminReturnNotificationEmail(
        newReturn,
        user.email,
        user.name || order.shippingAddress.fullName
      );
    } catch (adminMailErr) {
      console.error("[Returns API] Failed to send admin return email:", adminMailErr);
    }

    const formatted = formatReturnRequest(newReturn);
    return successResponse(formatted, "Return request submitted successfully", 201);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("POST /api/returns error:", err);
    return errorResponse("Failed to create return request", 500);
  }
}
