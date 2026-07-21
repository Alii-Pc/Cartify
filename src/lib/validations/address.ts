import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  addressLine1: z.string().trim().min(1, "Address is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zipCode: z.string().trim().min(1, "ZIP code is required"),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(7, "Phone must be at least 7 characters"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
