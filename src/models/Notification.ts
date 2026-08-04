import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId | null; // null means it's a global broadcast to all users
  title: string;
  body: string;
  type: "order_update" | "promotion" | "system";
  isRead: boolean; // Used for targeted notifications (userId !== null)
  readBy: Types.ObjectId[]; // Used for global broadcasts (userId === null)
  link?: string; // Optional link to redirect user when clicked
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["order_update", "promotion", "system"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    link: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", notificationSchema);
