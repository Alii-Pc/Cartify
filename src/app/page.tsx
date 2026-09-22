import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { NewArrivals } from "@/components/landing/NewArrivals";
import { Bestsellers } from "@/components/landing/Bestsellers";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { CTA } from "@/components/landing/CTA";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

export const metadata: Metadata = {
  title: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
  description:
    "Explore Cartify's curated departments: handcrafted home decor, minimalist tech essentials, sustainable apparel, and botanical wellness. Honest pricing & free fast shipping.",
  keywords: [
    "curated lifestyle marketplace",
    "sustainable home decor online",
    "minimalist tech accessories",
    "modern living essentials",
    "clean skincare beauty",
    "artisan crafted goods",
    "honest prices e-commerce",
    "free fast shipping store",
    "easy 30-day returns",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
    description:
      "Explore Cartify's curated departments: handcrafted home decor, minimalist tech essentials, sustainable apparel, and botanical wellness. Honest pricing & free fast shipping.",
    url: siteUrl,
    type: "website",
    siteName: "Cartify",
    images: [
      {
        url: "/images/departments/hero_olive_bg.jpg",
        width: 1200,
        height: 630,
        alt: "Cartify Marketplace — Shop All, Curated for You",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartify — Curated Premium Home, Tech & Lifestyle Marketplace",
    description:
      "Explore Cartify's curated departments: handcrafted home decor, minimalist tech accessories, apparel, and botanical wellness.",
    images: ["/images/departments/hero_olive_bg.jpg"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cartify",
  url: siteUrl,
  logo: `${siteUrl}/images/products/table_lamp.jpg`,
  description:
    "Curated, premium home, tech, and lifestyle goods with sustainable craftsmanship and honest pricing.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "support@cartify.com",
    availableLanguage: ["en"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cartify",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/products?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const storeSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Cartify",
  url: siteUrl,
  description:
    "Curated premium online store offering home decor, electronics, apparel, kitchenware, and wellness essentials.",
  priceRange: "$$",
  paymentAccepted: "Credit Card, Stripe",
  currenciesAccepted: "USD",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Cartify Curated Catalog",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Home & Living",
      },
      {
        "@type": "OfferCatalog",
        name: "Apparel",
      },
      {
        "@type": "OfferCatalog",
        name: "Electronics",
      },
      {
        "@type": "OfferCatalog",
        name: "Health & Beauty",
      },
      {
        "@type": "OfferCatalog",
        name: "Kitchen & Dining",
      },
      {
        "@type": "OfferCatalog",
        name: "Sports & Outdoors",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, storeSchema]} />
      <Hero />
      <Categories />
      <NewArrivals />
      <Bestsellers />
      <FeaturedProducts />
      <CTA />
    </>
  );
}
