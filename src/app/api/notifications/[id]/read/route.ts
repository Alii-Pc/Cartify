import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) return errorResponse("Not authenticated", 401);

    await connectDB();
    const notification = await Notification.findById(params.id);
    
    if (!notification) {
      return errorResponse("Notification not found", 404);
    }

    // If targeted, verify it belongs to user
    if (notification.userId) {
      if (notification.userId.toString() !== user._id.toString()) {
        return errorResponse("Forbidden", 403);
      }
      notification.isRead = true;
    } 
    // If broadcast, add user to readBy array
    else {
      if (!notification.readBy.includes(user._id)) {
        notification.readBy.push(user._id);
      }
    }

    await notification.save();
    return successResponse(null, "Notification marked as read");
  } catch (error) {
    console.error("Mark notification read error:", error);
    return errorResponse("Failed to mark notification as read", 500);
  }
}
