import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { adminMessaging } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const { title, body } = await req.json();

    if (!title || !body) {
      return errorResponse("Title and body are required", 400);
    }

    if (!adminMessaging) {
      return errorResponse("Firebase Admin Messaging is not initialized", 500);
    }

    await connectDB();
    
    // Find all users who have an FCM token
    const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
    
    // Extract all unique tokens
    const allTokens = new Set<string>();
    users.forEach(user => {
      user.fcmTokens?.forEach(token => allTokens.add(token));
    });

    const tokensArray = Array.from(allTokens);
    if (tokensArray.length === 0) {
      return errorResponse("No users found with valid FCM tokens", 404);
    }

    // Firebase sendEachForMulticast accepts up to 500 tokens per request
    const chunks = [];
    for (let i = 0; i < tokensArray.length; i += 500) {
      chunks.push(tokensArray.slice(i, i + 500));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const chunk of chunks) {
      const response = await adminMessaging.sendEachForMulticast({
        notification: { title, body },
        tokens: chunk
      });
      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    // Save global notification to database
    await import("@/models/Notification").then(({ Notification }) => {
      return Notification.create({
        userId: null,
        title,
        body,
        type: "promotion",
        isRead: false,
        readBy: [],
        link: "/#deals" // Default link for promotions
      });
    }).catch(console.error);

    return successResponse({
      sent: successCount,
      failed: failureCount
    }, "Promotional broadcast sent successfully");
  } catch (error: any) {
    console.error("Promotional Broadcast Error:", error);
    return errorResponse("Failed to send promotional broadcast", 500);
  }
}
