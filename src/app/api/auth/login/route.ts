import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import type { ApiResponse, SafeUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = rateLimit(req);
    if (!rateLimitCheck.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const primaryMessage = parsed.error.issues.map((i) => i.message).join(". ") || "Please fill in all required fields correctly.";
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: primaryMessage, errors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    // Explicitly select password since the schema hides it by default
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isVerified && process.env.NODE_ENV === "production") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Please verify your email before logging in.",
        },
        { status: 403 }
      );
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    const safeUser: SafeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      hasGoogle: !!user.googleId,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json<ApiResponse<SafeUser>>({
      success: true,
      message: "Logged in successfully",
      data: safeUser,
    });

    // Store JWT in a secure, HTTP-only cookie — inaccessible to client-side JS
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
