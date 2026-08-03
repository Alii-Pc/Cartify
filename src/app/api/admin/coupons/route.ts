import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: coupons }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Ensure code is uppercase
    if (body.code) {
      body.code = body.code.toUpperCase().trim();
    }

    const newCoupon = await Coupon.create(body);
    return NextResponse.json({ success: true, data: newCoupon }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Coupon code already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
