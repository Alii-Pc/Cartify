import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { Notification } from "@/models/Notification";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";
import { sendReturnStatusUpdateEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function PUT(
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

    const returnDoc = await ReturnRequest.findOne(query);
    if (!returnDoc) {
      return errorResponse("Return request not found", 404);
    }

    // Only allow cancelling if still in requested or under_review
    if (!["requested", "under_review"].includes(returnDoc.status)) {
      return errorResponse(
        `Cannot cancel return request in '${returnDoc.status}' status. Please contact support.`,
        400
      );
    }

    returnDoc.status = "cancelled";
    returnDoc.timeline.push({
      status: "cancelled",
      title: "Return Cancelled",
      note: "Cancelled by customer.",
      updatedBy: "customer",
      timestamp: new Date(),
    });

    await returnDoc.save();

    // Create in-app notification
    await Notification.create({
      userId: user._id,
      title: `Return Request Cancelled #${returnDoc.returnNumber}`,
      body: `Your return request for Order #${returnDoc.orderNumber} has been cancelled.`,
      type: "order_update",
      link: `/returns/${returnDoc.returnNumber}`,
      isRead: false,
    });

    try {
      await sendReturnStatusUpdateEmail(
        returnDoc,
        user.email,
        user.name,
        "cancelled",
        "Cancelled upon customer request."
      );
    } catch (mailErr) {
      console.error("[Cancel Return API] Failed to send cancel email:", mailErr);
    }

    return successResponse(returnDoc.toObject(), "Return request cancelled successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("PUT /api/returns/[returnId]/cancel error:", err);
    return errorResponse("Failed to cancel return request", 500);
  }
}
