import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your Cartify account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5f6f0; border-radius: 16px;">
        <h2 style="color: #4f5a34; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="color: #2b2b26; font-size: 14px; line-height: 1.6;">
          Thanks for creating a Cartify account. Please confirm your email
          address by clicking the button below. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; margin-top: 20px; padding: 12px 28px;
                  background-color: #4f5a34; color: #fdfcf8; text-decoration: none;
                  border-radius: 999px; font-size: 14px; font-weight: 600;">
          Verify email
        </a>
        <p style="color: #2b2b26; font-size: 12px; margin-top: 24px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          ${verifyUrl}
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

  await transporter.sendMail({
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
