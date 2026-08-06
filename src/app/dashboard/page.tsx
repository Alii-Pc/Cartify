import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { LogoutButton } from "@/components/auth/LogoutButton";
import DashboardTabs from "./DashboardTabs";
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

        <DashboardTabs 
          user={{
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
            createdAt: user.createdAt.toISOString()
          }} 
        />
      </main>
    </div>
  );
}
