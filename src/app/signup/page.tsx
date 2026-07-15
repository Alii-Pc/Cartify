import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — Cartify",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to start shopping with Cartify."
    >
      <SignupForm />
    </AuthCard>
  );
}
