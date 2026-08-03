import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-playfair", // keep the variable name the same so tailwind config doesn't break
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cartify — Shopping, Simplified",
  description:
    "Cartify is a premium shopping experience — curated products, a calm matte-olive design, and a cart that never gets in your way.",
};

import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
