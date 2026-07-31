"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/components/ui/Toast";

import { SocketProvider } from "@/components/providers/SocketProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>{children}</ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SocketProvider>
  );
}
