import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: params.id,
      type: "promotion",
      userId: null,
    });

    if (!notification) {
      return errorResponse("Promotion not found", 404);
    }

    return successResponse(null, "Promotion deleted successfully");
  } catch (error) {
    console.error("Delete Promotion Error:", error);
    return errorResponse("Failed to delete promotion", 500);
  }
}
