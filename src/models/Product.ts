import mongoose, { Schema, Document, Model } from "mongoose";

export type ProductTag = "New" | "Sale" | "Bestseller" | null;

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string; // Category slug (e.g., 'home-living', 'apparel')
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  tag?: ProductTag;
  specifications?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
      index: true,
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price must be positive"],
    },
    category: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: [
        (val: string[]) => val.length > 0,
        "Please provide at least one image URL",
      ],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 12,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 25,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    tag: {
      type: String,
      enum: ["New", "Sale", "Bestseller", null],
      default: null,
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Create indexes for sorting, filtering, and text search
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ featured: 1, createdAt: -1 });
ProductSchema.index({ stock: 1, price: 1 });
ProductSchema.index({ createdAt: -1 });

ProductSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

