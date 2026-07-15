import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { ApiResponse, SafeUser } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid or expired session" },
        { status: 401 }
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

    const safeUser: SafeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<SafeUser>>({
      success: true,
      data: safeUser,
    });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
