import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyEmailStatus } from "@/components/auth/VerifyEmailStatus";
import { Loader } from "@/components/ui/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email — Cartify",
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Email verification"
      subtitle="Confirming your email address."
    >
      <Suspense fallback={<Loader label="Loading..." />}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthCard>
  );
}
