import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    if (!mongoose.Types.ObjectId.isValid(params.productId)) {
      return errorResponse("Invalid product ID", 400);
    }

    const body = await req.json();
    const { stock } = body;

    if (typeof stock !== "number" || stock < 0) {
      return errorResponse("Stock must be a positive number", 400);
    }

    await connectDB();
    
    // Automatically set inStock based on the stock number
    const inStock = stock > 0;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      { $set: { stock, inStock } },
      { new: true }
    ).lean();

    if (!updatedProduct) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({
      product: updatedProduct,
      message: "Stock updated successfully"
    });
  } catch (error: any) {
    if (error.message === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin stock update error:", error);
    return errorResponse("Failed to update stock", 500);
  }
}
