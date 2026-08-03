import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Setting } from "@/models/Setting";

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.find({});
    
    // Convert to a key-value object
    const config: Record<string, any> = {};
    for (const setting of settings) {
      config[setting.key] = setting.value;
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
