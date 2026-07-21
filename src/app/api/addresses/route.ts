import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Address } from "@/models/Address";
import {
  authenticateUser,
  successResponse,
  errorResponse,
  validateRequest,
} from "@/lib/api-utils";
import { addressSchema } from "@/lib/validations/address";

export const dynamic = "force-dynamic";

/**
 * GET /api/addresses — Fetch saved addresses for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    await connectDB();

    const addresses = await Address.find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    const formattedAddresses = addresses.map((addr: any) => ({
      ...addr,
      _id: addr._id.toString(),
      userId: addr.userId.toString(),
      createdAt: addr.createdAt?.toISOString(),
      updatedAt: addr.updatedAt?.toISOString(),
    }));

    return successResponse({ addresses: formattedAddresses });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("GET /api/addresses error:", err);
    return errorResponse("Failed to fetch addresses", 500);
  }
}

/**
 * POST /api/addresses — Create a new address for the user
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const body = await req.json();
    const validation = await validateRequest(addressSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const addressData = validation.data;

    await connectDB();

    // Check if this is the first address, or if it is set as default
    const addressCount = await Address.countDocuments({ userId: user._id });
    const shouldBeDefault = addressCount === 0 || addressData.isDefault;

    if (shouldBeDefault) {
      // Set all other addresses for this user to isDefault: false
      await Address.updateMany({ userId: user._id }, { $set: { isDefault: false } });
    }

    const newAddress = await Address.create({
      ...addressData,
      userId: user._id,
      isDefault: shouldBeDefault,
    });

    const formattedAddress = {
      ...newAddress.toObject(),
      _id: newAddress._id.toString(),
      userId: newAddress.userId.toString(),
      createdAt: newAddress.createdAt.toISOString(),
      updatedAt: newAddress.updatedAt.toISOString(),
    };

    return successResponse(formattedAddress, "Address created successfully", 201);
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("POST /api/addresses error:", err);
    return errorResponse("Failed to create address", 500);
  }
}
