import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "cartify_token";
const PROTECTED_ROUTES = ["/dashboard", "/checkout", "/orders", "/payment"];
const AUTH_ROUTES = ["/login", "/signup"];

// NOTE: middleware runs on the Edge runtime, which doesn't support the
// Node.js `jsonwebtoken` package — we use `jose` here purely for verifying
// the token's validity so we can redirect appropriately.
async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const valid = token ? await isTokenValid(token) : false;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !valid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && valid) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/orders/:path*", "/payment/:path*", "/login", "/signup", "/api/webhooks/:path*"],
};

