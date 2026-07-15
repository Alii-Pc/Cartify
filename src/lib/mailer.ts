
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
