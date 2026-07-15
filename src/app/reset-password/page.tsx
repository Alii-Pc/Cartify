import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Loader } from "@/components/ui/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — Cartify",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <Suspense fallback={<Loader label="Loading..." />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
