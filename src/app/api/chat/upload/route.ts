import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle multipart/form-data (File upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "cartify/chat";

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

    return errorResponse("Unsupported content-type. Send multipart/form-data with 'file'", 415);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/chat/upload error:", err);
    return errorResponse(err.message || "Failed to upload chat image", 500);
  }
}
