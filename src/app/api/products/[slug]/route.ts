import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import mongoose from "mongoose";
import type { ApiResponse, SafeProduct, SafeCategory } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const identifier = params.slug;
    let productDb = await Product.findOne({ slug: identifier.toLowerCase() }).lean();

    if (!productDb && mongoose.isValidObjectId(identifier)) {
      productDb = await Product.findById(identifier).lean();
    }

    if (!productDb) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const [relatedProductsDb, categoryDb] = await Promise.all([
      Product.find({
        category: productDb.category,
        _id: { $ne: productDb._id },
      })
        .limit(4)
        .lean(),
      Category.findOne({ slug: productDb.category }).lean(),
    ]);

    const formattedProduct: SafeProduct = {
      _id: productDb._id.toString(),
      name: productDb.name,
      slug: productDb.slug,
      description: productDb.description,
      price: productDb.price,
      compareAtPrice: productDb.compareAtPrice,
      category: productDb.category,
      images: productDb.images,
      rating: productDb.rating,
      reviewCount: productDb.reviewCount,
      stock: productDb.stock,
      featured: productDb.featured,
      tag: productDb.tag,
      specifications: productDb.specifications,
      createdAt: productDb.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: productDb.updatedAt?.toISOString() || new Date().toISOString(),
    };

    const formattedRelated: SafeProduct[] = relatedProductsDb.map((p) => ({
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

    const formattedCategory: SafeCategory | undefined = categoryDb
      ? {
          _id: categoryDb._id.toString(),
          name: categoryDb.name,
          slug: categoryDb.slug,
          emoji: categoryDb.emoji,
          description: categoryDb.description,
        }
      : undefined;

    return NextResponse.json<
      ApiResponse<{ product: SafeProduct; relatedProducts: SafeProduct[]; category?: SafeCategory }>
    >({
      success: true,
      data: {
        product: formattedProduct,
        relatedProducts: formattedRelated,
        category: formattedCategory,
      },
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
