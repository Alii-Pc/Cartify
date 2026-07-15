import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

/* ---------------------------------------------------------------------------
 * Lazy transporter — created on first use so that:
 *   1. SMTP env vars are guaranteed to be loaded (not undefined at import).
 *   2. The connection stays fresh; we verify it before sending.
 * -------------------------------------------------------------------------*/
let _transporter: nodemailer.Transporter | null = null;
let _transporterVerified = false;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);

    if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env.local file."
      );
    }

    _transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Connection pool & timeouts to prevent hanging sends
      pool: true,
      maxConnections: 3,
      connectionTimeout: 10_000, // 10 s
      greetingTimeout: 10_000,
      socketTimeout: 30_000, // 30 s
    });

    _transporterVerified = false;
  }

  return _transporter;
}

/* ---------------------------------------------------------------------------
 * Robust send helper: verifies the SMTP connection on first use, and retries
 * once on transient failure (e.g. connection reset, temporary server error).
 * -------------------------------------------------------------------------*/
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2_000;

async function sendMailReliably(mailOptions: Mail.Options): Promise<void> {
  const transporter = getTransporter();

  // Verify the SMTP connection once per transporter lifetime
  if (!_transporterVerified) {
    try {
      await transporter.verify();
      _transporterVerified = true;
    } catch (verifyErr) {
      console.error("SMTP connection verification failed:", verifyErr);
      // Reset so the next attempt creates a fresh transporter
      _transporter = null;
      _transporterVerified = false;
      throw new Error("Unable to connect to the email server. Please try again later.");
    }
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return; // success
    } catch (err) {
      lastError = err;
      console.error(
        `Email send attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        err
      );

      if (attempt < MAX_RETRIES) {
        // Reset transporter in case the connection went stale
        _transporter = null;
        _transporterVerified = false;
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
  await sendMailReliably({
    from: process.env.EMAIL_FROM,
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
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendMailReliably({
    from: process.env.EMAIL_FROM,
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
