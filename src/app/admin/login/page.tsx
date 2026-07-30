import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader } from "@/components/ui/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login — Cartify",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthCard title="Admin Portal" subtitle="Log in to manage Cartify.">
          <Suspense fallback={<Loader label="Loading..." />}>
            <LoginForm />
          </Suspense>
        </AuthCard>
      </div>
    </div>
  );
}
