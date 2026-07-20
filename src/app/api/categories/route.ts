import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { requireAdmin, successResponse, errorResponse, validateRequest } from "@/lib/api-utils";
import { createCategorySchema } from "@/lib/validations/category";
import type { SafeCategory } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed if empty
    await seedDatabaseIfEmpty();

    const [categoriesDb, categoryCounts] = await Promise.all([
      Category.find({}).sort({ name: 1 }).lean(),
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map<string, number>(
      categoryCounts.map((item) => [item._id, item.count])
    );

    const formattedCategories: SafeCategory[] = categoriesDb.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji,
      description: cat.description,
      productCount: countMap.get(cat.slug) || 0,
    }));

    return successResponse(formattedCategories, "Categories fetched successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/categories error:", err);
    return errorResponse("Failed to fetch categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validation = await validateRequest(createCategorySchema, body);
    if (!validation.success) {
      return validation.response;
    }

    await connectDB();

    // Check duplicate name or slug if provided
    const duplicateQuery: Record<string, any>[] = [{ name: validation.data.name }];
    if (validation.data.slug) {
      duplicateQuery.push({ slug: validation.data.slug });
    }

    const existing = await Category.findOne({ $or: duplicateQuery });
    if (existing) {
      return errorResponse("A category with this name or slug already exists", 409);
    }

    const category = await Category.create(validation.data);

    const safeCategory: SafeCategory = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      emoji: category.emoji,
      description: category.description,
      productCount: 0,
    };

    return successResponse(safeCategory, "Category created successfully", 201);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/categories error:", err);
    if (err?.code === 11000) {
      return errorResponse("A category with this name or slug already exists", 409);
    }
    return errorResponse(err.message || "Failed to create category", 500);
  }
}
