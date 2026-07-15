import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signupSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/mailer";
import type { ApiResponse, SafeUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email }).select(
      "+verificationEmailSentAt"
    );

    // Only block signup if an account with this email is already verified.
    // An unverified account (e.g. abandoned signup, lost email) shouldn't
    // stop someone from trying again — we just overwrite it below instead.
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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    let user;
    if (existingUser) {
      // Overwrite the abandoned unverified record with the new signup
      // attempt (new name/password trigger the pre-save hash hook below).
      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpires = verificationTokenExpires;
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        password,
        verificationToken,
        verificationTokenExpires,
      });
    }

    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      user.verificationEmailSentAt = new Date();
      await user.save();
    } catch (mailErr) {
      // Registration still succeeds even if the email fails to send —
      // the user can request a resend later. We just log it server-side.
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
        message: "Account created. Check your email to verify your account.",
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
