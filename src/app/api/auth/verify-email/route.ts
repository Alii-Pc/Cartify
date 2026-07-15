import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyOtpSchema } from "@/lib/validations/auth";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    await connectDB();

    const user = await User.findOne({
      email,
      verificationOtp: otp,
      verificationOtpExpires: { $gt: new Date() },
    }).select("+verificationOtp +verificationOtpExpires");

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Invalid or expired verification code. Please request a new one.",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
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
