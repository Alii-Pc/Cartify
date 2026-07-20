import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { requireAdmin, successResponse, errorResponse, validateRequest, parsePaginationParams } from "@/lib/api-utils";
import { updateCategorySchema } from "@/lib/validations/category";
import type { SafeCategory, SafeProduct, PaginatedProductsResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const identifier = params.slug.toLowerCase();

    let categoryDb = await Category.findOne({ slug: identifier }).lean();
    if (!categoryDb && mongoose.isValidObjectId(params.slug)) {
      categoryDb = await Category.findById(params.slug).lean();
    }

    if (!categoryDb) {
      return errorResponse("Category not found", 404);
    }

    const url = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(url);

    const [products, total] = await Promise.all([
      Product.find({ category: categoryDb.slug })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ category: categoryDb.slug }),
    ]);

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

    const safeCategory: SafeCategory = {
      _id: categoryDb._id.toString(),
      name: categoryDb.name,
      slug: categoryDb.slug,
      emoji: categoryDb.emoji,
      description: categoryDb.description,
      productCount: total,
    };

    return successResponse(
      {
        category: safeCategory,
        products: formattedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      "Category details fetched successfully"
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/categories/[slug] error:", err);
    return errorResponse("Failed to fetch category details", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const validation = await validateRequest(updateCategorySchema, body);
    if (!validation.success) {
      return validation.response;
    }

    await connectDB();
    const identifier = params.slug.toLowerCase();

    let query: Record<string, any> = { slug: identifier };
    if (mongoose.isValidObjectId(params.slug)) {
      query = { $or: [{ slug: identifier }, { _id: params.slug }] };
    }

    const category = await Category.findOne(query);
    if (!category) {
      return errorResponse("Category not found", 404);
    }

    // Check duplicate name/slug if updated
    if (validation.data.name || validation.data.slug) {
      const duplicateQuery: Record<string, any>[] = [];
      if (validation.data.name && validation.data.name !== category.name) {
        duplicateQuery.push({ name: validation.data.name });
      }
      if (validation.data.slug && validation.data.slug !== category.slug) {
        duplicateQuery.push({ slug: validation.data.slug });
      }
      if (duplicateQuery.length > 0) {
        const existing = await Category.findOne({
          $or: duplicateQuery,
          _id: { $ne: category._id },
        });
        if (existing) {
          return errorResponse("A category with this name or slug already exists", 409);
        }
      }
    }

    const oldSlug = category.slug;

    // Apply updates
    Object.assign(category, validation.data);
    await category.save();

    // If slug changed, update all products in this category to maintain consistency
    if (validation.data.slug && validation.data.slug !== oldSlug) {
      await Product.updateMany({ category: oldSlug }, { category: category.slug });
    }

    const safeCategory: SafeCategory = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      emoji: category.emoji,
      description: category.description,
    };

    return successResponse(safeCategory, "Category updated successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("PUT /api/categories/[slug] error:", err);
    if (err?.code === 11000) {
      return errorResponse("A category with this name or slug already exists", 409);
    }
    return errorResponse("Failed to update category", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    await connectDB();
    const identifier = params.slug.toLowerCase();

    let category = await Category.findOne({ slug: identifier });
    if (!category && mongoose.isValidObjectId(params.slug)) {
      category = await Category.findById(params.slug);
    }

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return errorResponse(
        `Cannot delete category "${category.name}" because ${productCount} product(s) are assigned to it. Reassign or delete those products first.`,
        400
      );
    }

    await category.deleteOne();

    return successResponse({ deleted: true, slug: category.slug }, "Category deleted successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/categories/[slug] error:", err);
    return errorResponse("Failed to delete category", 500);
  }
}
