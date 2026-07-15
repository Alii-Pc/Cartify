import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader } from "@/components/ui/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — Cartify",
};

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Log in to your Cartify account.">
      <Suspense fallback={<Loader label="Loading..." />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
