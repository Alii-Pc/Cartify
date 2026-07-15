"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { forgotPassword } from "@/lib/authClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await forgotPassword(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setSuccessMessage(result.message ?? "Check your email for a reset link.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send reset link
      </Button>

      <p className="text-center text-sm text-charcoal-700/70">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-olive-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
