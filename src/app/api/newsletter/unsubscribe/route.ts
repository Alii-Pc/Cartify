import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Newsletter.findOne({ email });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "This email is not subscribed." },
        { status: 404 }
      );
    }

    // Completely remove the subscriber from the database
    await Newsletter.deleteOne({ email });

    return NextResponse.json({ success: true, message: "Successfully unsubscribed." }, { status: 200 });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
