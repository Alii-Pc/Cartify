export interface CouponDetail {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; // percentage (e.g. 10) or fixed amount (e.g. 20)
  minSubtotal?: number;
  description: string;
}

export const VALID_COUPONS: Record<string, CouponDetail> = {
  WELCOME10: {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% off your entire order",
  },
  CARTIFY20: {
    code: "CARTIFY20",
    type: "fixed",
    value: 20,
    minSubtotal: 50,
    description: "$20 off orders over $50",
  },
  FREESHIP: {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    description: "Free shipping on any order",
  },
  SUMMER15: {
    code: "SUMMER15",
    type: "percentage",
    value: 15,
    minSubtotal: 75,
    description: "15% off orders over $75",
  },
};

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  taxableAmount: number;
  tax: number;
  total: number;
  appliedCoupon?: CouponDetail | null;
  couponError?: string | null;
}

/**
 * Calculates order subtotal, promo discount, shipping fee, tax, and grand total.
 */
export function calculateOrderTotals(subtotal: number, promoCode?: string | null): OrderTotals {
  const cleanSubtotal = Math.max(0, subtotal);
  let discount = 0;
  let appliedCoupon: CouponDetail | null = null;
  let couponError: string | null = null;

  if (promoCode && promoCode.trim()) {
    const cleanCode = promoCode.trim().toUpperCase();
    const coupon = VALID_COUPONS[cleanCode];

    if (coupon) {
      if (coupon.minSubtotal && cleanSubtotal < coupon.minSubtotal) {
        couponError = `Coupon '${cleanCode}' requires a minimum subtotal of $${coupon.minSubtotal.toFixed(2)}.`;
      } else {
        appliedCoupon = coupon;
        if (coupon.type === "percentage") {
          discount = cleanSubtotal * (coupon.value / 100);
        } else if (coupon.type === "fixed") {
          discount = Math.min(cleanSubtotal, coupon.value);
        }
      }
    } else {
      couponError = `Invalid promo code '${cleanCode}'.`;
    }
  }

  // Shipping logic: free if subtotal >= $50 or FREESHIP coupon applied, otherwise $5.00
  const isFreeShipping = cleanSubtotal >= 50 || appliedCoupon?.type === "free_shipping";
  const shipping = cleanSubtotal > 0 ? (isFreeShipping ? 0 : 5.0) : 0;

  // Tax calculation (8% on net taxable amount)
  const taxableAmount = Math.max(0, cleanSubtotal - discount);
  const tax = taxableAmount * 0.08;

  // Grand total
  const total = Math.max(0, taxableAmount + shipping + tax);

  return {
    subtotal: cleanSubtotal,
    discount,
    shipping,
    taxableAmount,
    tax,
    total,
    appliedCoupon,
    couponError,
  };
}
