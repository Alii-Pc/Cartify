"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginUser } from "@/lib/authClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setNeedsVerification(false);

    const result = await loginUser(data);

    if (!result.success) {
      setServerError(result.message);
      setNeedsVerification(result.message.toLowerCase().includes("verify"));
      return;
    }

    await refreshUser();
    
    let defaultRedirect = "/";
    if (window.location.pathname === "/admin/login") {
      defaultRedirect = "/admin";
    }
    const redirectTo = searchParams.get("redirectTo") || defaultRedirect;
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}
      {needsVerification && (
        <p className="text-sm text-charcoal-700/70">
          <Link
            href="/verify-email"
            className="font-medium text-olive-700 hover:underline"
          >
            Verify your email
          </Link>
        </p>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          {...register("password")}
          error={errors.password?.message}
        />
        <div className="mt-1.5 text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-olive-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Log in
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <GoogleLoginButton action="login" />

      <p className="text-center text-sm text-charcoal-700/70 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-olive-700 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
