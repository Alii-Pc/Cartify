"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { resetPassword } from "@/lib/authClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Alert
          type="error"
          message="No reset token was provided. Request a new reset link."
        />
        <Link href="/forgot-password" className="w-full">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await resetPassword(token, data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setSuccessMessage(result.message ?? "Password reset successfully.");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <Input
        label="New password"
        type="password"
        placeholder="At least 8 characters"
        {...register("password")}
        error={errors.password?.message}
      />
      <Input
        label="Confirm new password"
        type="password"
        placeholder="Re-enter your new password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Reset password
      </Button>
    </form>
  );
}
