"use client";

import React from "react";
import { ArrowRight, Mail } from "lucide-react";

export function CTA() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <section id="newsletter" className="relative w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] relative shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80"
            alt="Interior lifestyle aesthetic"
            className="h-full w-full object-cover"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-olive-950/90 to-olive-900/60 mix-blend-multiply" />
        </div>

        {/* Content Container (Glassmorphism) */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 p-8 sm:p-16 lg:p-20">
          <div className="max-w-xl text-cream-50 text-center md:text-left animate-slideUp">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              Join the Collective
            </h2>
            <p className="mt-6 text-base sm:text-lg text-cream-100/90 leading-relaxed font-medium">
              Subscribe to receive early access to seasonal curations, exclusive discounts, and thoughtful stories on intentional living.
            </p>
            
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-cream-50/80 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"/> 10% Off First Order</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>Weekly Digest</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>Zero Spam</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-md shrink-0 rounded-3xl bg-white/10 p-2 shadow-2xl backdrop-blur-xl border border-white/20 animate-fadeIn">
            <div className="rounded-2xl bg-white/95 p-6 sm:p-8 shadow-inner">
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-100">
                  <Mail className="h-5 w-5 text-olive-800" />
                </div>
                <h3 className="font-display text-xl font-bold text-charcoal-900">
                  Subscribe
                </h3>
              </div>
              
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading" || status === "success"}
                    className="w-full rounded-xl border border-olive-200 bg-cream-50/50 px-5 py-3.5 text-sm text-charcoal-800 placeholder:text-charcoal-700/50 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-all disabled:opacity-50"
                    placeholder="Enter your email address"
                  />
                </div>
                {message && (
                  <div className={`text-sm text-center ${status === "success" ? "text-green-600" : "text-red-500"}`}>
                    {message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-olive-800 px-5 py-3.5 text-sm font-bold text-cream-50 transition-all hover:bg-olive-900 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed!" : "Unlock Access"}</span>
                  {status !== "loading" && status !== "success" && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>
              <p className="mt-5 text-center text-[11px] text-charcoal-700/60 leading-tight">
                By subscribing, you agree to our Terms of Service and Privacy Policy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
