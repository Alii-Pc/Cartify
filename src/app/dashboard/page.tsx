import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ShieldCheck, Mail, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Cartify",
};

// Defense in depth: middleware already blocks unauthenticated requests to
// /dashboard, but we re-verify here since this page also needs the user's
// data, and a server component should never trust the client blindly.
async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId);
  return user;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-olive-grain">
      <header className="border-b border-olive-100 bg-cream-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <p className="font-display text-xl font-semibold text-olive-800">
            Cart<span className="text-olive-500">ify</span>
          </p>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal-900">
          Welcome, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-charcoal-700/70">
          This is your protected Cartify dashboard — only visible after a
          verified login.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card-surface p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-charcoal-700/60">Email</p>
            <p className="mt-1 font-medium text-charcoal-900">{user.email}</p>
          </div>

          <div className="card-surface p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-charcoal-700/60">Verification</p>
            <p className="mt-1 font-medium text-charcoal-900">
              {user.isVerified ? "Verified" : "Not verified"}
            </p>
          </div>

          <div className="card-surface p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-charcoal-700/60">Member since</p>
            <p className="mt-1 font-medium text-charcoal-900">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
