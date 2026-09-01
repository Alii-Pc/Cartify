import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & FAQ",
  description:
    "Have questions about your order, shipping, or returns? Reach out to Cartify support or explore our frequently asked questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & FAQ | Cartify",
    description:
      "Have questions about your order, shipping, or returns? Reach out to Cartify support or explore our frequently asked questions.",
    url: "/contact",
    type: "website",
    siteName: "Cartify",
    images: [
      {
        url: "/images/products/table_lamp.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Cartify Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us & FAQ | Cartify",
    description:
      "Have questions about your order, shipping, or returns? Reach out to Cartify support.",
    images: ["/images/products/table_lamp.jpg"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
