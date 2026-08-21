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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-olive-grain">
      <AuthCard title="Admin Portal" subtitle="Log in to manage Cartify.">
        <Suspense fallback={<Loader label="Loading..." />}>
          <LoginForm showGoogleLogin={false} />
        </Suspense>
      </AuthCard>
    </div>
  );
}
