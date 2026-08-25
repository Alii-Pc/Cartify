"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Package,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  User,
  Calendar,
  MapPin,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { SafeReturnRequest, ReturnStatus } from "@/types";

const STATUS_OPTIONS: Array<{ value: ReturnStatus; label: string }> = [
  { value: "requested", label: "Requested" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "pickup", label: "Pickup Scheduled" },
  { value: "received", label: "Item Received & Inspected" },
  { value: "refund_processing", label: "Refund Processing" },
  { value: "refunded", label: "Refunded" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminReturnDetailPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const router = useRouter();
  const { addToast } = useToast();

  const [returnReq, setReturnReq] = useState<SafeReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // Form states
  const [status, setStatus] = useState<ReturnStatus>("requested");
  const [adminNotes, setAdminNotes] = useState("");
  const [timelineNote, setTimelineNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<"original_payment" | "store_credit" | "manual">("original_payment");

  // Pickup fields
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const fetchReturn = async () => {
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const data: SafeReturnRequest = json.data;
        setReturnReq(data);
        setStatus(data.status);
        setAdminNotes(data.adminNotes || "");
        setCustomRefundAmount(data.refundAmount);
        setRefundMethod(data.refundMethod);
        if (data.pickupDetails) {
          setCourier(data.pickupDetails.courier || "");
          setTrackingNumber(data.pickupDetails.trackingNumber || "");
          setScheduledDate(data.pickupDetails.scheduledDate ? (data.pickupDetails.scheduledDate.split("T")[0] || "") : "");
        }
      } else {
        addToast("error", json.message || "Failed to load return");
      }
    } catch {
      addToast("error", "Error loading return details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (returnId) {
      fetchReturn();
    }
  }, [returnId]);

  const handleUpdateStatus = async (newStatus: ReturnStatus, customNote?: string) => {
    setUpdating(true);
    try {
      const payload: any = {
        status: newStatus,
        adminNotes: adminNotes || undefined,
        timelineNote: customNote || timelineNote || undefined,
      };

      if (newStatus === "pickup") {
        payload.pickupDetails = {
          courier: courier || undefined,
          trackingNumber: trackingNumber || undefined,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        };
      }

      if (newStatus === "rejected") {
        payload.rejectionReason = rejectionReason || "Does not meet return eligibility criteria.";
      }

      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        addToast("success", `Return updated to ${newStatus.replace("_", " ").toUpperCase()}`);
        setTimelineNote("");
        setShowRejectModal(false);
        fetchReturn();
      } else {
        addToast("error", json.message || "Failed to update return");
      }
    } catch {
      addToast("error", "Error updating return status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotesOnly = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast("success", "Admin notes saved successfully");
      } else {
        addToast("error", json.message || "Failed to save notes");
      }
    } catch {
      addToast("error", "Error saving notes");
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessRefund = async () => {
    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/returns/${returnId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundAmount: customRefundAmount,
          refundMethod,
          note: `Refund processed by admin via ${refundMethod.replace("_", " ")}`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        addToast("success", `Refund of $${customRefundAmount.toFixed(2)} processed successfully!`);
        setShowRefundModal(false);
        fetchReturn();
      } else {
        addToast("error", json.message || "Failed to process refund");
      }
    } catch {
      addToast("error", "Error executing refund");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader label="Loading return inspector..." />
      </div>
    );
  }

  if (!returnReq) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-red-700">Return request not found.</p>
        <Link href="/admin/returns" className="btn-primary mt-4">
          Back to Returns List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/returns"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Returns</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-charcoal-900 font-mono">
              #{returnReq.returnNumber}
            </h1>
            <span className="bg-olive-100 text-olive-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              {returnReq.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Order Reference: <strong className="font-mono text-charcoal-800">#{returnReq.orderNumber}</strong> &bull; Submitted on {new Date(returnReq.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {returnReq.status === "requested" && (
            <>
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("approved", "Return approved by admin.")}
                className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
              >
                Approve Return
              </button>
              <button
                disabled={updating}
                onClick={() => setShowRejectModal(true)}
                className="rounded-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-xs font-bold shadow-xs transition-colors"
              >
                Reject Request
              </button>
            </>
          )}

          {returnReq.status === "approved" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("pickup", "Pickup scheduled for customer return.")}
              className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
            >
              Schedule Courier Pickup
            </button>
          )}

          {returnReq.status === "pickup" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("received", "Item received at warehouse and verified.")}
              className="btn-primary py-2 px-4 text-xs font-bold shadow-xs"
            >
              Mark Item Received
            </button>
          )}

          {returnReq.status === "received" && returnReq.refundStatus !== "completed" && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-cream-50 py-2 px-5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <DollarSign className="h-4 w-4" />
              <span>Process Refund (${returnReq.refundAmount.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Items, Proof & Customer Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Order Box */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-olive-700" />
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-700">
              <div>
                <p className="text-charcoal-400 font-medium">Name</p>
                <p className="font-bold text-charcoal-900 text-sm">{returnReq.user?.name || "Customer"}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium">Email</p>
                <p className="font-semibold text-charcoal-800">{returnReq.user?.email || "N/A"}</p>
              </div>
              {returnReq.pickupDetails?.address && (
                <div className="sm:col-span-2 pt-2 border-t border-olive-50">
                  <p className="text-charcoal-400 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-olive-700" />
                    <span>Pickup / Delivery Address</span>
                  </p>
                  <p className="font-medium text-charcoal-800 mt-0.5">{returnReq.pickupDetails.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Requested Items Box */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-olive-700" />
              <span>Items to Return ({returnReq.items.length})</span>
            </h2>

            <div className="divide-y divide-olive-100/60">
              {returnReq.items.map((item, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-cream-100 border border-olive-100 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-charcoal-400">Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal-900">{item.name}</p>
                    <p className="text-[11px] text-charcoal-500">
                      Qty: <strong>{item.quantity}</strong> &bull; Unit Price: ${item.price.toFixed(2)}
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

            <div className="flex justify-between items-center pt-3 border-t border-olive-100 text-xs font-bold">
              <span>Total Requested Refund:</span>
              <span className="font-display text-base text-olive-900">${returnReq.refundAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Proof Photos */}
          {returnReq.images && returnReq.images.length > 0 && (
            <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2">
                Attached Evidence Photos ({returnReq.images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {returnReq.images.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-lg border border-olive-200 overflow-hidden bg-white hover:opacity-90 transition-opacity block"
                  >
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Customer Note */}
          {returnReq.customerNote && (
            <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                Customer Comments
              </h2>
              <p className="text-xs text-charcoal-700 bg-cream-50 p-3 rounded-lg border border-olive-100 leading-relaxed italic">
                &ldquo;{returnReq.customerNote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Workflow Controls, Admin Notes & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Updater Box */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2">
              Manage Return Workflow
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  Change Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                  className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {status === "pickup" && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                  <p className="font-bold text-purple-900 text-[11px]">Courier Pickup Details</p>
                  <input
                    type="text"
                    placeholder="Courier Name (e.g. FedEx, DHL)"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Return Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded text-xs"
                  />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  Activity Timeline Note (Sent to Customer in Email)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package received and inspected in mint condition."
                  value={timelineNote}
                  onChange={(e) => setTimelineNote(e.target.value)}
                  className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white"
                />
              </div>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus(status)}
                className="w-full btn-primary py-2.5 text-xs font-bold justify-center"
              >
                {updating ? "Updating..." : "Apply Status Change"}
              </button>
            </div>
          </div>

          {/* Refund Details Box */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-olive-700" />
              <span>Refund Status</span>
            </h2>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Refund Total:</span>
                <span className="font-bold text-charcoal-900">${returnReq.refundAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Status:</span>
                <span className={`font-bold ${returnReq.refundStatus === "completed" ? "text-emerald-700" : "text-amber-700"}`}>
                  {returnReq.refundStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Method:</span>
                <span className="capitalize">{returnReq.refundMethod.replace("_", " ")}</span>
              </div>
              {returnReq.refundTransactionId && (
                <div className="flex justify-between border-t border-olive-50 pt-1">
                  <span className="text-charcoal-500">Transaction Ref:</span>
                  <span className="font-mono text-[11px] text-charcoal-800">{returnReq.refundTransactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Internal Admin Notes */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-olive-700" />
              <span>Internal Admin Notes</span>
            </h2>
            <textarea
              rows={3}
              placeholder="Private notes for staff only (not visible to customer)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-olive-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-olive-500"
            />
            <div className="flex justify-end">
              <button
                disabled={updating}
                onClick={handleSaveNotesOnly}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-cream-50 text-xs font-semibold hover:bg-charcoal-900 transition-colors flex items-center gap-1"
              >
                <Save className="h-3 w-3" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 border-b border-olive-100 pb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-olive-700" />
              <span>Audit History</span>
            </h2>

            <div className="relative pl-5 border-l-2 border-olive-200 space-y-3.5 text-xs ml-2">
              {returnReq.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full bg-olive-700 ring-4 ring-white" />
                  <p className="font-bold text-charcoal-900">{event.title}</p>
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(event.timestamp).toLocaleString()} &bull; By {event.updatedBy || "system"}
                  </p>
                  {event.note && <p className="text-[11px] text-charcoal-600 mt-0.5">{event.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <h3 className="font-display font-bold text-lg text-charcoal-900">Reject Return Request</h3>
            </div>
            <p className="text-xs text-charcoal-600">
              Please enter the reason for rejecting this return. This will be sent directly to the customer.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Return window expired or items show signs of excessive wear..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-gray-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating || !rejectionReason.trim()}
                onClick={() => handleUpdateStatus("rejected")}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {updating ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-2 text-emerald-700">
              <CreditCard className="h-6 w-6" />
              <h3 className="font-display font-bold text-lg text-charcoal-900">Process Customer Refund</h3>
            </div>
            <p className="text-xs text-charcoal-600">
              Execute a payout for Order <strong className="font-mono">#{returnReq.orderNumber}</strong>. If original payment was Stripe, this will trigger the Stripe Refunds API.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customRefundAmount}
                  onChange={(e) => setCustomRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-olive-200 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  Refund Channel
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as any)}
                  className="w-full p-2.5 border border-olive-200 rounded-lg bg-white"
                >
                  <option value="original_payment">Original Payment Method (Stripe/Card)</option>
                  <option value="store_credit">Store Credit / Discount Coupon</option>
                  <option value="manual">Manual / Bank Transfer / Cash Refund</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-olive-100">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-gray-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={refunding || customRefundAmount <= 0}
                onClick={handleProcessRefund}
                className="px-6 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-full transition-colors shadow-sm disabled:opacity-50"
              >
                {refunding ? "Processing Refund..." : `Issue $${customRefundAmount.toFixed(2)} Refund`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
