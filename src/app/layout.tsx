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
    default: "Cartify — Premium Home, Tech & Lifestyle Goods",
    template: "%s | Cartify",
  },
  description:
    "Shop curated, high-quality home, tech, and lifestyle essentials at honest prices. Enjoy free shipping over $50 and 30-day hassle-free returns at Cartify.",
  keywords: [
    "Cartify",
    "premium goods",
    "home decor",
    "tech accessories",
    "lifestyle products",
    "sustainable goods",
    "artisan crafted",
    "honest pricing",
    "everyday essentials",
  ],
  authors: [{ name: "Cartify" }],
  creator: "Cartify",
  publisher: "Cartify",
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
    title: "Cartify — Premium Home, Tech & Lifestyle Goods",
    description:
      "Shop curated, high-quality home, tech, and lifestyle essentials at honest prices. Enjoy free shipping over $50 and 30-day hassle-free returns.",
    images: [
      {
        url: "/images/products/table_lamp.jpg",
        width: 1200,
        height: 630,
        alt: "Cartify — Curated Premium Lifestyle & Home Goods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartify — Premium Home, Tech & Lifestyle Goods",
    description:
      "Shop curated, high-quality home, tech, and lifestyle essentials at honest prices.",
    images: ["/images/products/table_lamp.jpg"],
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
