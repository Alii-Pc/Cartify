import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Explore our thoughtfully curated collections. From minimalist living decor to premium everyday essentials, discover what speaks to you.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Shop by Category | Cartify",
    description:
      "Explore our thoughtfully curated collections across modern home decor, apparel, wellness, and tech essentials.",
    url: "/categories",
    type: "website",
    siteName: "Cartify",
    images: [
      {
        url: "/images/products/table_lamp.jpg",
        width: 1200,
        height: 630,
        alt: "Cartify Categories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop by Category | Cartify",
    description:
      "Explore our thoughtfully curated collections across modern home decor, apparel, wellness, and tech essentials.",
    images: ["/images/products/table_lamp.jpg"],
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
