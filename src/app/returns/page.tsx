"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  RotateCcw,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  PlusCircle,
  Truck,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { SafeReturnRequest, ReturnStatus } from "@/types";

const RETURN_STATUS_TABS = ["all", "active", "completed", "cancelled"] as const;

export default function ReturnsHubPage() {
  const [returns, setReturns] = useState<SafeReturnRequest[]>([]);
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [mainView, setMainView] = useState<"returns" | "eligible">("returns");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [returnsRes, eligibleRes] = await Promise.all([
          fetch("/api/returns"),
          fetch("/api/returns/eligible-orders"),
        ]);

        const returnsJson = await returnsRes.json();
        const eligibleJson = await eligibleRes.json();

        if (returnsJson.success) {
          setReturns(returnsJson.data.returns || []);
        }
        if (eligibleJson.success) {
          setEligibleOrders(eligibleJson.data.orders || []);
        }
      } catch {
        setError("Failed to load return records.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  const filteredReturns = returns.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") {
      return ["requested", "under_review", "approved", "pickup", "received", "refund_processing"].includes(
        r.status
      );
    }
    if (activeTab === "completed") {
      return r.status === "refunded" || r.status === "rejected";
    }
    if (activeTab === "cancelled") {
      return r.status === "cancelled";
    }
    return true;
  });

  return (
    <ShopLayout>
      <div className="bg-cream-50 min-h-[85vh] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100/80 text-olive-800 text-xs font-bold uppercase tracking-wider mb-2">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Customer Care</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
                Returns & Refunds
              </h1>
              <p className="mt-1 text-sm text-charcoal-700/70">
                Manage your returns, check refund statuses, and submit new return requests.
              </p>
            </div>

            <Link
              href="/returns/new"
              className="inline-flex items-center gap-2 rounded-full bg-olive-800 px-6 py-3 text-sm font-bold text-cream-50 hover:bg-olive-900 transition-all shadow-sm hover:scale-[1.02] active:scale-98 self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Start New Return</span>
            </Link>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex border-b border-olive-200 mb-6 gap-8 text-sm font-bold">
            <button
              onClick={() => setMainView("returns")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                mainView === "returns"
                  ? "border-olive-800 text-olive-900"
                  : "border-transparent text-charcoal-500 hover:text-charcoal-900"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>My Return Requests ({returns.length})</span>
            </button>
            <button
              onClick={() => setMainView("eligible")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                mainView === "eligible"
                  ? "border-olive-800 text-olive-900"
                  : "border-transparent text-charcoal-500 hover:text-charcoal-900"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Eligible Orders for Return ({eligibleOrders.length})</span>
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
                <p className="text-sm font-medium text-charcoal-700/80">Loading returns data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : mainView === "returns" ? (
            /* Return Requests View */
            <div className="space-y-6">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {RETURN_STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "bg-olive-800 text-cream-50 shadow-xs"
                        : "bg-white text-charcoal-700 hover:bg-cream-100 border border-olive-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {filteredReturns.length === 0 ? (
                <div className="card-surface p-14 text-center flex flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-100 text-olive-800 mb-4">
                    <RotateCcw className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-charcoal-900">
                    No return requests found
                  </h3>
                  <p className="mt-1 text-xs text-charcoal-600 max-w-sm">
                    You have no {activeTab !== "all" ? activeTab : ""} returns on record.
                  </p>
                  {eligibleOrders.length > 0 && (
                    <button
                      onClick={() => setMainView("eligible")}
                      className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-olive-800 underline hover:text-olive-900"
                    >
                      <span>View {eligibleOrders.length} eligible delivered orders</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReturns.map((ret) => (
                    <div
                      key={ret._id}
                      className="card-surface overflow-hidden border border-olive-100 hover:shadow-sm transition-all"
                    >
                      {/* Top Bar */}
                      <div className="bg-cream-100/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-olive-100/70">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-charcoal-500">Return #</span>
                            <p className="font-mono font-bold text-charcoal-900">#{ret.returnNumber}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-charcoal-500">Order Reference</span>
                            <p className="font-mono font-bold text-olive-900">#{ret.orderNumber}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-charcoal-500">Estimated Refund</span>
                            <p className="font-display font-extrabold text-charcoal-900">${ret.refundAmount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge tone={getStatusTone(ret.status)}>
                            {ret.status.replace("_", " ")}
                          </Badge>

                          <Link
                            href={`/returns/${ret.returnNumber}`}
                            className="rounded-full bg-white border border-olive-200 px-3.5 py-1.5 text-xs font-bold text-olive-900 hover:bg-cream-100 flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Track Details</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="p-6">
                        <div className="divide-y divide-olive-100/60">
                          {ret.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                              <div className="h-12 w-12 rounded-lg bg-cream-100 border border-olive-100 overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-olive-800">Img</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-charcoal-900 truncate">{item.name}</p>
                                <p className="text-[11px] text-charcoal-500">
                                  Qty: {item.quantity} &bull; Reason: <strong className="capitalize">{item.reason.replace("_", " ")}</strong>
                                </p>
                              </div>
                              <p className="text-xs font-bold text-charcoal-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Eligible Delivered Orders View */
            <div className="space-y-4">
              {eligibleOrders.length === 0 ? (
                <div className="card-surface p-12 text-center">
                  <Package className="h-12 w-12 text-charcoal-400 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-charcoal-900">
                    No Eligible Orders Found
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-1 max-w-md mx-auto">
                    Only delivered orders within the standard return window (30 days) that haven&apos;t been returned yet are eligible.
                  </p>
                </div>
              ) : (
                eligibleOrders.map((order) => (
                  <div key={order._id} className="card-surface p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-charcoal-900">#{order.orderNumber}</span>
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                          Delivered
                        </span>
                        <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{order.daysRemaining} days left to return</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.items.map((item: any) => (
                          <div key={item.productId} className="flex items-center gap-2 bg-cream-100/60 border border-olive-100 rounded-lg p-1.5 pr-3">
                            <img src={item.image} alt={item.name} className="h-7 w-7 rounded object-cover" />
                            <span className="text-xs font-medium text-charcoal-800 truncate max-w-[180px]">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/returns/new?orderId=${order._id}`}
                      className="rounded-full bg-olive-800 px-5 py-2.5 text-xs font-bold text-cream-50 hover:bg-olive-900 transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                    >
                      <span>Select Items to Return</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
