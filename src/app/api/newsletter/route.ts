import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Newsletter.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "You are already subscribed to our newsletter!" },
        { status: 400 }
      );
    }

    await Newsletter.create({ email });

    // Optional: Emit a socket event to admin dashboard
    try {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/internal/socket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "admin_notification",
          room: "admin",
          data: {
            title: "New Subscriber",
            message: `${email} just subscribed to the newsletter.`,
            time: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch (e) {
      // ignore socket failure
    }

    return NextResponse.json({ success: true, message: "Successfully subscribed!" }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
