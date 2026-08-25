"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { SafeReturnRequest, ReturnStatus } from "@/types";

const RETURN_STEPS: Array<{ key: ReturnStatus; label: string }> = [
  { key: "requested", label: "Requested" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "pickup", label: "Pickup" },
  { key: "received", label: "Received" },
  { key: "refund_processing", label: "Processing" },
  { key: "refunded", label: "Refunded" },
];

export default function ReturnDetailPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const router = useRouter();
  const { addToast } = useToast();

  const [returnReq, setReturnReq] = useState<SafeReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchReturnDetails = async () => {
    try {
      const res = await fetch(`/api/returns/${returnId}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setReturnReq(json.data);
      } else {
        setError(json.message || "Failed to load return details");
      }
    } catch {
      setError("An error occurred while loading return details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (returnId) {
      fetchReturnDetails();
    }
  }, [returnId]);

  const handleCancelReturn = async () => {
    if (!confirm("Are you sure you want to cancel this return request?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/returns/${returnId}/cancel`, {
        method: "PUT",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast("success", "Return request cancelled.");
        fetchReturnDetails();
      } else {
        addToast("error", json.message || "Failed to cancel return request");
      }
    } catch {
      addToast("error", "Error cancelling return request");
    } finally {
      setCancelling(false);
    }
  };

  const getStepIndex = (status: ReturnStatus) => {
    if (status === "rejected" || status === "cancelled") return -1;
    return RETURN_STEPS.findIndex((s) => s.key === status);
  };

  const getStatusTone = (status: ReturnStatus): BadgeTone => {
    switch (status) {
      case "refunded":
      case "approved":
        return "olive";
      case "requested":
      case "under_review":
      case "pickup":
      case "received":
      case "refund_processing":
        return "amber";
      case "rejected":
        return "red";
      case "cancelled":
      default:
        return "charcoal";
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
            <p className="text-sm font-medium text-charcoal-700/85">Loading return details...</p>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (error || !returnReq) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
            <p className="text-sm font-semibold text-red-700">{error || "Return record not found"}</p>
            <Link
              href="/returns"
              className="mt-6 inline-block rounded-full bg-olive-800 px-6 py-2.5 text-xs font-semibold text-cream-50 hover:bg-olive-900 transition-all"
            >
              Back to Returns
            </Link>
          </div>
        </div>
      </ShopLayout>
    );
  }

  const currentStepIdx = getStepIndex(returnReq.status);
  const isCancelled = returnReq.status === "cancelled";
  const isRejected = returnReq.status === "rejected";

  return (
    <ShopLayout>
      <div className="bg-cream-50 min-h-[85vh] py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
          {/* Back button */}
          <div>
            <Link
              href="/returns"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-olive-800 hover:text-olive-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Returns Dashboard</span>
            </Link>
          </div>

          {/* Header Card */}
          <div className="card-surface p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-olive-100/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  Return Request
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-900 font-mono">
                  #{returnReq.returnNumber}
                </h1>
                <p className="text-xs text-charcoal-600 mt-1">
                  For Order <Link href={`/orders/${returnReq.orderNumber}`} className="font-bold text-olive-800 underline">#{returnReq.orderNumber}</Link> &bull; Submitted on {new Date(returnReq.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={getStatusTone(returnReq.status)}>
                  {returnReq.status.replace("_", " ")}
                </Badge>

                {["requested", "under_review"].includes(returnReq.status) && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelReturn}
                    className="rounded-full bg-white border border-red-200 text-red-600 px-4 py-1.5 text-xs font-bold hover:bg-red-50 transition-colors shadow-2xs"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Request"}
                  </button>
                )}
              </div>
            </div>

            {/* Special Rejection / Cancellation Alert */}
            {isRejected && (
              <div className="my-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Return Request Rejected</span>
                </div>
                {returnReq.rejectionReason && (
                  <p className="pl-5 text-red-800">
                    Reason: <strong>{returnReq.rejectionReason}</strong>
                  </p>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="my-6 p-4 rounded-xl bg-charcoal-100/70 border border-charcoal-200 text-xs text-charcoal-800 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-charcoal-500" />
                <span>This return request was cancelled by you.</span>
              </div>
            )}

            {/* Stepper Progress Bar */}
            {!isCancelled && !isRejected && (
              <div className="pt-6">
                <div className="hidden sm:flex items-center justify-between relative mb-4 px-2">
                  <div className="absolute left-6 right-6 top-4 h-1 bg-olive-100 -z-0" />
                  {currentStepIdx >= 0 && (
                    <div
                      className="absolute left-6 top-4 h-1 bg-olive-700 -z-0 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentStepIdx / (RETURN_STEPS.length - 1)) * 100
                        )}%`,
                      }}
                    />
                  )}

                  {RETURN_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

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
                          className={`text-[10px] mt-2 font-semibold text-center whitespace-nowrap ${
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
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Returned Items & Pickup Details (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              {/* Items Card */}
              <div className="card-surface p-6">
                <h3 className="font-display text-sm font-bold text-charcoal-900 mb-4 pb-2 border-b border-olive-100/70 flex items-center gap-2">
                  <Package className="h-4 w-4 text-olive-700" />
                  <span>Items Requested for Return ({returnReq.items.length})</span>
                </h3>

                <div className="divide-y divide-olive-100/60">
                  {returnReq.items.map((item, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4">
                      <div className="h-14 w-14 rounded-lg bg-cream-100 border border-olive-100 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-olive-800">Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} className="text-xs font-bold text-charcoal-900 hover:text-olive-800 transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">
                          Quantity: <strong>{item.quantity}</strong> &bull; ${item.price.toFixed(2)} each
                        </p>
                        <p className="text-[11px] text-olive-800 mt-1 font-semibold">
                          Reason: <span className="capitalize">{item.reason.replace("_", " ")}</span>
                        </p>
                        {item.reasonDetails && (
                          <p className="text-[11px] text-charcoal-600 italic mt-0.5">&ldquo;{item.reasonDetails}&rdquo;</p>
                        )}
                      </div>
                      <p className="text-xs font-bold text-charcoal-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup & Courier Details */}
              {returnReq.pickupDetails && (
                <div className="card-surface p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-charcoal-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-olive-700" />
                    <span>Courier Pickup Details</span>
                  </h3>
                  <div className="text-xs text-charcoal-700 space-y-2 bg-cream-50 p-4 rounded-xl border border-olive-100">
                    {returnReq.pickupDetails.courier && (
                      <p><strong>Carrier:</strong> {returnReq.pickupDetails.courier}</p>
                    )}
                    {returnReq.pickupDetails.trackingNumber && (
                      <p><strong>Tracking #:</strong> <span className="font-mono">{returnReq.pickupDetails.trackingNumber}</span></p>
                    )}
                    {returnReq.pickupDetails.scheduledDate && (
                      <p><strong>Scheduled Date:</strong> {new Date(returnReq.pickupDetails.scheduledDate).toLocaleDateString()}</p>
                    )}
                    {returnReq.pickupDetails.address && (
                      <p><strong>Pickup Address:</strong> {returnReq.pickupDetails.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Proof Photos Gallery */}
              {returnReq.images && returnReq.images.length > 0 && (
                <div className="card-surface p-6 space-y-3">
                  <h3 className="font-display text-sm font-bold text-charcoal-900 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-olive-700" />
                    <span>Attached Proof Photos</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {returnReq.images.map((imgUrl, i) => (
                      <a
                        key={i}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-xl overflow-hidden border border-olive-200 bg-white hover:opacity-90 transition-opacity block"
                      >
                        <img src={imgUrl} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Refund Summary & Timeline (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              {/* Refund Summary Card */}
              <div className="card-surface p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-charcoal-900 border-b border-olive-100/70 pb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-olive-700" />
                  <span>Refund Overview</span>
                </h3>

                <dl className="space-y-2 text-xs text-charcoal-700">
                  <div className="flex justify-between">
                    <dt className="text-charcoal-500">Refund Amount:</dt>
                    <dd className="font-display font-extrabold text-base text-olive-900">${returnReq.refundAmount.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal-500">Refund Status:</dt>
                    <dd className="font-bold capitalize">{returnReq.refundStatus}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal-500">Resolution:</dt>
                    <dd className="font-medium capitalize">{returnReq.refundMethod.replace("_", " ")}</dd>
                  </div>
                  {returnReq.refundTransactionId && (
                    <div className="flex justify-between pt-1 border-t border-olive-100/60">
                      <dt className="text-charcoal-500">Transaction ID:</dt>
                      <dd className="font-mono text-[11px]">{returnReq.refundTransactionId}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Status History Timeline */}
              <div className="card-surface p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-charcoal-900 border-b border-olive-100/70 pb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-olive-700" />
                  <span>Activity History</span>
                </h3>

                <div className="relative pl-5 border-l-2 border-olive-200 space-y-4 text-xs ml-2">
                  {returnReq.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full bg-olive-700 ring-4 ring-white" />
                      <p className="font-bold text-charcoal-900">{event.title}</p>
                      <p className="text-[10px] text-charcoal-400">
                        {new Date(event.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {event.note && (
                        <p className="text-[11px] text-charcoal-600 mt-1 leading-relaxed">{event.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
