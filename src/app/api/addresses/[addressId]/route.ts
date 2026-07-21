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
 * PUT /api/addresses/[addressId] — Update an existing address
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { addressId } = params;


    const body = await req.json();
    const validation = await validateRequest(addressSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const updateData = validation.data;

    await connectDB();

    const existingAddress = await Address.findOne({ _id: addressId, userId: user._id });
    if (!existingAddress) {
      return errorResponse("Address not found", 404);
    }

    if (updateData.isDefault && !existingAddress.isDefault) {
      // Set all other addresses to not default
      await Address.updateMany({ userId: user._id }, { $set: { isDefault: false } });
    }

    // Perform update
    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return errorResponse("Failed to update address", 500);
    }

    const formattedAddress = {
      ...updated.toObject(),
      _id: updated._id.toString(),
      userId: updated.userId.toString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return successResponse(formattedAddress, "Address updated successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("PUT /api/addresses/[addressId] error:", err);
    return errorResponse("Failed to update address", 500);
  }
}

/**
 * DELETE /api/addresses/[addressId] — Delete a saved address
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    const { addressId } = params;


    await connectDB();

    const addressToDelete = await Address.findOne({ _id: addressId, userId: user._id });
    if (!addressToDelete) {
      return errorResponse("Address not found", 404);
    }

    const wasDefault = addressToDelete.isDefault;

    await Address.deleteOne({ _id: addressId, userId: user._id });

    // If we deleted the default address, set another address as default if possible
    if (wasDefault) {
      const anotherAddress = await Address.findOne({ userId: user._id });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    return successResponse({ deletedId: addressId }, "Address deleted successfully");
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("DELETE /api/addresses/[addressId] error:", err);
    return errorResponse("Failed to delete address", 500);
  }
}
