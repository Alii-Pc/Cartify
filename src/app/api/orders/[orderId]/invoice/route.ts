import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { authenticateUser } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return new NextResponse("Authentication required", { status: 401 });
    }

    const { orderId } = params;
    await connectDB();

    const query: Record<string, any> = { userId: user._id };
    if (orderId.startsWith("CFY-")) {
      query.orderNumber = orderId;
    } else {
      query._id = orderId;
    }

    const order = await Order.findOne(query).lean();
    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.paymentStatus !== "paid") {
      return new NextResponse("Invoice only available for paid orders", { status: 403 });
    }

    const invoiceNumber = order.invoiceNumber || order.orderNumber;
    const paidAtStr = order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString();

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const discountRow = order.discount > 0 ? `
      <tr>
        <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Discount</td>
        <td style="padding: 12px; text-align: right; color: green;">-$${order.discount.toFixed(2)}</td>
      </tr>
    ` : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 40px; background: #f9f9f9; }
          .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #4f5a34; }
          .header .invoice-details { text-align: right; }
          .invoice-details p { margin: 4px 0; font-size: 14px; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .addresses div { width: 48%; }
          .addresses h3 { margin-top: 0; font-size: 16px; color: #555; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          .addresses p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #4f5a34; color: #fff; text-align: left; padding: 12px; font-size: 14px; text-transform: uppercase; }
          th.center { text-align: center; }
          th.right { text-align: right; }
          .totals { width: 50%; margin-left: auto; }
          .totals table { margin-bottom: 0; }
          .totals td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #eee; }
          .totals .grand-total { font-weight: bold; font-size: 18px; color: #4f5a34; border-bottom: none; }
          .payment-info { margin-top: 40px; padding: 20px; background: #f5f6f0; border-radius: 6px; font-size: 14px; }
          .payment-info p { margin: 6px 0; }
          .footer { margin-top: 50px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>Cartify</h1>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Paid Date:</strong> ${paidAtStr}</p>
            </div>
          </div>
          
          <div class="addresses">
            <div>
              <h3>Billed To</h3>
              <p><strong>${order.shippingAddress.fullName}</strong></p>
              <p>${order.shippingAddress.email}</p>
              <p>${order.shippingAddress.phone}</p>
            </div>
            <div>
              <h3>Shipped To</h3>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.country}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td><strong>Subtotal</strong></td>
                <td style="text-align: right;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td><strong>Discount ${order.promoCode ? `(${order.promoCode})` : ''}</strong></td>
                <td style="text-align: right; color: #16a34a;">-$${order.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td><strong>Shipping</strong></td>
                <td style="text-align: right;">$${order.shipping.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Tax</strong></td>
                <td style="text-align: right;">$${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="grand-total">Grand Total</td>
                <td class="grand-total" style="text-align: right;">$${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="payment-info">
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p><strong>Payment Status:</strong> PAID</p>
            ${order.stripePaymentIntentId ? `<p><strong>Transaction ID:</strong> ${order.stripePaymentIntentId}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for shopping with Cartify!</p>
          </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <script>
          window.onload = function() {
            var element = document.querySelector('.container');
            var opt = {
              margin:       [0.5, 0.5, 0.5, 0.5],
              filename:     'invoice-${invoiceNumber}.pdf',
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2 },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            // Add a temporary downloading text
            var footer = document.querySelector('.footer');
            var originalFooter = footer.innerHTML;
            footer.innerHTML = '<p style="color: #4f5a34; font-weight: bold;">Generating PDF... You can close this tab once the download starts.</p>';
            
            html2pdf().set(opt).from(element).save().then(function() {
               footer.innerHTML = originalFooter;
            });
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/orders/[orderId]/invoice error:", err);
    return new NextResponse("Failed to generate invoice", { status: 500 });
  }
}
