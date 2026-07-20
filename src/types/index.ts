export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | undefined;
  isVerified: boolean;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string | undefined;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]> | undefined;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface JwtPayload {
  userId: string;
  email: string;
  role?: "user" | "admin" | undefined;
}

export interface UploadResponse {
  url: string;
  public_id: string;
  width?: number | undefined;
  height?: number | undefined;
  format?: string | undefined;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}


// Product & Category Types
export type ProductTag = "New" | "Sale" | "Bestseller" | null;

export interface SafeCategory {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  productCount?: number | undefined;
}

export interface SafeProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | undefined;
  category: string; // category slug
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  tag?: ProductTag | undefined;
  specifications?: Record<string, string> | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponse {
  products: SafeProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories?: SafeCategory[] | undefined;
}

export interface ProductFiltersState {
  q: string;
  category: string; // comma-separated or single slug
  minPrice: string;
  maxPrice: string;
  tag: string;
  inStock: boolean;
  sort: "newest" | "price_asc" | "price_desc" | "rating";
  page: number;
}
