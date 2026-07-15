import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/auth";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Reset token is missing" },
        { status: 400 }
      );
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordTokenExpires");

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "This reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    user.password = password; // pre-save hook re-hashes automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Password reset successfully. You can now log in.",
      data: null,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
