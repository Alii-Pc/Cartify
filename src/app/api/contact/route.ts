import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmails } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required"),
  orderNumber: z.string().trim().optional(),
  subject: z.string().trim().min(1, "Subject is required").max(100),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { name, email, orderNumber, subject, message } = result.data;

    await sendContactEmails({ name, email, orderNumber, subject, message });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. We'll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error("[Contact API] Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
