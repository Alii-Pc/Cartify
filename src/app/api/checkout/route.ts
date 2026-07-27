import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { authenticateUser, successResponse, errorResponse, validateRequest } from "@/lib/api-utils";
import { createOrderSchema } from "@/lib/validations/order";
import { calculateOrderTotals } from "@/lib/checkout-utils";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

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
      return errorResponse("Your cart is empty.", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        // Skip products that no longer exist
        continue;
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

    if (orderItems.length === 0) {
      return errorResponse("The products in your cart are no longer available.", 400);
    }

    const totals = calculateOrderTotals(subtotal, promoCode);
    const { discount, shipping, tax, total } = totals;

    const newOrder = new Order({
      userId: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "stripe",
      promoCode: promoCode?.trim().toUpperCase() || undefined,
    });

    await newOrder.save();

    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || req.nextUrl.origin;
    const baseUrl = rawAppUrl.startsWith("http") ? rawAppUrl : `https://${rawAppUrl}`;

    const lineItems: any[] = orderItems.map((item) => {
      let imageUrls: string[] = [];
      if (item.image) {
        if (item.image.startsWith("http")) {
          imageUrls = [item.image];
        } else {
          imageUrls = [`${baseUrl}${item.image.startsWith("/") ? "" : "/"}${item.image}`];
        }
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: imageUrls,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    let coupon;
    if (discount > 0) {
      coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "usd",
        duration: "once",
        name: `Promo Code: ${promoCode}`,
      });
    }



    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      ...(coupon && { discounts: [{ coupon: coupon.id }] }),
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel?order_id=${newOrder._id}`,
      metadata: { orderId: newOrder._id.toString(), userId: user._id.toString() },
      client_reference_id: user._id.toString(),
      customer_email: shippingAddress.email,
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    return successResponse({ sessionUrl: session.url });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/checkout error:", err);
    return errorResponse("Failed to create checkout session.", 500);
  }
}
