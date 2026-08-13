import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = "invalid_key_12345";

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    console.log("Listing models...");
    const models = await ai.models.list();
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (err) {
    console.error("Detailed Error:", err.message);
  }
}

test();
