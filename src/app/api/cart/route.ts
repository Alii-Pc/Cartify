import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/api-utils";
import { addToCartSchema } from "@/lib/validations/cart";
import type { SafeProduct, CartItemData } from "@/types";

export const dynamic = "force-dynamic";

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
 * GET /api/cart — Fetch the authenticated user's cart with populated product data
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    const cart = await Cart.findOne({ userId: user._id }).lean();
    if (!cart || cart.items.length === 0) {
      return successResponse({ items: [] as CartItemData[] });
    }

    // Look up all products referenced in the cart
    const productIds = cart.items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    // Build response, filtering out stale items whose products no longer exist
    const validItems: CartItemData[] = [];
    const staleProductIds: string[] = [];

    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());
      if (product) {
        validItems.push({
          productId: item.productId.toString(),
          quantity: item.quantity,
          product: formatProduct(product),
        });
      } else {
        staleProductIds.push(item.productId.toString());
      }
    }

    // Clean up stale items in the background
    if (staleProductIds.length > 0) {
      await Cart.updateOne(
        { userId: user._id },
        { $pull: { items: { productId: { $in: staleProductIds } } } }
      );
    }

    return successResponse({ items: validItems });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/cart error:", err);
    return errorResponse("Failed to fetch cart", 500);
  }
}

/**
 * POST /api/cart — Add or update an item in the cart
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = await validateRequest(addToCartSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { productId } = validation.data;
    const quantity: number = validation.data.quantity ?? 1;

    await connectDB();

    if (!mongoose.isValidObjectId(productId)) {
      return errorResponse("Invalid product ID specified", 400);
    }

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId).lean();
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    if (product.stock <= 0) {
      return errorResponse("Product is out of stock", 400);
    }

    // Check if product already exists in the cart
    const existingCart = await Cart.findOne({ userId: user._id }).lean();
    const existingItem = existingCart?.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItem) {
      // Increment quantity, cap at available stock
      const newQuantity = Math.min((existingItem.quantity ?? 1) + quantity, product.stock ?? 99);
      await Cart.updateOne(
        { userId: user._id, "items.productId": productId },
        { $set: { "items.$.quantity": newQuantity } }
      );
    } else {
      // Add new item, cap quantity at stock
      const cappedQuantity = Math.min(quantity, product.stock ?? 99);
      await Cart.findOneAndUpdate(
        { userId: user._id },
        { $push: { items: { productId, quantity: cappedQuantity } } },
        { upsert: true, new: true }
      );
    }

    // Return the updated cart with populated products
    const updatedCart = await Cart.findOne({ userId: user._id }).lean();
    const allProductIds = (updatedCart?.items || []).map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: allProductIds } }).lean();
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const items: CartItemData[] = (updatedCart?.items || [])
      .filter((item: any) => productMap.has(item.productId.toString()))
      .map((item: any) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        product: formatProduct(productMap.get(item.productId.toString())!),
      }));

    return successResponse({ items }, "Item added to cart");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/cart error:", err);
    return errorResponse("Failed to add item to cart", 500);
  }
}

/**
 * DELETE /api/cart — Clear the entire cart
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    await Cart.findOneAndUpdate(
      { userId: user._id },
      { $set: { items: [] } }
    );

    return successResponse({ items: [] as CartItemData[] }, "Cart cleared");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/cart error:", err);
    return errorResponse("Failed to clear cart", 500);
  }
}
