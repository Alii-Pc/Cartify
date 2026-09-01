"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  if (isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-between relative">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <AIChatWidget />
    </div>
  );
}
