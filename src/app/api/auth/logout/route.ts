import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { ApiResponse } from "@/types";

export async function POST() {
  const response = NextResponse.json<ApiResponse<null>>({
    success: true,
    message: "Logged out successfully",
    data: null,
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
