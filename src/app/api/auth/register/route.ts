import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signupSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import type { ApiResponse, SafeUser } from "@/types";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const primaryMessage = parsed.error.issues.map((i) => i.message).join(". ") || "Please fill in all required fields correctly.";
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: primaryMessage, errors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email }).select(
      "+verificationEmailSentAt"
    );

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (existingUser && existingUser.verificationEmailSentAt) {
      const secondsSinceLastEmail =
        (Date.now() - existingUser.verificationEmailSentAt.getTime()) / 1000;
      const COOLDOWN_SECONDS = 60;

      if (secondsSinceLastEmail < COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastEmail);
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: `Please wait ${waitSeconds}s before trying to sign up again.`,
          },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationOtp = otp;
      existingUser.verificationOtpExpires = otpExpires;
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        password,
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      });
    }

    user.verificationEmailSentAt = new Date();
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    const safeUser: SafeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<SafeUser>>(
      {
        success: true,
        message: "Account created. Check your email for the verification code.",
        data: safeUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
