import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { seedDatabaseIfEmpty } from "@/app/api/products/seed/route";
import type { ApiResponse, PaginatedProductsResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed sample data if the products collection is totally empty
    await seedDatabaseIfEmpty();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const minPrice = searchParams.get("minPrice")?.trim();
    const maxPrice = searchParams.get("maxPrice")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const inStock = searchParams.get("inStock") === "true";
    const featured = searchParams.get("featured") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 12));

    const filter: Record<string, any> = {};

    // Keyword Search
    if (q) {
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

    // Tag Filter ('New' | 'Sale' | 'Bestseller')
    if (tag && tag !== "all") {
      filter.tag = tag;
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

    const skip = (page - 1) * limit;

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

    const formattedProducts = products.map((p) => ({
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

    return NextResponse.json<ApiResponse<PaginatedProductsResponse>>({
      success: true,
      data: response,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/products error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
