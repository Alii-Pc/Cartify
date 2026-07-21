import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
  parsePaginationParams,
} from "@/lib/api-utils";
import { createOrderSchema } from "@/lib/validations/order";
import type { SafeOrder } from "@/types";
import { sendOrderEmails } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/**
 * Helper to format a lean order document into a SafeOrder
 */
function formatOrder(order: any): SafeOrder {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    userId: order.userId.toString(),
    items: order.items.map((item: any) => ({
      productId: item.productId.toString(),
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      email: order.shippingAddress.email,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zipCode: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    },
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    status: order.status,
    promoCode: order.promoCode,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * GET /api/orders — Fetch paginated orders for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { page, limit, skip } = parsePaginationParams(req.nextUrl, 5, 20);

    await connectDB();

    const total = await Order.countDocuments({ userId: user._id });
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedOrders = orders.map(formatOrder);
    const totalPages = Math.ceil(total / limit);

    return successResponse({
      orders: formattedOrders,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/orders error:", err);
    return errorResponse("Failed to fetch orders", 500);
  }
}

/**
 * POST /api/orders — Create a new order from the user's cart
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = await validateRequest(createOrderSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { shippingAddress, promoCode } = validation.data;

    await connectDB();

    // Fetch user's cart
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.items.length === 0) {
      return errorResponse("Your cart is empty", 400);
    }

    // Process order items and validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return errorResponse(`Product with ID ${item.productId} no longer exists`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for "${product.name}". Only ${product.stock} units available.`,
          400
        );
      }

      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || "",
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    // Calculate Promo Discount
    let discount = 0;
    const cleanPromo = promoCode?.trim().toUpperCase();
    if (cleanPromo === "WELCOME10") {
      discount = subtotal * 0.1;
    } else if (cleanPromo === "CARTIFY20") {
      if (subtotal >= 50) {
        discount = 20;
      }
    }

    // Shipping logic (free over $50)
    const shipping = subtotal >= 50 ? 0 : 5.0;

    // Tax logic (8% of taxable amount)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.08;

    // Grand total
    const total = Math.max(0, taxableAmount + shipping + tax);

    // Create Order document
    const newOrder = new Order({
      userId: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      status: "confirmed", // Set order as confirmed directly
      promoCode: cleanPromo || undefined,
    });

    await newOrder.save();

    // Decrement stocks and update product metrics
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    cart.items = [];
    await cart.save();

    const formattedOrder = formatOrder(newOrder);

    // Send confirmation emails (user & admin)
    try {
      await sendOrderEmails(newOrder);
    } catch (mailErr) {
      console.error("[Orders API] Failed to send order emails:", mailErr);
    }

    return successResponse(formattedOrder, "Order placed successfully", 201);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/orders error:", err);
    return errorResponse("Failed to place order. Please try again.", 500);
  }
}
