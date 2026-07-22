import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/Wishlist";
import { Product } from "@/models/Product";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/api-utils";
import type { SafeProduct } from "@/types";

export const dynamic = "force-dynamic";

const toggleWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

/**
 * Helper to format a lean product document into a SafeProduct
 */
function formatProduct(p: any): SafeProduct {
  return {
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.category,
    images: p.images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    featured: p.featured,
    tag: p.tag,
    specifications: p.specifications,
    createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

/**
 * GET /api/wishlist — Fetch the authenticated user's wishlist with populated product data
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    const wishlist = await Wishlist.findOne({ userId: user._id }).lean();
    if (!wishlist || wishlist.products.length === 0) {
      return successResponse({ products: [] as SafeProduct[] });
    }

    // Look up all products in the wishlist
    const products = await Product.find({
      _id: { $in: wishlist.products },
    }).lean();

    const formattedProducts: SafeProduct[] = products.map(formatProduct);

    return successResponse({ products: formattedProducts });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/wishlist error:", err);
    return errorResponse("Failed to fetch wishlist", 500);
  }
}

/**
 * POST /api/wishlist — Toggle a product in the wishlist (add if absent, remove if present)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = await validateRequest(toggleWishlistSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { productId } = validation.data;

    await connectDB();

    if (!mongoose.isValidObjectId(productId)) {
      return errorResponse("Invalid product ID specified", 400);
    }

    // Verify the product exists
    const product = await Product.findById(productId).lean();
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Find or create the wishlist
    let wishlist = await Wishlist.findOne({ userId: user._id });

    if (!wishlist) {
      // Create a new wishlist with this product
      wishlist = await Wishlist.create({
        userId: user._id,
        products: [productId],
      });
      return successResponse(
        { action: "added" as const, productId },
        "Product added to wishlist"
      );
    }

    // Check if product is already in the wishlist
    const productIndex = wishlist.products.findIndex(
      (id: any) => id.toString() === productId
    );

    if (productIndex > -1) {
      // Remove from wishlist
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      return successResponse(
        { action: "removed" as const, productId },
        "Product removed from wishlist"
      );
    } else {
      // Add to wishlist
      wishlist.products.push(productId as any);
      await wishlist.save();
      return successResponse(
        { action: "added" as const, productId },
        "Product added to wishlist"
      );
    }
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/wishlist error:", err);
    return errorResponse("Failed to update wishlist", 500);
  }
}

/**
 * DELETE /api/wishlist — Clear the entire wishlist
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    await Wishlist.findOneAndUpdate(
      { userId: user._id },
      { $set: { products: [] } }
    );

    return successResponse(
      { products: [] as SafeProduct[] },
      "Wishlist cleared"
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/wishlist error:", err);
    return errorResponse("Failed to clear wishlist", 500);
  }
}
