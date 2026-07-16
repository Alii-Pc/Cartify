import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { seedDatabaseIfEmpty } from "@/app/api/products/seed/route";
import type { ApiResponse, SafeCategory } from "@/types";

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

    return NextResponse.json<ApiResponse<SafeCategory[]>>({
      success: true,
      data: formattedCategories,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/categories error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
