import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    
    // Upsert categories by slug so custom categories are preserved
    for (const cat of SEED_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
    }

    // Upsert seed products by slug so custom admin-created products are NEVER deleted
    for (let index = 0; index < SEED_PRODUCTS.length; index++) {
      const prod = SEED_PRODUCTS[index];
      const isFeatured = index < 8 ? true : prod.featured;
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: { ...prod, featured: isFeatured } },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true, message: `Successfully updated/seeded ${SEED_CATEGORIES.length} categories and ${SEED_PRODUCTS.length} seed products without touching custom products!` });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
