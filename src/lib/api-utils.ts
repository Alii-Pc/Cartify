import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { ApiResponse, ApiSuccess, ApiError, PaginationParams } from "@/types";

/**
 * Standardized success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  const payload: ApiSuccess<T> = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return NextResponse.json(payload, { status });
}

/**
 * Standardized error response helper
 */
export function errorResponse(
  message: string,
  status = 500,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<any>> {
  const payload: ApiError = {
    success: false,
    message,
  };
  if (errors) {
    payload.errors = errors;
  }
  return NextResponse.json(payload, { status });
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; response: NextResponse<ApiResponse<any>> }> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "general";
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(issue.message);
    }
    const messages = result.error.issues.map((i) => i.message);
    const primaryMessage = messages.length > 0 ? messages.join(". ") : "Invalid input data provided.";

    return {
      success: false,
      response: errorResponse(primaryMessage, 400, formattedErrors),
    };
  }
  return { success: true, data: result.data };
}

/**
 * Parse standard pagination parameters from URL
 */
export function parsePaginationParams(url: URL, defaultLimit = 12, maxLimit = 50): PaginationParams {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.max(1, Math.min(maxLimit, Number(url.searchParams.get("limit")) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Parse standard filter and search parameters from URL
 */
export function parseFilterParams(url: URL) {
  const q = url.searchParams.get("q")?.trim() || "";
  const category = url.searchParams.get("category")?.trim() || "";
  const minPrice = url.searchParams.get("minPrice")?.trim() || "";
  const maxPrice = url.searchParams.get("maxPrice")?.trim() || "";
  const tag = url.searchParams.get("tag")?.trim() || "";
  const inStock = url.searchParams.get("inStock") === "true";
  const featured = url.searchParams.get("featured") === "true";
  const sort = url.searchParams.get("sort") || "newest";

  const filter: Record<string, any> = {};

  // Keyword / Text Search
  if (q) {
    // If text index search fails or we want flexible regex matching as well
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  // Category Filter (supports single slug or comma-separated slugs)
  if (category && category !== "all") {
    const slugs = category.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (slugs.length > 0) {
      filter.category = { $in: slugs };
    }
  }

  // Price Range Filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Tag Filter ('New' | 'Sale' | 'Bestseller', supports single tag or comma-separated tags)
  if (tag && tag !== "all") {
    const tags = tag.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 1) {
      filter.tag = tags[0];
    } else if (tags.length > 1) {
      filter.tag = { $in: tags };
    }
  }

  // In-Stock Filter
  if (inStock) {
    filter.stock = { $gt: 0 };
  }

  // Featured Filter
  if (featured) {
    filter.featured = true;
  }

  // Sorting Options
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") {
    sortObj = { price: 1 };
  } else if (sort === "price_desc") {
    sortObj = { price: -1 };
  } else if (sort === "rating") {
    sortObj = { rating: -1, reviewCount: -1 };
  } else if (sort === "newest") {
    sortObj = { createdAt: -1 };
  }

  return { filter, sortObj, q };
}

/**
 * Authenticate user from cookie or Authorization header
 */
export async function authenticateUser(req: NextRequest): Promise<IUser | null> {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = req.headers.get("authorization");
  let token = cookieToken;

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId);
  return user || null;
}

/**
 * Verify admin authorization (supports DEV_BYPASS_ADMIN=true for local dev testing)
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ user?: IUser | undefined; errorResponse?: NextResponse<ApiResponse<any>> | undefined }> {
  // Allow local development bypass if set explicitly in .env.local
  if (process.env.DEV_BYPASS_ADMIN === "true") {
    const user = await authenticateUser(req);
    return { user: user || undefined };
  }

  const user = await authenticateUser(req);
  if (!user) {
    return { errorResponse: errorResponse("Authentication required to perform this action", 401) };
  }

  if (user.role !== "admin") {
    return {
      errorResponse: errorResponse(
        "Forbidden: Admin permissions required. (Tip: set DEV_BYPASS_ADMIN=true in .env.local for local testing or change user role to 'admin' in MongoDB)",
        403
      ),
    };
  }

  return { user };
}
