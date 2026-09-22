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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
    template: "%s | Cartify",
  },
  description:
    "Shop Cartify for curated premium home decor, minimalist tech accessories, organic apparel, and clean beauty wellness. Experience sustainable craftsmanship, honest pricing, fast free shipping, and 30-day easy returns.",
  keywords: [
    "Cartify",
    "curated online store",
    "premium home decor",
    "minimalist tech accessories",
    "sustainable lifestyle goods",
    "organic cotton apparel",
    "clean skincare wellness",
    "artisan kitchenware",
    "outdoor adventure gear",
    "honest transparent pricing",
    "everyday luxury essentials",
    "fast free shipping",
    "easy returns guarantee",
  ],
  authors: [{ name: "Cartify Curated Goods" }],
  creator: "Cartify",
  publisher: "Cartify Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cartify",
    title: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
    description:
      "Shop Cartify for curated premium home decor, minimalist tech accessories, organic apparel, and clean beauty wellness. Enjoy honest pricing, fast free shipping, and 30-day returns.",
    images: [
      {
        url: "/images/departments/hero_olive_bg.jpg",
        width: 1200,
        height: 630,
        alt: "Cartify — Curated Premium Home, Tech & Lifestyle Goods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
    description:
      "Shop curated premium home decor, minimalist tech accessories, apparel, and clean wellness at honest prices.",
    images: ["/images/departments/hero_olive_bg.jpg"],
    creator: "@cartify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { AppProviders } from "@/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
