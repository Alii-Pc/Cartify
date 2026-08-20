import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { OAuth2Client } from "google-auth-library";
import type { ApiResponse, SafeUser } from "@/types";

export const dynamic = "force-dynamic";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = rateLimit(req);
    if (!rateLimitCheck.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const { credential, action } = await req.json();

    if (!credential) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Missing Google credential" },
        { status: 400 }
      );
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Invalid Google token" },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

    if (!email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No email associated with this Google account" },
        { status: 400 }
      );
    }

    await connectDB();

    if (action === "link") {
      // Handle account linking
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!token) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Not authenticated" },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Invalid session" },
          { status: 401 }
        );
      }

      const existingUser = await User.findById(decoded.userId);
      if (!existingUser) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Check if this Google account is already linked to another user
      const googleUser = await User.findOne({ googleId });
      if (googleUser && googleUser._id.toString() !== existingUser._id.toString()) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "This Google account is already linked to another user." },
          { status: 400 }
        );
      }

      existingUser.googleId = googleId;
      if (!existingUser.avatar && avatar) {
        existingUser.avatar = avatar;
      }
      await existingUser.save();

      return NextResponse.json<ApiResponse<null>>({
        success: true,
        message: "Google account linked successfully",
        data: null
      });
    }

    // Handle Login/Register
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // User exists. Update googleId and avatar if missing
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (email_verified && !user.isVerified) {
        user.isVerified = true;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        isVerified: true, // Google verifies emails
        role: "user",
      });
    }

    const jwtToken = signToken({ userId: user._id.toString(), email: user.email });

    const safeUser: SafeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      hasGoogle: !!user.googleId,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json<ApiResponse<SafeUser>>({
      success: true,
      message: "Logged in successfully with Google",
      data: safeUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("Google Auth error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Google authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
