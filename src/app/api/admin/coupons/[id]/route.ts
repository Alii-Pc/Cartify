import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (body.code) {
      body.code = body.code.toUpperCase().trim();
    }

    const updated = await Coupon.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!updated) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Coupon code already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await Coupon.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Coupon deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
