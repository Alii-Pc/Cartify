"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  resendVerificationSchema,
  type ResendVerificationInput,
} from "@/lib/validations/auth";
import { resendVerificationEmail } from "@/lib/authClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ResendVerificationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = async (data: ResendVerificationInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const result = await resendVerificationEmail(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setSuccessMessage(result.message ?? "Verification email sent.");
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
        Resend verification email
      </Button>

      <p className="text-center text-sm text-charcoal-700/70">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-olive-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
