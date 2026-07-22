import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  addressLine1: z.string().trim().min(1, "Address is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zipCode: z.string().trim().min(1, "ZIP code is required"),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(7, "Phone must be at least 7 characters"),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  promoCode: z.string().trim().optional(),
  items: z.array(orderItemInputSchema).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
