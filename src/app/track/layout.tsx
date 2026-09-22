import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order — Real-Time Shipment Status",
  description:
    "Track your Cartify package in real-time. Enter your order tracking ID to view live carrier updates, estimated delivery dates, and shipping timeline.",
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: "Track Your Order — Real-Time Shipment Status | Cartify",
    description:
      "Track your Cartify package in real-time. Enter your order tracking ID to view live carrier updates, estimated delivery dates, and shipping timeline.",
    url: "/track",
    type: "website",
    siteName: "Cartify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Your Order — Real-Time Shipment Status | Cartify",
    description:
      "Track your Cartify package in real-time. View live carrier updates and delivery dates.",
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
