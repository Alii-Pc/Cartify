import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
      {/* Minimal Header */}
      <header className="border-b border-olive-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-charcoal-900 hover:opacity-85">
            Cart<span className="text-olive-700">ify</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-700/80">
            <ShieldCheck className="h-4 w-4 text-olive-700" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="border-t border-olive-100 bg-white/40 py-6 text-center text-xs text-charcoal-700/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Cartify. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-charcoal-900">Support</Link>
            <Link href="/products" className="hover:text-charcoal-900">Continue Shopping</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
