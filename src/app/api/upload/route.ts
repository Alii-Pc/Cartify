import { NextRequest } from "next/server";
import { requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    const contentType = req.headers.get("content-type") || "";

    // Handle multipart/form-data (File upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "cartify/products";

      if (!file) {
        return errorResponse("No image file provided. Make sure field name is 'file'", 400);
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return errorResponse(
          `Invalid file format: ${file.type}. Allowed formats: JPG, PNG, WEBP, GIF`,
          400
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse("File size exceeds limit of 5MB", 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadImageToCloudinary(buffer, folder);
      return successResponse(result, "Image uploaded successfully", 201);
    }

    // Handle JSON (base64 string upload)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { image, folder = "cartify/products" } = body;

      if (!image || typeof image !== "string") {
        return errorResponse("Please provide a base64 string or data URL in the 'image' property", 400);
      }

      const result = await uploadImageToCloudinary(image, folder);
      return successResponse(result, "Image uploaded successfully", 201);
    }

    return errorResponse("Unsupported content-type. Send multipart/form-data with 'file' or JSON with 'image'", 415);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/upload error:", err);
    return errorResponse(err.message || "Failed to upload image to Cloudinary", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.errorResponse) {
      return authCheck.errorResponse;
    }

    const body = await req.json();
    const { publicId } = body;

    if (!publicId || typeof publicId !== "string") {
      return errorResponse("Please provide a valid 'publicId' string to delete", 400);
    }

    const deleted = await deleteImageFromCloudinary(publicId);
    if (!deleted) {
      return errorResponse("Failed to delete image or image already removed", 404);
    }

    return successResponse({ deleted: true, publicId }, "Image deleted successfully from Cloudinary");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/upload error:", err);
    return errorResponse("Failed to delete image", 500);
  }
}
