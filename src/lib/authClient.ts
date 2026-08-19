import type { ApiResponse, SafeUser } from "@/types";
import type {
  LoginInput,
  SignupInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function registerUser(
  input: SignupInput
): Promise<ApiResponse<SafeUser>> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<SafeUser>(res);
}

export async function loginUser(
  input: LoginInput
): Promise<ApiResponse<SafeUser>> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<SafeUser>(res);
}

export async function logoutUser(): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  return parseResponse<null>(res);
}

export async function fetchCurrentUser(): Promise<ApiResponse<SafeUser>> {
  const res = await fetch("/api/auth/me");
  return parseResponse<SafeUser>(res);
}

export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return parseResponse<null>(res);
}

export async function resendVerificationOtp(
  email: string
): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseResponse<null>(res);
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<null>(res);
}

export async function resetPassword(
  token: string,
  input: ResetPasswordInput
): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, ...input }),
  });
  return parseResponse<null>(res);
}

export async function loginWithGoogle(credential: string): Promise<ApiResponse<SafeUser>> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, action: "login" }),
  });
  return parseResponse<SafeUser>(res);
}

export async function linkGoogleAccount(credential: string): Promise<ApiResponse<null>> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, action: "link" }),
  });
  return parseResponse<null>(res);
}
