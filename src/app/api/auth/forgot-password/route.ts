import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendResetPasswordEmail } from "@/lib/mailer";
import type { ApiResponse } from "@/types";

const RESET_COOLDOWN_SECONDS = 60;

// Always responds with the same generic message whether or not the email
// exists in the database — this prevents attackers from using this endpoint
// to discover which emails have Cartify accounts.
const GENERIC_MESSAGE =
  "If an account exists with that email, a password reset link has been sent.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+resetPasswordEmailSentAt"
    );

    if (!user) {
      // Don't reveal that this email has no account — respond as if it worked.
      return NextResponse.json<ApiResponse<null>>({
        success: true,
        message: GENERIC_MESSAGE,
        data: null,
      });
    }

    if (user.resetPasswordEmailSentAt) {
      const secondsSinceLastEmail =
        (Date.now() - user.resetPasswordEmailSentAt.getTime()) / 1000;

      if (secondsSinceLastEmail < RESET_COOLDOWN_SECONDS) {
        // Still respond with the generic message so we don't leak that the
        // account exists via a different response shape/timing.
        return NextResponse.json<ApiResponse<null>>({
          success: true,
          message: GENERIC_MESSAGE,
          data: null,
        });
      }
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    try {
      await sendResetPasswordEmail(user.email, user.name, resetToken);
      user.resetPasswordEmailSentAt = new Date();
    } catch (mailErr) {
      console.error("Failed to send reset password email:", mailErr);
    }

    await user.save();

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: GENERIC_MESSAGE,
      data: null,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
