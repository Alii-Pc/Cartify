import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/db";
import { authenticateUser, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    await connectDB();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return errorResponse("Invalid session ID", 404);
    }

    const order = await Order.findOne({ stripeSessionId: sessionId }).lean();
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse({
      order,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/checkout/verify error:", err);
    return errorResponse("Failed to verify checkout session", 500);
  }
}
