
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

/* ---------------------------------------------------------------------------
 * Serverless / Vercel Compatible Mailer
 * ---------------------------------------------------------------------------
 * In serverless environments like Vercel (AWS Lambda), connection pooling
 * (`pool: true`) and global socket caching cause timeouts and connection
 * reset errors (`ETIMEDOUT`, `EPIPE`, `Socket timeout`) when containers
 * freeze between HTTP requests.
 *
 * Using `pool: false` (the default) ensures each email opens a clean socket,
 * sends the message, and sends `QUIT` right away before Vercel freezes the
 * container.
 * -------------------------------------------------------------------------*/

function createServerlessTransporter(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(portStr);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is incomplete on server. Ensure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are set in Vercel Environment Variables."
    );
  }

  // Port 465 uses direct SSL/TLS (`secure: true`), while 587 uses STARTTLS (`secure: false`)
  const isSecure = port === 465 || process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    pool: false,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
    },
  } as any);
}

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_500;

async function sendMailReliably(mailOptions: Mail.Options): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const transporter = createServerlessTransporter();
      await transporter.sendMail(mailOptions);
      transporter.close(); // Explicitly close socket after sending
      return; // success
    } catch (err) {
      lastError = err;
      console.error(
        `[Mailer] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${mailOptions.to}:`,
        err
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

/* ---------------------------------------------------------------------------
 * Public helpers
 * -------------------------------------------------------------------------*/
export async function sendVerificationEmail(
  to: string,
  name: string,
  otp: string
) {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();

  await sendMailReliably({
    from,
    to,
    subject: "Your Cartify verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5f6f0; border-radius: 16px;">
        <h2 style="color: #4f5a34; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="color: #2b2b26; font-size: 14px; line-height: 1.6;">
          Thanks for creating a Cartify account. Use the verification code
          below to confirm your email address. This code expires in 10 minutes.
        </p>
        <div style="margin-top: 24px; text-align: center;">
          <span style="display: inline-block; padding: 16px 32px;
                       background-color: #4f5a34; color: #fdfcf8;
                       border-radius: 12px; font-size: 32px; font-weight: 700;
                       letter-spacing: 8px; font-family: monospace;">
            ${otp}
          </span>
        </div>
        <p style="color: #2b2b26; font-size: 12px; margin-top: 24px; text-align: center;">
          If you didn't create a Cartify account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(
  to: string,
  name: string,
  token: string
) {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://cartify.vercel.app";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendMailReliably({
    from,
    to,
    subject: "Reset your Cartify password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5f6f0; border-radius: 16px;">
        <h2 style="color: #4f5a34; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="color: #2b2b26; font-size: 14px; line-height: 1.6;">
          We received a request to reset your Cartify password. Click the
          button below to choose a new one. This link expires in 1 hour.
          If you didn't request this, you can safely ignore this email.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; margin-top: 20px; padding: 12px 28px;
                  background-color: #4f5a34; color: #fdfcf8; text-decoration: none;
                  border-radius: 999px; font-size: 14px; font-weight: 600;">
          Reset password
        </a>
        <p style="color: #2b2b26; font-size: 12px; margin-top: 24px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          ${resetUrl}
        </p>
      </div>
    `,
  });
}

/* ---------------------------------------------------------------------------
 * Contact Form Emails
 * -------------------------------------------------------------------------*/
interface ContactEmailData {
  name: string;
  email: string;
  orderNumber?: string | undefined;
  subject: string;
  message: string;
}

export async function sendContactEmails(data: ContactEmailData): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const { name, email, orderNumber, subject, message } = data;

  const orderRow = orderNumber
    ? `<tr>
        <td style="padding: 8px 12px; color: #555; font-size: 13px; font-weight: 600; white-space: nowrap;">Order #</td>
        <td style="padding: 8px 12px; color: #2b2b26; font-size: 13px;">${orderNumber}</td>
       </tr>`
    : "";

  // ── 1. Confirmation email to the user ──
  await sendMailReliably({
    from,
    to: email,
    subject: `We received your message — Cartify Support`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 36px 32px; background: #f5f6f0; border-radius: 16px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 700; color: #4f5a34;">Cart<span style="color: #8a9a5b;">ify</span></span>
        </div>
        <h2 style="color: #2b2b26; font-size: 20px; margin: 0 0 8px;">Hi ${name}, we got your message! 👋</h2>
        <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
          Thank you for reaching out. Our customer care team has received your inquiry and will respond within <strong>24 hours</strong>.
        </p>

        <div style="background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #d8dcc4; margin-bottom: 24px;">
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7a8a5a; margin: 0 0 12px;">Your Message Summary</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr style="border-bottom: 1px solid #f0f1ea;">
                <td style="padding: 8px 12px; color: #555; font-size: 13px; font-weight: 600; white-space: nowrap;">Subject</td>
                <td style="padding: 8px 12px; color: #2b2b26; font-size: 13px;">${subject}</td>
              </tr>
              ${orderRow}
              <tr>
                <td style="padding: 8px 12px; color: #555; font-size: 13px; font-weight: 600; vertical-align: top; white-space: nowrap;">Message</td>
                <td style="padding: 8px 12px; color: #2b2b26; font-size: 13px; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          Questions? Reply directly to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cartify.vercel.app"}/contact" style="color: #4f5a34;">cartify.com/contact</a>
        </p>
      </div>
    `,
  });

  // ── 2. Notification email to admin ──
  await sendMailReliably({
    from,
    to: adminEmail,
    replyTo: email,
    subject: `[Cartify Contact] ${subject} — from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 36px 32px; background: #1e2010; border-radius: 16px; color: #e8ead8;">
        <div style="margin-bottom: 20px;">
          <span style="font-size: 20px; font-weight: 700; color: #a0b060;">Cart<span style="color: #c8d890;">ify</span></span>
          <span style="font-size: 12px; font-weight: 600; background: #3a4820; color: #a0b060; padding: 3px 10px; border-radius: 999px; margin-left: 10px; vertical-align: middle;">Admin Notification</span>
        </div>

        <h2 style="font-size: 18px; color: #e8ead8; margin: 0 0 4px;">New Contact Form Submission</h2>
        <p style="color: #9a9c80; font-size: 13px; margin: 0 0 24px;">Received at ${new Date().toUTCString()}</p>

        <div style="background: #2a2e18; border-radius: 12px; padding: 20px 24px; border: 1px solid #3a3e24; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 8px 12px; color: #9a9c80; font-size: 13px; font-weight: 600; white-space: nowrap;">From</td>
                <td style="padding: 8px 12px; color: #e8ead8; font-size: 13px;">${name} &lt;<a href="mailto:${email}" style="color: #a0b060;">${email}</a>&gt;</td>
              </tr>
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 8px 12px; color: #9a9c80; font-size: 13px; font-weight: 600;">Subject</td>
                <td style="padding: 8px 12px; color: #e8ead8; font-size: 13px;">${subject}</td>
              </tr>
              ${orderNumber ? `
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 8px 12px; color: #9a9c80; font-size: 13px; font-weight: 600;">Order #</td>
                <td style="padding: 8px 12px; color: #e8ead8; font-size: 13px; font-family: monospace;">${orderNumber}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 12px; color: #9a9c80; font-size: 13px; font-weight: 600; vertical-align: top;">Message</td>
                <td style="padding: 8px 12px; color: #e8ead8; font-size: 13px; line-height: 1.7;">${message.replace(/\n/g, "<br/>")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
           style="display: inline-block; padding: 11px 24px; background: #4f5a34; color: #fdfcf8; text-decoration: none; border-radius: 999px; font-size: 13px; font-weight: 600;">
          Reply to ${name}
        </a>
      </div>
    `,
  });
}

/* ---------------------------------------------------------------------------
 * Order Placed Emails (User confirmation & Admin notification)
 * -------------------------------------------------------------------------*/
export async function sendOrderEmails(order: any): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const userEmail = order.shippingAddress.email;
  const userName = order.shippingAddress.fullName;

  // Build items rows
  const itemRows = order.items
    .map((item: any) => {
      return `
      <tr style="border-bottom: 1px solid #f0f1ea;">
        <td style="padding: 12px 8px; color: #2b2b26; font-size: 13px;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">Qty: ${item.quantity} &bull; $${item.price.toFixed(2)} each</div>
        </td>
        <td style="padding: 12px 8px; color: #2b2b26; font-size: 13px; text-align: right; font-weight: 600; vertical-align: middle;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `;
    })
    .join("");

  const discountRow = order.discount > 0
    ? `<tr style="border-bottom: 1px solid #f0f1ea;">
        <td style="padding: 8px 12px; color: #16a34a; font-size: 12px; font-weight: 600;">Discount ${order.promoCode ? `(${order.promoCode})` : ""}</td>
        <td style="padding: 8px 12px; color: #16a34a; font-size: 12px; text-align: right; font-weight: 600;">-$${order.discount.toFixed(2)}</td>
       </tr>`
    : "";

  const addressLine2Html = order.shippingAddress.addressLine2
    ? `<div>${order.shippingAddress.addressLine2}</div>`
    : "";

  // ── 1. Order Confirmation to the User ──
  await sendMailReliably({
    from,
    to: userEmail,
    subject: `Order Confirmed: #${order.orderNumber} — Cartify`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 36px 32px; background: #f5f6f0; border-radius: 16px;">
        <div style="margin-bottom: 24px; text-align: center;">
          <span style="font-size: 24px; font-weight: 700; color: #4f5a34;">Cart<span style="color: #8a9a5b;">ify</span></span>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="color: #2b2b26; font-size: 22px; margin: 0 0 8px; font-family: Georgia, serif;">Thank you for your purchase! 🪴</h2>
          <p style="color: #666; font-size: 14px; margin: 0;">We have received your order and are preparing it for shipment.</p>
        </div>

        <div style="background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #d8dcc4; margin-bottom: 24px;">
          <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7a8a5a; margin: 0 0 16px; border-bottom: 1px solid #f0f1ea; padding-bottom: 8px;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #d8dcc4; padding-top: 12px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f0f1ea;">
                <td style="padding: 8px 12px; color: #666; font-size: 12px;">Subtotal</td>
                <td style="padding: 8px 12px; color: #2b2b26; font-size: 12px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              ${discountRow}
              <tr style="border-bottom: 1px solid #f0f1ea;">
                <td style="padding: 8px 12px; color: #666; font-size: 12px;">Shipping</td>
                <td style="padding: 8px 12px; color: #2b2b26; font-size: 12px; text-align: right;">${order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f1ea;">
                <td style="padding: 8px 12px; color: #666; font-size: 12px;">Estimated Tax</td>
                <td style="padding: 8px 12px; color: #2b2b26; font-size: 12px; text-align: right;">$${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #4f5a34; font-size: 15px; font-weight: 700;">Grand Total</td>
                <td style="padding: 12px; color: #4f5a34; font-size: 15px; font-weight: 700; text-align: right;">$${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #d8dcc4; margin-bottom: 24px;">
          <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7a8a5a; margin: 0 0 12px; border-bottom: 1px solid #f0f1ea; padding-bottom: 8px;">Delivery Information</h3>
          
          <div style="font-size: 13px; color: #2b2b26; line-height: 1.6;">
            <strong>Shipping To:</strong>
            <div>${userName}</div>
            <div>${order.shippingAddress.addressLine1}</div>
            ${addressLine2Html}
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</div>
            <div>${order.shippingAddress.country}</div>
            <div style="margin-top: 6px; color: #666;">Phone: ${order.shippingAddress.phone}</div>
          </div>

          <div style="font-size: 12px; color: #666; margin-top: 14px; border-top: 1px solid #f0f1ea; padding-top: 10px;">
            Estimated Delivery: <strong>3-5 Business Days</strong>
          </div>
        </div>

        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          Questions? Reply to this email, visit <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cartify.vercel.app"}/contact" style="color: #4f5a34;">cartify.com/contact</a>, or review your order in <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cartify.vercel.app"}/orders" style="color: #4f5a34;">Order History</a>.
        </p>
      </div>
    `,
  });

  // ── 2. Order Notification to Admin ──
  await sendMailReliably({
    from,
    to: adminEmail,
    replyTo: userEmail,
    subject: `[Cartify Order] #${order.orderNumber} — by ${userName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 36px 32px; background: #1e2010; border-radius: 16px; color: #e8ead8;">
        <div style="margin-bottom: 24px; border-bottom: 1px solid #3a3e24; padding-bottom: 12px;">
          <span style="font-size: 22px; font-weight: 700; color: #a0b060;">Cart<span style="color: #c8d890;">ify</span></span>
          <span style="font-size: 12px; font-weight: 600; background: #3a4820; color: #a0b060; padding: 3px 10px; border-radius: 999px; margin-left: 10px; vertical-align: middle;">Admin Notification</span>
        </div>

        <h2 style="font-size: 18px; color: #e8ead8; margin: 0 0 6px;">New Order Placed: #${order.orderNumber}</h2>
        <p style="color: #9a9c80; font-size: 13px; margin: 0 0 24px;">Placed at ${new Date().toUTCString()}</p>

        <div style="background: #2a2e18; border-radius: 12px; padding: 20px 24px; border: 1px solid #3a3e24; margin-bottom: 24px;">
          <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a0b060; margin: 0 0 12px;">Order Summary</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tbody>
              ${order.items.map((item: any) => `
                <tr style="border-bottom: 1px solid #3a3e24;">
                  <td style="padding: 10px 8px; color: #e8ead8; font-size: 13px;">
                    <div><strong>${item.name}</strong></div>
                    <div style="font-size: 11px; color: #9a9c80; margin-top: 2px;">Qty: ${item.quantity} &bull; $${item.price.toFixed(2)} each</div>
                  </td>
                  <td style="padding: 10px 8px; color: #e8ead8; font-size: 13px; text-align: right; font-weight: 600; vertical-align: middle;">
                    $${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #3a3e24; padding-top: 8px;">
            <tbody>
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 6px 8px; color: #9a9c80; font-size: 12px;">Subtotal</td>
                <td style="padding: 6px 8px; color: #e8ead8; font-size: 12px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 6px 8px; color: #16a34a; font-size: 12px;">Discount</td>
                <td style="padding: 6px 8px; color: #16a34a; font-size: 12px; text-align: right;">-$${order.discount.toFixed(2)}</td>
              </tr>` : ""}
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 6px 8px; color: #9a9c80; font-size: 12px;">Shipping</td>
                <td style="padding: 6px 8px; color: #e8ead8; font-size: 12px; text-align: right;">$${order.shipping.toFixed(2)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #3a3e24;">
                <td style="padding: 6px 8px; color: #9a9c80; font-size: 12px;">Estimated Tax</td>
                <td style="padding: 6px 8px; color: #e8ead8; font-size: 12px; text-align: right;">$${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 8px; color: #a0b060; font-size: 14px; font-weight: 700;">Total Revenue</td>
                <td style="padding: 10px 8px; color: #a0b060; font-size: 14px; font-weight: 700; text-align: right;">$${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background: #2a2e18; border-radius: 12px; padding: 20px 24px; border: 1px solid #3a3e24; margin-bottom: 24px;">
          <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a0b060; margin: 0 0 12px;">Customer &amp; Shipping</h3>
          <div style="font-size: 13px; color: #e8ead8; line-height: 1.6;">
            <div><strong>Customer Name:</strong> ${userName}</div>
            <div><strong>Customer Email:</strong> <a href="mailto:${userEmail}" style="color: #a0b060;">${userEmail}</a></div>
            <div style="margin-top: 8px;"><strong>Address:</strong></div>
            <div>${order.shippingAddress.addressLine1}</div>
            ${addressLine2Html}
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</div>
            <div>${order.shippingAddress.country}</div>
            <div style="margin-top: 6px; color: #9a9c80;">Customer Phone: ${order.shippingAddress.phone}</div>
          </div>
        </div>

        <a href="mailto:${userEmail}?subject=Re: Order #${order.orderNumber}"
           style="display: inline-block; padding: 11px 24px; background: #4f5a34; color: #fdfcf8; text-decoration: none; border-radius: 999px; font-size: 13px; font-weight: 600;">
          Contact ${userName}
        </a>
      </div>
    `,
  });
}

