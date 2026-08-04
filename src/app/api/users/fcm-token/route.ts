import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!tokenCookie) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(tokenCookie);
    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "FCM token registered successfully",
      data: null,
    });
  } catch (error) {
    console.error("FCM Token Registration Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
