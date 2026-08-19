import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AIChatLog } from "@/models/AIChatLog";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") || "30";
    
    await connectDB();
    
    let dateFilter = {};
    if (daysParam !== "all") {
      const days = parseInt(daysParam, 10);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      dateFilter = { timestamp: { $gte: pastDate } };
    }

    // Fetch the last 1000 user messages
    const logs = await AIChatLog.find({ sender: "user", ...dateFilter })
      .sort({ timestamp: -1 })
      .limit(1000)
      .select("message");

    const messages = logs.map((l: any) => l.message).filter(Boolean);

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        data: { topQuestions: [] }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
       // Mock data if no API key
       return NextResponse.json({
         success: true,
         data: {
           topQuestions: [
             { question: "Where is my order?", count: 342, category: "Orders" },
             { question: "What is your return policy?", count: 287, category: "Returns" },
             { question: "How long does shipping take?", count: 241, category: "Shipping" }
           ]
         }
       });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
    Analyze the following list of user questions/messages sent to our AI Shopping Assistant.
    Group them by similar intent. For example, "Where is my order?" and "Track my package" are the same intent.
    Count the frequency of each intent based on the messages provided.
    
    Return the top 15 most frequent intents.
    Format your response as a valid JSON array of objects, where each object has:
    - "question": A clean, canonical representation of the question (e.g. "Where is my order?")
    - "count": The integer count of how many messages match this intent
    - "category": A broad category like "Orders", "Shipping", "Products", "Returns", "Refunds", "Payments", "Discounts", "Account", or "Other"
    
    Messages to analyze (one per line):
    ${messages.join("\n")}
    
    IMPORTANT: Respond ONLY with the raw JSON array. Do NOT wrap it in backticks or markdown like \`\`\`json. Just the raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { temperature: 0.1 },
    });

    let jsonString = response.text || "[]";
    // clean up any potential markdown formatting from gemini
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const topQuestions = JSON.parse(jsonString);

    return NextResponse.json({
      success: true,
      data: { topQuestions: topQuestions.sort((a: any, b: any) => b.count - a.count) }
    });

  } catch (error: any) {
    console.error("FAQ API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate FAQs", details: error.message },
      { status: 500 }
    );
  }
}
