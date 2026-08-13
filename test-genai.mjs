import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Read API key manually from .env.local to avoid dotenv requirement
const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : "";

async function test() {
  console.log("Testing with API Key length:", apiKey.length);
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.error("No valid API key found");
    return;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = "You are a test assistant.";
    const contents = [
      { role: "user", parts: [{ text: "Hello" }] }
    ];
    
    console.log("Making request...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Detailed Error:", err.message);
    if (err.stack) console.error(err.stack);
    if (err.response) console.error("Response:", err.response);
  }
}

test();
