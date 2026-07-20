import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import mongoose from "mongoose";
import { requireAdmin, successResponse, errorResponse, validateRequest } from "@/lib/api-utils";
import { updateProductSchema } from "@/lib/validations/product";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import type { SafeProduct, SafeCategory } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const identifier = params.slug.toLowerCase();
    let productDb = await Product.findOne({ slug: identifier }).lean();

    if (!productDb && mongoose.isValidObjectId(params.slug)) {
      productDb = await Product.findById(params.slug).lean();
    }

    if (!productDb) {
      return errorResponse("Product not found", 404);
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

    return successResponse(
      {
        product: formattedProduct,
        relatedProducts: formattedRelated,
        category: formattedCategory,
      },
      "Product details fetched successfully"
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/products/[slug] error:", err);
    return errorResponse("Failed to fetch product details", 500);
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
    const validation = await validateRequest(updateProductSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    await connectDB();
    const identifier = params.slug.toLowerCase();

    let query: Record<string, any> = { slug: identifier };
    if (mongoose.isValidObjectId(params.slug)) {
      query = { $or: [{ slug: identifier }, { _id: params.slug }] };
    }

    const product = await Product.findOne(query);
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Verify new category exists if changed
    if (validation.data.category && validation.data.category !== product.category) {
      const categoryExists = await Category.findOne({ slug: validation.data.category });
      if (!categoryExists) {
        return errorResponse(`Category '${validation.data.category}' does not exist`, 400);
      }
    }

    // Check duplicates if name or slug changed
    if (validation.data.name || validation.data.slug) {
      const duplicateQuery: Record<string, any>[] = [];
      if (validation.data.name && validation.data.name !== product.name) {
        duplicateQuery.push({ name: validation.data.name });
      }
      if (validation.data.slug && validation.data.slug !== product.slug) {
        duplicateQuery.push({ slug: validation.data.slug });
      }
      if (duplicateQuery.length > 0) {
        const existing = await Product.findOne({
          $or: duplicateQuery,
          _id: { $ne: product._id },
        });
        if (existing) {
          return errorResponse("A product with this name or slug already exists", 409);
        }
      }
    }

    Object.assign(product, validation.data);
    await product.save();

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

    return successResponse(safeProduct, "Product updated successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("PUT /api/products/[slug] error:", err);
    if (err?.code === 11000) {
      return errorResponse("A product with this name or slug already exists", 409);
    }
    return errorResponse("Failed to update product", 500);
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

    let product = await Product.findOne({ slug: identifier });
    if (!product && mongoose.isValidObjectId(params.slug)) {
      product = await Product.findById(params.slug);
    }

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Optionally attempt cleanup of images hosted on Cloudinary if URLs contain /cartify/
    try {
      if (product.images && Array.isArray(product.images)) {
        for (const imgUrl of product.images) {
          if (imgUrl.includes("cloudinary.com") && imgUrl.includes("cartify/")) {
            // Extract public_id from Cloudinary URL (e.g. .../v12345/cartify/products/xyz.jpg -> cartify/products/xyz)
            const match = imgUrl.match(/(cartify\/[^.]+)/);
            if (match && match[1]) {
              await deleteImageFromCloudinary(match[1]);
            }
          }
        }
      }
    } catch (cleanupErr) {
      console.warn("Image cleanup error during product deletion:", cleanupErr);
    }

    await product.deleteOne();

    return successResponse(
      { deleted: true, slug: product.slug, id: product._id },
      "Product deleted successfully"
    );
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/products/[slug] error:", err);
    return errorResponse("Failed to delete product", 500);
  }
}
