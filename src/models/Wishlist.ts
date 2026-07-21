import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);



export const Wishlist: Model<IWishlist> =
  models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);
