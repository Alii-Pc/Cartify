import React from "react";
import { Leaf, ShieldCheck, HeartHandshake, PackageOpen } from "lucide-react";

export const metadata = {
  title: "About Us | Cartify",
  description: "Learn more about Cartify, our mission, and our core values.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl lg:text-5xl">
          About Cartify
        </h1>
        <p className="mt-4 text-sm text-charcoal-700/80 leading-relaxed sm:text-base">
          Our mission is to bring ethically sourced, artisanal goods directly to your home. 
          We believe in sustainable craftsmanship, transparent pricing, and unparalleled quality.
        </p>
      </div>

      {/* Hero Image / Brand Story */}
      <div className="mt-12 overflow-hidden rounded-3xl bg-olive-50 lg:mt-16 border border-olive-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 sm:p-12 lg:p-16 space-y-6">
            <h2 className="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl">
              Crafted with Purpose
            </h2>
            <p className="text-sm text-charcoal-700/80 leading-relaxed sm:text-base">
              Cartify started with a simple idea: everyday objects should be beautiful, functional, and sustainably made. We travel the world to partner with small-scale artisans and eco-conscious workshops.
            </p>
            <p className="text-sm text-charcoal-700/80 leading-relaxed sm:text-base">
              By cutting out the middlemen, we bring you exceptional ceramics, textiles, and wooden pieces at fair prices, while ensuring our creators are paid a living wage.
            </p>
          </div>
          <div className="relative h-64 w-full sm:h-80 lg:h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop" 
              alt="Handmade artisanal ceramics and home goods"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-olive-900/10 mix-blend-multiply transition-opacity hover:opacity-0 duration-500"></div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="mt-16 lg:mt-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl">
            Our Core Values
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-surface p-6 sm:p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-charcoal-900">Sustainable Materials</h3>
            <p className="text-xs text-charcoal-700/70 leading-relaxed">
              We use only ethically sourced clay, FSC-certified hardwoods, and non-toxic natural glazes in our products.
            </p>
          </div>

          <div className="card-surface p-6 sm:p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-charcoal-900">Built to Last</h3>
            <p className="text-xs text-charcoal-700/70 leading-relaxed">
              Fast fashion for the home is not our style. Our pieces are designed for longevity and timeless elegance.
            </p>
          </div>

          <div className="card-surface p-6 sm:p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-charcoal-900">Fair Trade</h3>
            <p className="text-xs text-charcoal-700/70 leading-relaxed">
              We guarantee living wages and safe working environments for all our artisanal partners globally.
            </p>
          </div>

          <div className="card-surface p-6 sm:p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <PackageOpen className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-charcoal-900">Zero-Waste Packaging</h3>
            <p className="text-xs text-charcoal-700/70 leading-relaxed">
              Our shipping materials are 100% recyclable or compostable to minimize our environmental footprint.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
