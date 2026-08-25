import { Schema, model, models, Document, Types, Model } from "mongoose";
import type { ReturnStatus, ReturnReason } from "@/types";

export interface IReturnItem {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  reason: ReturnReason;
  reasonDetails?: string | undefined;
}

export interface IReturnTimelineEvent {
  status: ReturnStatus;
  title: string;
  note?: string | undefined;
  updatedBy?: "customer" | "admin" | "system" | undefined;
  timestamp: Date;
}

export interface IReturnRequest extends Document {
  returnNumber: string;
  orderId: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  items: IReturnItem[];
  refundAmount: number;
  refundMethod: "original_payment" | "store_credit" | "manual";
  refundStatus: "pending" | "processing" | "completed" | "failed";
  refundTransactionId?: string | undefined;
  status: ReturnStatus;
  rejectionReason?: string | undefined;
  customerNote?: string | undefined;
  adminNotes?: string | undefined;
  images: string[];
  pickupDetails?: {
    courier?: string | undefined;
    trackingNumber?: string | undefined;
    scheduledDate?: Date | undefined;
    address?: string | undefined;
  } | undefined;
  timeline: IReturnTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const returnItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    reason: {
      type: String,
      enum: [
        "defective",
        "wrong_item",
        "not_as_described",
        "quality_issue",
        "changed_mind",
        "size_fit",
        "other",
      ],
      required: true,
    },
    reasonDetails: { type: String },
  },
  { _id: false }
);

const returnTimelineEventSchema = new Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    note: { type: String },
    updatedBy: {
      type: String,
      enum: ["customer", "admin", "system"],
      default: "system",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const returnRequestSchema = new Schema<IReturnRequest>(
  {
    returnNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [returnItemSchema], required: true },
    refundAmount: { type: Number, required: true, min: 0 },
    refundMethod: {
      type: String,
      enum: ["original_payment", "store_credit", "manual"],
      default: "original_payment",
    },
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    refundTransactionId: { type: String },
    status: {
      type: String,
      enum: [
        "requested",
        "under_review",
        "approved",
        "rejected",
        "pickup",
        "received",
        "refund_processing",
        "refunded",
        "cancelled",
      ],
      default: "requested",
    },
    rejectionReason: { type: String },
    customerNote: { type: String },
    adminNotes: { type: String },
    images: { type: [String], default: [] },
    pickupDetails: {
      courier: { type: String },
      trackingNumber: { type: String },
      scheduledDate: { type: Date },
      address: { type: String },
    },
    timeline: { type: [returnTimelineEventSchema], default: [] },
  },
  { timestamps: true }
);

returnRequestSchema.index({ userId: 1, createdAt: -1 });
returnRequestSchema.index({ orderId: 1 });
returnRequestSchema.index({ returnNumber: 1 });
returnRequestSchema.index({ status: 1, createdAt: -1 });

// Auto-generate returnNumber if not set
returnRequestSchema.pre("validate", function (next) {
  if (!this.returnNumber) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "RET-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.returnNumber = code;
  }
  next();
});

export const ReturnRequest: Model<IReturnRequest> =
  models.ReturnRequest ||
  model<IReturnRequest>("ReturnRequest", returnRequestSchema);
