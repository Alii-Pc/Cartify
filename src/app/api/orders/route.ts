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
import { calculateOrderTotals } from "@/lib/checkout-utils";

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
    paymentStatus: order.paymentStatus || "pending",
    paymentMethod: order.paymentMethod || "stripe",
    stripeSessionId: order.stripeSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    paidAt: order.paidAt?.toISOString(),
    invoiceNumber: order.invoiceNumber,
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    shippedAt: order.shippedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    trackingHistory: (order.trackingHistory || []).map((t: any) => ({
      status: t.status,
      title: t.title,
      description: t.description,
      location: t.location,
      timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
    })),
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

    const { shippingAddress, promoCode, items: bodyItems } = validation.data;

    await connectDB();

    // Determine cart items from request payload or MongoDB Cart
    let rawItems: Array<{ productId: string; quantity: number }> = [];

    if (bodyItems && bodyItems.length > 0) {
      rawItems = bodyItems;
    } else {
      const cart = await Cart.findOne({ userId: user._id });
      if (cart && cart.items.length > 0) {
        rawItems = cart.items.map((i: any) => ({
          productId: i.productId.toString(),
          quantity: i.quantity,
        }));
      }
    }

    if (rawItems.length === 0) {
      return errorResponse("Your cart is empty. Please add items to your cart before placing an order.", 400);
    }

    // Process order items and validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of rawItems) {
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

    // Calculate order financial metrics using central engine
    const totals = calculateOrderTotals(subtotal, promoCode);
    const { discount, shipping, tax, total } = totals;

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
      paymentMethod: "cod",
      paymentStatus: "paid",
      paidAt: new Date(),
      promoCode: promoCode?.trim().toUpperCase() || undefined,
    });

    await newOrder.save();

    // Decrement stocks and update product metrics
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart in database
    await Cart.findOneAndUpdate({ userId: user._id }, { $set: { items: [] } });

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
