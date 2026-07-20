import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";
import type { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectDB();

    await Category.deleteMany({});
    await Category.insertMany(SEED_CATEGORIES);

    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(SEED_PRODUCTS);

    return NextResponse.json<ApiResponse<typeof insertedProducts>>({
      success: true,
      message: `Successfully seeded ${SEED_CATEGORIES.length} categories and ${insertedProducts.length} products.`,
      data: insertedProducts,
    });
  } catch (err) {
    console.error("Seeding error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Failed to seed database" },
      { status: 500 }
    );
  }
}
