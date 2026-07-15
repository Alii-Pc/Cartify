import { AuthCard } from "@/components/auth/AuthCard";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Verification — Cartify",
};

export default function ResendVerificationPage() {
  return (
    <AuthCard
      title="Resend verification email"
      subtitle="Enter your email and we'll send a new verification link."
    >
      <ResendVerificationForm />
    </AuthCard>
  );
}
