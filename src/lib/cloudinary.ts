import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import type { UploadResponse } from "@/types";

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer or base64/data URI string to Cloudinary
 */
export async function uploadImageToCloudinary(
  fileData: Buffer | string,
  folder = "cartify/products"
): Promise<UploadResponse> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary credentials are not defined. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file."
    );
  }

  return new Promise((resolve, reject) => {
    if (typeof fileData === "string") {
      // Direct string upload (base64 or data URL or external URL)
      cloudinary.uploader.upload(
        fileData,
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
    } else {
      // Buffer stream upload (for file buffers from multipart form data)
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary stream upload failed"));
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );

      uploadStream.end(fileData);
    }
  });
}

/**
 * Delete an image from Cloudinary by its public ID
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary credentials missing, skipping deletion");
      return false;
    }
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return result?.result === "ok";
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    return false;
  }
}

export default cloudinary;
