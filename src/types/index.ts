export interface SafeUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface JwtPayload {
  userId: string;
  email: string;
}
