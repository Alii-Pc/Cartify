import { NextRequest } from "next/server";

// Simple in-memory rate limiter for a single instance.
// In a distributed/serverless environment, use a centralized store like Redis.

const windowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 10; // max requests per window per IP

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(req: NextRequest): { success: boolean; message: string } {
  // Use x-forwarded-for if behind a proxy (like Vercel), else fallback
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown-ip";
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired records occasionally to prevent memory leaks
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.expiresAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true, message: "Allowed" };
  }

  if (record.count >= maxRequests) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  record.count += 1;
  return { success: true, message: "Allowed" };
}
