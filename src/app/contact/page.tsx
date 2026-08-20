"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2, ChevronDown, AlertCircle } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";
const FAQS = [
  {
    question: "How long does shipping normally take?",
    answer:
      "All standard orders are processed within 1–2 business days. Standard shipping generally arrives in 3–5 business days, while express shipping arrives within 1–2 business days anywhere across the country.",
  },
  {
    question: "What is your 30-day return policy?",
    answer:
      "We want you to love what you ordered. If for any reason you aren't completely satisfied, return your undamaged item in its original packaging within 30 days of delivery for a full refund or exchange.",
  },
  {
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "Orders can be modified or cancelled within 2 hours of placement before our warehouse begins fulfillment. Simply contact our support team immediately with your order number.",
  },
  {
    question: "Are your ceramic and wood products sustainably crafted?",
    answer:
      "Yes! We partner exclusively with small-scale artisans and eco-conscious workshops who use ethically sourced clay, FSC-certified hardwoods, and non-toxic natural glazes.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Client-side quick check
    if (formData.message.trim().length < 10) {
      const msgError = "Message must be at least 10 characters long.";
      setError(msgError);
      setFieldErrors({ message: [msgError] });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          orderNumber: formData.orderNumber || undefined,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Failed to send message. Please check your input.");
        if (json.errors) {
          setFieldErrors(json.errors);
        }
        return;
      }

      setSubmitted(true);
      setFieldErrors({});
      setFormData({
        name: "",
        email: "",
        orderNumber: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl lg:text-5xl">
          We&apos;re here to help
        </h1>
        <p className="mt-4 text-sm text-charcoal-700/80 leading-relaxed sm:text-base">
          Got a question about an order, our craftsmanship, or shipping rates? Reach out to our customer care team and we will get back to you within 24 hours.
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
        <div className="card-surface p-5 flex flex-col items-center text-center space-y-3 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-100 text-olive-800 sm:h-12 sm:w-12">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-sm font-bold text-charcoal-900 sm:text-base">Email Us</h3>
          <p className="text-xs text-charcoal-700/70">Our team replies fast within 24h</p>
          <a href="mailto:support@cartify.com" className="text-xs font-semibold text-olive-800 hover:underline break-all">
            support@cartify.com
          </a>
        </div>

        <div className="card-surface p-5 flex flex-col items-center text-center space-y-3 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-100 text-olive-800 sm:h-12 sm:w-12">
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-sm font-bold text-charcoal-900 sm:text-base">Call Us</h3>
          <p className="text-xs text-charcoal-700/70">Mon – Fri from 9am to 6pm EST</p>
          <a href="tel:+15552348900" className="text-xs font-semibold text-olive-800 hover:underline">
            +1 (555) 234-8900
          </a>
        </div>

        <div className="card-surface p-5 flex flex-col items-center text-center space-y-3 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-100 text-olive-800 sm:h-12 sm:w-12">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-sm font-bold text-charcoal-900 sm:text-base">Visit Studio</h3>
          <p className="text-xs text-charcoal-700/70">E2 Block Johar Town</p>
          <span className="text-xs font-semibold text-charcoal-800">Lahore</span>
        </div>

        <button 
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
          className="card-surface p-5 flex flex-col items-center text-center space-y-3 sm:p-6 cursor-pointer hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-olive-500 hover:scale-[1.02]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-100 text-olive-800 sm:h-12 sm:w-12">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-sm font-bold text-charcoal-900 sm:text-base">Live Support</h3>
          <p className="text-xs text-charcoal-700/70">Chat with specialists online</p>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online Now
          </span>
        </button>
      </div>

      {/* Main Section: Form + FAQ */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-2 lg:items-start lg:gap-16">
        {/* Contact Form */}
        <div className="card-surface p-6 sm:p-8 lg:p-10">
          <h2 className="font-display text-xl font-bold text-charcoal-900 sm:text-2xl">
            Send our team a message
          </h2>
          <p className="mt-2 text-xs text-charcoal-700/70">
            Fill out the form below and we will route your inquiry right to the appropriate specialist.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-4 sm:p-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto sm:h-12 sm:w-12" />
              <h3 className="font-display text-base font-bold text-charcoal-900 sm:text-lg">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-charcoal-700/80 leading-relaxed">
                Thank you for reaching out. We&apos;ve sent a confirmation to your email address, and a specialist will reply within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-full bg-charcoal-900 px-6 py-2.5 text-xs font-semibold text-cream-50 hover:bg-charcoal-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.name[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Order Number <span className="text-charcoal-700/50 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CFY-842190"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                  />
                  {fieldErrors.orderNumber && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.orderNumber[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Subject Matter *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm text-charcoal-900 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status">Order Status &amp; Tracking</option>
                    <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                    <option value="Product Feedback">Product Feedback</option>
                  </select>
                  {fieldErrors.subject && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.subject[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help (minimum 10 characters)..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-olive-200 bg-white p-4 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors resize-none"
                />
                {fieldErrors.message && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.message[0]}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-olive-800 py-3.5 text-center font-display text-sm font-bold text-cream-50 shadow-md transition-all hover:bg-olive-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:py-4 sm:text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50 border-t-transparent" />
                    <span>Sending Message...</span>
                  </span>
                ) : (
                  <span>Submit Message</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQ Accordion Section */}
        <div id="faq" className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-charcoal-900 sm:text-2xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-xs text-charcoal-700/70">
              Quick answers to common questions about shipping, returns, and orders.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card-surface overflow-hidden border border-olive-100 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-display text-sm font-bold text-charcoal-900 hover:text-olive-800 sm:p-6 sm:text-base"
                  >
                    <span className="pr-2">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-olive-800 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-olive-100/60 px-4 pb-5 pt-3 text-xs leading-relaxed text-charcoal-700/80 bg-cream-50/40 sm:px-6 sm:pb-6 sm:text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
