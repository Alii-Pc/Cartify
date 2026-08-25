"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Eye,
  CreditCard,
  ChevronRight,
  Filter,
  DollarSign,
  Package,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { SafeReturnRequest, ReturnStatus } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  under_review: "bg-sky-100 text-sky-800",
  approved: "bg-indigo-100 text-indigo-800",
  rejected: "bg-red-100 text-red-800",
  pickup: "bg-purple-100 text-purple-800",
  received: "bg-emerald-100 text-emerald-800",
  refund_processing: "bg-amber-100 text-amber-800",
  refunded: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "requested", label: "Requested" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "pickup", label: "Pickup" },
  { value: "received", label: "Received" },
  { value: "refund_processing", label: "Refund Processing" },
  { value: "refunded", label: "Refunded" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<SafeReturnRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [refundStatus, setRefundStatus] = useState("");

  const { addToast } = useToast();

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (refundStatus) params.set("refundStatus", refundStatus);

      const res = await fetch(`/api/admin/returns?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setReturns(json.data.returns || []);
        setTotalPages(json.data.totalPages || 1);
        setCounts(json.data.counts || {});
      } else {
        addToast("error", json.message || "Failed to fetch returns");
      }
    } catch {
      addToast("error", "An error occurred while loading returns.");
    } finally {
      setLoading(false);
    }
  }, [page, q, status, refundStatus, addToast]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const pendingReviewCount = (counts.requested || 0) + (counts.under_review || 0);
  const inProgressCount = (counts.approved || 0) + (counts.pickup || 0) + (counts.received || 0);
  const refundedCount = counts.refunded || 0;
  const totalReturnsCount = counts.all || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
          <RotateCcw className="text-olive-600" />
          Return &amp; Refund Management
        </h1>
        <p className="text-charcoal-500 mt-1">
          Review customer return requests, update inspection statuses, and execute refunds.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5 bg-white rounded-xl border border-olive-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Total Returns</span>
            <Package className="h-4 w-4 text-olive-600" />
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{totalReturnsCount}</p>
          <p className="text-[11px] text-charcoal-400">All submitted returns</p>
        </div>

        <div className="admin-card p-5 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Action Needed</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{pendingReviewCount}</p>
          <p className="text-[11px] text-amber-700">Requested or Under Review</p>
        </div>

        <div className="admin-card p-5 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">In Progress / Pickup</span>
            <Truck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-900">{inProgressCount}</p>
          <p className="text-[11px] text-indigo-700">Approved, Pickup or Received</p>
        </div>

        <div className="admin-card p-5 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Refunded</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">{refundedCount}</p>
          <p className="text-[11px] text-emerald-700">Completed refunds</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card-surface bg-white rounded-xl border border-olive-100 shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <label htmlFor="search-returns" className="sr-only">Search returns</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 h-4 w-4" />
            <input
              id="search-returns"
              type="text"
              placeholder="Search by Return # or Order #..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 text-sm"
            />
          </div>
        </div>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by refund status"
          value={refundStatus}
          onChange={(e) => {
            setRefundStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white text-sm"
        >
          <option value="">All Refunds</option>
          <option value="pending">Pending Refund</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden bg-white rounded-xl border border-olive-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-50 text-charcoal-700 border-b border-olive-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Return #</th>
                <th className="px-6 py-4 font-semibold">Order #</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Refund Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader label="Loading returns..." />
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-charcoal-500">
                    No return requests matching your criteria.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret._id} className="hover:bg-olive-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-charcoal-900">
                      {ret.returnNumber}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-olive-800">
                      {ret.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-charcoal-800">
                      <p className="font-medium text-xs">{ret.user?.name || "Customer"}</p>
                      <p className="text-[11px] text-charcoal-400">{ret.user?.email || ""}</p>
                    </td>
                    <td className="px-6 py-4 text-charcoal-700 text-xs">
                      {ret.items.length} item{ret.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-bold text-charcoal-900">
                      ${ret.refundAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[ret.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ret.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 text-xs whitespace-nowrap">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/returns/${ret._id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-olive-700 hover:bg-olive-800 text-cream-50 px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-olive-200 bg-white disabled:opacity-50 font-medium text-charcoal-700 hover:bg-cream-100"
          >
            Previous
          </button>
          <span className="text-sm text-charcoal-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-olive-200 bg-white disabled:opacity-50 font-medium text-charcoal-700 hover:bg-cream-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
