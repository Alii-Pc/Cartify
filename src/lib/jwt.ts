import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "@/types";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined. Add it to your .env.local file."
    );
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "cartify_token";
