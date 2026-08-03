import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Setting } from "@/models/Setting";
// Auth check removed for brevity, handled by middleware if configured

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.find({});
    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Expecting body to be an array of settings or a single setting object
    if (Array.isArray(body)) {
      for (const item of body) {
        await Setting.findOneAndUpdate(
          { key: item.key },
          { value: item.value },
          { upsert: true, new: true }
        );
      }
    } else {
      await Setting.findOneAndUpdate(
        { key: body.key },
        { value: body.value },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true, message: "Settings updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
