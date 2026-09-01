import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Collection — All Products",
  description:
    "Discover our curated catalog of everyday essentials, home goods, and tech accessories designed for durability, simplicity, and delight.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Explore Collection — All Products | Cartify",
    description:
      "Discover our curated catalog of everyday essentials, home goods, and tech accessories designed for durability, simplicity, and delight.",
    url: "/products",
    type: "website",
    siteName: "Cartify",
    images: [
      {
        url: "/images/products/table_lamp.jpg",
        width: 1200,
        height: 630,
        alt: "Cartify Products Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Collection — All Products | Cartify",
    description:
      "Discover our curated catalog of everyday essentials, home goods, and tech accessories.",
    images: ["/images/products/table_lamp.jpg"],
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
