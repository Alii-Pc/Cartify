import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateOrderTotals } from "@/lib/checkout-utils";
import { errorResponse, successResponse, validateRequest } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export const dynamic = "force-dynamic";

const validateCouponSchema = z.object({
  promoCode: z.string().trim().min(1, "Promo code is required"),
  subtotal: z.number().min(0, "Subtotal must be 0 or greater").default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = await validateRequest(validateCouponSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { promoCode, subtotal } = validation.data;
    
    let dbCoupon = null;
    if (promoCode) {
      await connectDB();
      dbCoupon = await Coupon.findOne({ code: promoCode.trim().toUpperCase(), isActive: true });
    }

    const totals = calculateOrderTotals(subtotal ?? 0, promoCode, dbCoupon);

    if (totals.couponError) {
      return errorResponse(totals.couponError, 400);
    }

    return successResponse(
      {
        valid: true,
        coupon: totals.appliedCoupon,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
      },
      `Promo code '${totals.appliedCoupon?.code}' applied successfully!`
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/coupons/validate error:", err);
    return errorResponse("Failed to validate coupon code.", 500);
  }
}
