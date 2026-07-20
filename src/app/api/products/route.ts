import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import {
  requireAdmin,
  successResponse,
  errorResponse,
  validateRequest,
  parsePaginationParams,
  parseFilterParams,
} from "@/lib/api-utils";
import { createProductSchema } from "@/lib/validations/product";
import type { PaginatedProductsResponse, SafeProduct } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed sample data if the products collection is totally empty
    await seedDatabaseIfEmpty();

    const url = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(url);
    const { filter, sortObj } = parseFilterParams(url);

    const [products, total, categoriesDb] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
      Category.find({}).sort({ name: 1 }).lean(),
    ]);

    // Calculate product counts per category for UI badges
    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>(
      categoryCounts.map((item) => [item._id, item.count])
    );

    const categoriesWithCount = categoriesDb.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji,
      description: cat.description,
      productCount: countMap.get(cat.slug) || 0,
    }));

    const formattedProducts: SafeProduct[] = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: p.category,
      images: p.images,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      featured: p.featured,
      tag: p.tag,
      specifications: p.specifications,
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    const response: PaginatedProductsResponse = {
      products: formattedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      categories: categoriesWithCount,
    };

    return successResponse(response, "Products fetched successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/products error:", err);
    return errorResponse("Failed to fetch products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validation = await validateRequest(createProductSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    await connectDB();

    // Verify category exists
    const categoryExists = await Category.findOne({ slug: validation.data.category });
    if (!categoryExists) {
      return errorResponse(`Category '${validation.data.category}' does not exist. Please create it first.`, 400);
    }

    // Check duplicate name or slug if provided
    const duplicateQuery: Record<string, any>[] = [{ name: validation.data.name }];
    if (validation.data.slug) {
      duplicateQuery.push({ slug: validation.data.slug });
    }

    const existing = await Product.findOne({ $or: duplicateQuery });
    if (existing) {
      return errorResponse("A product with this name or slug already exists", 409);
    }

    const product = await Product.create(validation.data);

    const safeProduct: SafeProduct = {
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: product.category,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      featured: product.featured,
      tag: product.tag,
      specifications: product.specifications,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return successResponse(safeProduct, "Product created successfully", 201);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/products error:", err);
    if (err?.code === 11000) {
      return errorResponse("A product with this name or slug already exists", 409);
    }
    return errorResponse(err.message || "Failed to create product", 500);
  }
}
