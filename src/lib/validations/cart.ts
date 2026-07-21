import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Minimum quantity is 1").max(99, "Maximum quantity is 99").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be 0 or greater").max(99, "Maximum quantity is 99"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
