import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "cartify_token";
const PROTECTED_ROUTES = ["/checkout", "/orders"];
const AUTH_ROUTES = ["/login", "/signup"];

interface AuthTokenPayload {
  valid: boolean;
  role?: string;
  userId?: string;
  email?: string;
}

// Verify JWT token in Edge runtime
async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);
    return {
      valid: true,
      role: (payload.role as string) || "user",
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return { valid: false };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // Basic CSRF Protection for state-changing API requests
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const isSafeOrigin = origin
      ? origin.includes(host || "")
      : referer
      ? referer.includes(host || "")
      : false;

    if (origin && !isSafeOrigin) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "CSRF token mismatch or invalid origin" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const auth = token ? await verifyAuthToken(token) : { valid: false };

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin");
  const fullTarget = pathname + (req.nextUrl.search || "");

  // 1. Protect Admin API routes
  if (isAdminApi) {
    if (!auth.valid || auth.role !== "admin") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Access denied. Administrator privileges required.",
        }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // 2. Protect Admin Frontend Pages (/admin/...)
  if (isAdminPage) {
    // If on /admin/login
    if (pathname === "/admin/login") {
      // If already logged in as admin, redirect to admin dashboard
      if (auth.valid && auth.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // For all other /admin routes:
    if (!auth.valid) {
      // Not logged in -> Redirect to /admin/login
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirectTo", fullTarget);
      return NextResponse.redirect(loginUrl);
    }

    if (auth.role !== "admin") {
      // Logged in but not an admin -> Deny access & redirect to /admin/login
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Customer Protected Routes (/checkout, /orders)
  if (isProtected && !auth.valid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", fullTarget);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Customer Auth Routes (/login, /signup)
  if (isAuthRoute && auth.valid) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/payment/:path*",
    "/login",
    "/signup",
    "/api/:path*",
  ],
};
