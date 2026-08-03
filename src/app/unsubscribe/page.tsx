"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MailMinus, ArrowRight } from "lucide-react";
import { ShopLayout } from "@/components/layout/ShopLayout";
import Link from "next/link";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("You have been successfully unsubscribed.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to unsubscribe. Please try again later.");
    }
  };

  return (
    <ShopLayout>
      <div className="flex min-h-[70vh] items-center justify-center bg-cream-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-olive-100/50 animate-slideUp">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                <MailMinus className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-bold text-charcoal-900">
                Unsubscribe
              </h1>
              <p className="mt-2 text-sm text-charcoal-700/80">
                We're sorry to see you go! Enter your email below to stop receiving newsletter updates.
              </p>
            </div>
            
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-4 animate-fadeIn">
                <div className="text-sm font-medium text-emerald-700 text-center mb-6 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 w-full">
                  {message}
                </div>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded-xl bg-olive-800 px-6 py-3 text-sm font-bold text-cream-50 transition-all hover:bg-olive-900 shadow-sm w-full"
                >
                  Return Home
                </Link>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    className="w-full rounded-xl border border-olive-200 bg-cream-50/50 px-5 py-3.5 text-sm text-charcoal-800 placeholder:text-charcoal-700/50 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-all disabled:opacity-50"
                    placeholder="Enter your email address"
                  />
                </div>
                
                {status === "error" && message && (
                  <div className="text-sm text-center text-red-500 font-medium">
                    {message}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{status === "loading" ? "Processing..." : "Unsubscribe"}</span>
                  {status !== "loading" && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
