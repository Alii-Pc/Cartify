import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { NewArrivals } from "@/components/landing/NewArrivals";
import { Bestsellers } from "@/components/landing/Bestsellers";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { CTA } from "@/components/landing/CTA";
import { AIChatWidget } from "@/components/chat/AIChatWidget";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <NewArrivals />
        <Bestsellers />
        <FeaturedProducts />
        <CTA />
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
