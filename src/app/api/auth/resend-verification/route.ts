import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import type { ApiResponse } from "@/types";

const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendVerificationSchema.safeParse(body);

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
      "+verificationToken +verificationTokenExpires +verificationEmailSentAt"
    );

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No account found with that email address." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "This email is already verified. You can log in." },
        { status: 400 }
      );
    }

    if (user.verificationEmailSentAt) {
      const secondsSinceLastEmail =
        (Date.now() - user.verificationEmailSentAt.getTime()) / 1000;

      if (secondsSinceLastEmail < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(
          RESEND_COOLDOWN_SECONDS - secondsSinceLastEmail
        );
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: `Please wait ${waitSeconds}s before requesting another verification email.`,
          },
          { status: 429 }
        );
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await sendVerificationEmail(user.email, user.name, verificationToken);

    user.verificationEmailSentAt = new Date();
    await user.save();

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Verification email sent. Please check your inbox.",
      data: null,
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
