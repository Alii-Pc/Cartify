"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/authClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);

    const result = await registerUser(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    if (result.data?.isVerified) {
      router.push("/login?verified=true");
    } else {
      // Redirect to the OTP verification page with the email pre-filled
      const email = encodeURIComponent(data.email);
      router.push(`/verify-email?email=${email}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && <Alert type="error" message={serverError} />}

      <Input
        label="Full name"
        placeholder="Ali Husnain"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        {...register("password")}
        error={errors.password?.message}
      />
      <Input
        label="Confirm password"
        type="password"
        placeholder="Re-enter your password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create account
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
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-olive-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
