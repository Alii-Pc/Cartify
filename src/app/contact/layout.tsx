import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Customer Support",
  description:
    "Get in touch with Cartify's dedicated customer support. Inquire about orders, returns, wholesale partnerships, and craftsmanship.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Customer Support | Cartify",
    description:
      "Get in touch with Cartify's dedicated customer support. Inquire about orders, returns, wholesale partnerships, and craftsmanship.",
    url: "/contact",
    type: "website",
    siteName: "Cartify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us & Customer Support | Cartify",
    description:
      "Get in touch with Cartify's dedicated customer support. Fast responses within 24 hours.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
