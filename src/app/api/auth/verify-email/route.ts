import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Verification token is missing" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "This verification link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Email verified successfully. You can now log in.",
      data: null,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
