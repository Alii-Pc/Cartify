import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyEmailStatus } from "@/components/auth/VerifyEmailStatus";
import { Loader } from "@/components/ui/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email \u2014 Cartify",
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email."
    >
      <Suspense fallback={<Loader label="Loading..." />}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthCard>
  );
}
