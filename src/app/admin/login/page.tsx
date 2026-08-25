import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader } from "@/components/ui/Loader";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login — Cartify Security Portal",
};

export default function AdminLoginPage() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-olive-950 flex flex-col items-center justify-center p-4">
      {/* Top Brand Link */}
      <div className="mb-6 flex items-center justify-between w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cream-100/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Store</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-olive-500/10 border border-olive-500/20 px-3 py-1 text-[11px] font-bold text-olive-300">
          <ShieldCheck className="h-3.5 w-3.5 text-olive-400" />
          <span>Security Gate</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <AuthCard
          title="Admin Portal"
          subtitle="Please enter your administrator credentials to continue."
        >
          <Suspense fallback={<Loader label="Loading security portal..." />}>
            <LoginForm showGoogleLogin={false} />
          </Suspense>
        </AuthCard>
      </div>

      <p className="text-[11px] text-cream-100/40 text-center mt-6">
        Cartify Secure Enterprise Access &bull; Protected by JWT & Role Guard
      </p>
    </div>
  );
}
