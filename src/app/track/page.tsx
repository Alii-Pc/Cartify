"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShopLayout } from "@/components/layout/ShopLayout";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface TrackingEvent {
  status: string;
  title: string;
  description?: string;
  location?: string;
  timestamp: string;
}

interface TrackingData {
  orderNumber: string;
  status: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery: string;
  shippedAt?: string;
  deliveredAt?: string;
  destination: {
    city?: string;
    state?: string;
    country?: string;
  };
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    image: string;
  }>;
  history: TrackingEvent[];
}

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const initialQuery = searchParams.get("q") || searchParams.get("orderNumber") || "";
  const [query, setQuery] = useState(initialQuery);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tracking?q=${encodeURIComponent(searchTerm.trim())}`);
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setTrackingData(json.data);
      } else {
        setTrackingData(null);
        setError(json.message || "No shipment record found for this number.");
      }
    } catch {
      setError("An error occurred while retrieving tracking information.");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/track?q=${encodeURIComponent(query.trim())}`);
    fetchTracking(query);
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast("success", "Tracking number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return ORDER_STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIndex = trackingData ? getStepIndex(trackingData.status) : -1;

  return (
    <div className="bg-cream-50 min-h-[85vh] py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Hero & Search Box */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-olive-100 text-olive-800 mb-4 shadow-2xs">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
            Track Your Parcel
          </h1>
          <p className="mt-2 text-sm text-charcoal-700/70 max-w-md mx-auto">
            Enter your <strong>Order Number</strong> (e.g. <span className="font-mono text-olive-800">CFY-7K9A2X</span>) or <strong>Tracking Code</strong> to get live delivery updates.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
              <input
                type="text"
                placeholder="e.g. CFY-A1B2C3 or TRK-98234729"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-olive-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-olive-800 px-7 py-3.5 text-sm font-bold text-cream-50 hover:bg-olive-900 transition-all shadow-sm hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="card-surface p-8 text-center max-w-xl mx-auto my-6 border border-red-100 bg-red-50/40 animate-fadeIn">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-red-900 mb-1">Shipment Not Found</h3>
            <p className="text-xs text-red-700/80 mb-4">{error}</p>
            <p className="text-[11px] text-charcoal-600">
              Please double check the order number or check your email confirmation receipt.
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card-surface p-8 space-y-6 max-w-3xl mx-auto">
            <div className="h-6 w-48 bg-olive-100/70 rounded-md animate-pulse" />
            <div className="h-20 w-full bg-olive-100/50 rounded-xl animate-pulse" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-olive-100/60 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-olive-100/60 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-olive-100/60 rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Tracking Results Card */}
        {trackingData && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Shipment Card */}
            <div className="card-surface p-6 sm:p-8 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-olive-100/70">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                    Order Reference
                  </span>
                  <h2 className="font-display text-2xl font-bold text-charcoal-900 font-mono">
                    #{trackingData.orderNumber}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="bg-olive-50 border border-olive-200/80 rounded-full px-3 py-1 text-xs font-semibold text-olive-850 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-olive-700" />
                    <span>{trackingData.courier}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyTracking(trackingData.trackingNumber)}
                    className="bg-white border border-olive-200 rounded-full px-3 py-1 text-xs font-mono text-charcoal-800 hover:bg-cream-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Copy Tracking Number"
                  >
                    <span>{trackingData.trackingNumber}</span>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-charcoal-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Delivery Estimation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 text-xs">
                <div className="space-y-1">
                  <p className="text-charcoal-500 uppercase tracking-wider font-semibold text-[10px]">
                    Current Status
                  </p>
                  <p className="font-display font-bold text-base text-olive-900 capitalize">
                    {trackingData.status.replace("_", " ")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-charcoal-500 uppercase tracking-wider font-semibold text-[10px]">
                    Estimated Delivery
                  </p>
                  <p className="font-semibold text-charcoal-900 text-sm flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-olive-700" />
                    <span>{new Date(trackingData.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-charcoal-500 uppercase tracking-wider font-semibold text-[10px]">
                    Destination
                  </p>
                  <p className="font-semibold text-charcoal-900 text-sm flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-olive-700" />
                    <span>{trackingData.destination.city || "Recipient City"}, {trackingData.destination.country || ""}</span>
                  </p>
                </div>
              </div>

              {/* Horizontal / Stepper Progress Bar */}
              <div className="pt-6 border-t border-olive-100/70">
                <p className="text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-6">
                  Shipment Progress
                </p>

                {/* Progress Stepper for Desktop */}
                <div className="hidden md:flex items-center justify-between relative mb-8 px-2">
                  <div className="absolute left-6 right-6 top-4 h-1 bg-olive-100 -z-0" />
                  {currentStepIndex >= 0 && (
                    <div
                      className="absolute left-6 top-4 h-1 bg-olive-700 -z-0 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentStepIndex / (ORDER_STEPS.length - 1)) * 100
                        )}%`,
                      }}
                    />
                  )}

                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? "bg-olive-800 border-olive-800 text-cream-50"
                              : "bg-white border-olive-200 text-charcoal-400"
                          } ${isCurrent ? "ring-4 ring-olive-200 shadow-sm scale-110" : ""}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-[11px] font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${
                            isCurrent
                              ? "text-olive-900 font-bold"
                              : isCompleted
                              ? "text-charcoal-800"
                              : "text-charcoal-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Journey Timeline */}
            <div className="card-surface p-6 sm:p-8">
              <h3 className="font-display text-base font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-olive-750" />
                <span>Tracking History</span>
              </h3>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-olive-200 space-y-8 ml-3">
                {trackingData.history.map((event, idx) => {
                  const isLatest = idx === trackingData.history.length - 1;

                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-0 h-7 w-7 rounded-full flex items-center justify-center border-2 ${
                          isLatest
                            ? "bg-olive-800 border-olive-800 text-cream-50 shadow-sm"
                            : "bg-cream-100 border-olive-300 text-olive-700"
                        }`}
                      >
                        {isLatest ? (
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-olive-700" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className={`text-sm font-bold ${isLatest ? "text-olive-900" : "text-charcoal-900"}`}>
                            {event.title}
                          </h4>
                          <span className="text-[11px] font-medium text-charcoal-500">
                            {new Date(event.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-xs text-charcoal-700/80 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {event.location && (
                          <p className="text-[11px] font-semibold text-olive-800 flex items-center gap-1 pt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Package Items & Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-surface p-6">
                <h3 className="font-display text-sm font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-olive-700" />
                  <span>Items in this Shipment ({trackingData.itemCount})</span>
                </h3>
                <div className="space-y-3">
                  {trackingData.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cream-200/50 border border-olive-100 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-olive-800">Pkg</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-charcoal-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-charcoal-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-surface p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-charcoal-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-olive-700" />
                    <span>Need Help with this Order?</span>
                  </h3>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Have questions about courier delivery or need to return an eligible item? Our customer care is here to help 24/7.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-olive-100/60 mt-4">
                  <a
                    href="/contact"
                    className="flex-1 rounded-full border border-olive-300 bg-white py-2.5 text-center text-xs font-semibold text-olive-900 hover:bg-cream-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a
                    href={`/returns/new?orderNumber=${trackingData.orderNumber}`}
                    className="flex-1 rounded-full bg-olive-800 py-2.5 text-center text-xs font-semibold text-cream-50 hover:bg-olive-900 transition-colors"
                  >
                    Request Return
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <ShopLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-700 border-t-transparent" />
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </ShopLayout>
  );
}
