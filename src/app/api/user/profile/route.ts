import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(req: NextRequest) {
  try {
    const token = cookies().get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Name must be at least 2 characters" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.name = name.trim();
    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}
