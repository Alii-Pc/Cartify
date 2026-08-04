import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";
import type { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    await connectDB();

    // Fetch targeted notifications OR global broadcasts
    const notifications = await Notification.find({
      $or: [
        { userId: user._id },
        { userId: null } // Global broadcasts
      ]
    }).sort({ createdAt: -1 }).limit(50);

    // Format the notifications to determine if they are read by the current user
    const formattedNotifications = notifications.map(notif => {
      let isRead = false;
      if (notif.userId) {
        isRead = notif.isRead;
      } else {
        isRead = notif.readBy.includes(user._id);
      }

      return {
        _id: notif._id,
        title: notif.title,
        body: notif.body,
        type: notif.type,
        isRead,
        link: notif.link,
        createdAt: notif.createdAt,
      };
    });

    return successResponse(formattedNotifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return errorResponse("Failed to fetch notifications", 500);
  }
}
