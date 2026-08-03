import mongoose from "mongoose";

export interface ICoupon {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minSubtotal: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
