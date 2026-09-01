import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { NewArrivals } from "@/components/landing/NewArrivals";
import { Bestsellers } from "@/components/landing/Bestsellers";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { CTA } from "@/components/landing/CTA";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

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

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema]} />
      <Hero />
      <Categories />
      <NewArrivals />
      <Bestsellers />
      <FeaturedProducts />
      <CTA />
    </>
  );
}


