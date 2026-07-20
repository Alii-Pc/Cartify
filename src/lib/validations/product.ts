import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(120, "Product name cannot exceed 120 characters")
    .trim(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .trim(),
  price: z.coerce
    .number()
    .positive("Price must be a positive number greater than 0"),
  compareAtPrice: z.coerce
    .number()
    .positive("Compare at price must be positive")
    .optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .trim()
    .toLowerCase(),
  images: z
    .array(z.string().min(1, "Image URL cannot be empty"))
    .min(1, "At least one product image is required"),
  rating: z.coerce
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating cannot exceed 5")
    .default(4.8),
  reviewCount: z.coerce
    .number()
    .int()
    .min(0, "Review count cannot be negative")
    .default(0),
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .default(25),
  featured: z.boolean().default(false),
  tag: z.enum(["New", "Sale", "Bestseller"]).nullable().optional(),
  specifications: z.record(z.string()).optional().default({}),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
