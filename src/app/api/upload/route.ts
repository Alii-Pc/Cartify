import { NextRequest } from "next/server";
import { authenticateUser, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let folder = "cartify/products";
    let file: File | null = null;
    let imageBase64: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      folder = (formData.get("folder") as string) || "cartify/products";
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = body.image;
      folder = body.folder || "cartify/products";
    } else {
      return errorResponse(
        "Unsupported content-type. Send multipart/form-data with 'file' or JSON with 'image'",
        415
      );
    }

    // Role verification: returns folder allows authenticated regular users; other folders require admin
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required to upload images", 401);
    }

    const isReturnsFolder = folder === "cartify/returns" || folder.startsWith("cartify/returns");
    if (!isReturnsFolder && user.role !== "admin" && process.env.DEV_BYPASS_ADMIN !== "true") {
      return errorResponse("Admin permissions required to upload to this directory", 403);
    }

    // Handle multipart/form-data (File upload)
    if (file) {
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
    if (imageBase64) {
      if (typeof imageBase64 !== "string") {
        return errorResponse("Please provide a valid base64 string or data URL in the 'image' property", 400);
      }

      const result = await uploadImageToCloudinary(imageBase64, folder);
      return successResponse(result, "Image uploaded successfully", 201);
    }

    return errorResponse("No image file or base64 provided", 400);
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
