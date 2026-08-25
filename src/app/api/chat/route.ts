import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { AIChatLog } from "@/models/AIChatLog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API key is missing or invalid. Please add a valid key to .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const body = await req.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Connect to database to fetch context
    await connectDB();

    // Log the user's message for FAQ analytics
    try {
      await AIChatLog.create({ message, sender: "user" });
    } catch (e) {
      console.error("Failed to log AI chat message:", e);
    }

    const products = await Product.find({}).select("name price category description tag images -_id").limit(30);
    const productContext = products
      .map(
        (p) =>
          `- ${p.name} ($${p.price}) in ${p.category}. Image URL: ${p.images?.[0] || ""}. ${p.tag ? `[${p.tag}] ` : ""}${p.description.substring(0, 100)}...`
      )
      .join("\n");

    const systemInstruction = `You are a helpful, polite, and knowledgeable AI Shopping Assistant for Cartify, a premium e-commerce store.
Your role is to help users find products, provide recommendations, answer questions about store policies, parcel tracking (/track), returns (/returns), checkout, and orders.
Always maintain a friendly, calm, and professional tone.
Keep your answers concise, helpful, and well-formatted.

Store Information & Navigation:
- Parcel Tracking: Users can track their live orders at /track with their Order ID or Tracking Number.
- Returns & Refunds: Users can request returns and view refund status at /returns.
- Categories: Home & Living, Apparel, Electronics, Beauty, Kitchen, Outdoors.

Store Inventory:
${productContext}

CRITICAL RULES:
1. When recommending a product, you MUST include its image in your response using markdown: ![Product Name](Image URL)
2. DO NOT claim to connect the user to human support or support team unless the user EXPLICITLY asks to speak with a human/agent/support team.
3. If the user asks general questions about orders, products, returns, or shipping, answer directly and guide them to the appropriate page (/track, /returns, /products). DO NOT transfer to support for general inquiries.
4. ONLY if the user explicitly asks to speak with a human, live agent, or customer care representative (e.g. "I want to talk to a human", "connect me to support", "live agent"):
   - Respond: "I am connecting you with our live support team right now. A support agent will be with you shortly."`;

    // Check if user explicitly asked for human/live support
    const explicitSupportRegex = /\b(talk to (a )?human|speak to (a )?human|talk to (an? )?agent|speak to (an? )?agent|connect (me )?(to|with) (support|agent|human|team|admin)|live support|live agent|human support|customer support agent|representative|transfer me|chat with human|chat with agent|need human)\b/i;
    const isSupportRequestedByUser = explicitSupportRegex.test(message);

    // Gemini API strictly requires alternating roles (user, model, user, model)
    const rawContents = history.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      text: m.content || "",
    }));
    rawContents.push({ role: "user", text: message });

    const contents: any[] = [];
    for (const msg of rawContents) {
      if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
        contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
      } else {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.text }],
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "";

    return NextResponse.json({
      success: true,
      text: replyText,
      suggestLiveSupport: isSupportRequestedByUser,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", details: error.message },
      { status: 500 }
    );
  }
}
