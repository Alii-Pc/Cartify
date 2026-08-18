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

  // Basic CSRF Protection for state-changing API requests
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    // In production, you would strictly check against process.env.NEXT_PUBLIC_SITE_URL
    // For now, ensure origin or referer is present and matches the host
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const isSafeOrigin = origin ? origin.includes(host || "") : referer ? referer.includes(host || "") : false;
    
    // We only enforce this if token is valid (it's an authenticated request) or if we strictly want it for all
    if (origin && !isSafeOrigin) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "CSRF token mismatch or invalid origin" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const valid = token ? await isTokenValid(token) : false;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login" && !pathname.startsWith("/api/");

  if (isAdminRoute && !valid) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
  matcher: ["/admin/:path*", "/dashboard/:path*", "/checkout/:path*", "/orders/:path*", "/payment/:path*", "/login", "/signup", "/api/:path*"],
};

