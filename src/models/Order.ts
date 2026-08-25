import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string | undefined;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "stripe" | "cod";

export interface ITrackingEvent {
  status: string;
  title: string;
  description?: string | undefined;
  location?: string | undefined;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  promoCode?: string | undefined;
  // Payment fields
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripeSessionId?: string | undefined;
  stripePaymentIntentId?: string | undefined;
  paidAt?: Date | undefined;
  invoiceNumber?: string | undefined;
  // Parcel & Tracking fields
  courier?: string | undefined;
  trackingNumber?: string | undefined;
  trackingUrl?: string | undefined;
  estimatedDelivery?: Date | undefined;
  shippedAt?: Date | undefined;
  deliveredAt?: Date | undefined;
  trackingHistory?: ITrackingEvent[] | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const trackingEventSchema = new Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    promoCode: { type: String },
    // Payment fields
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      default: "stripe",
    },
    stripeSessionId: { type: String, sparse: true },
    stripePaymentIntentId: { type: String, sparse: true },
    paidAt: { type: Date },
    invoiceNumber: { type: String, sparse: true },
    // Parcel & Tracking fields
    courier: { type: String },
    trackingNumber: { type: String, sparse: true },
    trackingUrl: { type: String },
    estimatedDelivery: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    trackingHistory: { type: [trackingEventSchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ trackingNumber: 1 });

// Auto-generate orderNumber if not set
orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "CFY-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.orderNumber = code;
  }
  next();
});

export const Order: Model<IOrder> =
  models.Order || model<IOrder>("Order", orderSchema);

