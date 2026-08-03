export interface CouponDetail {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; // percentage (e.g. 10) or fixed amount (e.g. 20)
  minSubtotal?: number;
  description: string;
  isActive?: boolean;
}

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
export function calculateOrderTotals(subtotal: number, promoCode?: string | null, dbCoupon?: CouponDetail | null): OrderTotals {
  const cleanSubtotal = Math.max(0, subtotal);
  let discount = 0;
  let appliedCoupon: CouponDetail | null = null;
  let couponError: string | null = null;

  if (promoCode && promoCode.trim()) {
    const cleanCode = promoCode.trim().toUpperCase();

    if (dbCoupon && dbCoupon.code === cleanCode) {
      if (dbCoupon.minSubtotal && cleanSubtotal < dbCoupon.minSubtotal) {
        couponError = `Coupon '${cleanCode}' requires a minimum subtotal of $${dbCoupon.minSubtotal.toFixed(2)}.`;
      } else {
        appliedCoupon = dbCoupon;
        if (dbCoupon.type === "percentage") {
          discount = cleanSubtotal * (dbCoupon.value / 100);
        } else if (dbCoupon.type === "fixed") {
          discount = Math.min(cleanSubtotal, dbCoupon.value);
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
