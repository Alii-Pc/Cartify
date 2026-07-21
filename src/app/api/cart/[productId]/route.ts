import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/api-utils";
import { updateCartItemSchema } from "@/lib/validations/cart";
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
 * Helper to fetch and return the full populated cart
 */
async function getPopulatedCart(userId: string): Promise<CartItemData[]> {
  const cart = await Cart.findOne({ userId }).lean();
  if (!cart || cart.items.length === 0) return [];

  const productIds = cart.items.map((item: any) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

  return cart.items
    .filter((item: any) => productMap.has(item.productId.toString()))
    .map((item: any) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      product: formatProduct(productMap.get(item.productId.toString())!),
    }));
}

/**
 * PUT /api/cart/[productId] — Update item quantity (0 = remove)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { productId } = params;


    const body = await req.json();
    const validation = await validateRequest(updateCartItemSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { quantity } = validation.data;

    await connectDB();

    if (quantity === 0) {
      // Remove the item from the cart
      await Cart.updateOne(
        { userId: user._id },
        { $pull: { items: { productId } } }
      );
    } else {
      // Verify product exists and cap quantity at stock
      const product = await Product.findById(productId).lean();
      if (!product) {
        return errorResponse("Product not found", 404);
      }

      const cappedQuantity = Math.min(quantity, product.stock);

      // Update the quantity for the specific item
      const result = await Cart.updateOne(
        { userId: user._id, "items.productId": productId },
        { $set: { "items.$.quantity": cappedQuantity } }
      );

      if (result.matchedCount === 0) {
        return errorResponse("Item not found in cart", 404);
      }
    }

    const items = await getPopulatedCart(user._id.toString());
    return successResponse({ items }, "Cart updated");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("PUT /api/cart/[productId] error:", err);
    return errorResponse("Failed to update cart item", 500);
  }
}

/**
 * DELETE /api/cart/[productId] — Remove a specific item from the cart
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { productId } = params;


    await connectDB();

    await Cart.updateOne(
      { userId: user._id },
      { $pull: { items: { productId } } }
    );

    const items = await getPopulatedCart(user._id.toString());
    return successResponse({ items }, "Item removed from cart");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/cart/[productId] error:", err);
    return errorResponse("Failed to remove cart item", 500);
  }
}
