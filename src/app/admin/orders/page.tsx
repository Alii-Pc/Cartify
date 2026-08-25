"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronDown, ChevronUp, Search, Truck, MapPin, Clock, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";
import { SafeOrder } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-olive-100 text-olive-800",
  processing: "bg-sky-100 text-sky-800",
  packed: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-teal-100 text-teal-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-sky-100 text-sky-800",
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<SafeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination and Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Tracking state per expanded order
  const [trackingForm, setTrackingForm] = useState<Record<string, {
    courier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    eventTitle: string;
    eventLocation: string;
    eventDescription: string;
  }>>({});

  const { addToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.orders);
        setTotalPages(json.data.totalPages);
      }
    } catch (error) {
      addToast("error", "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [page, q, status, paymentStatus, addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateTrackingField = (orderId: string, field: string, value: string) => {
    setTrackingForm((tf) => {
      const current = tf[orderId] || {
        courier: "",
        trackingNumber: "",
        estimatedDelivery: "",
        eventTitle: "",
        eventLocation: "",
        eventDescription: "",
      };
      return {
        ...tf,
        [orderId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const toggleRow = (orderId: string, order?: SafeOrder) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
        if (order && !trackingForm[orderId]) {
          setTrackingForm((tf) => ({
            ...tf,
            [orderId]: {
              courier: order.courier || "",
              trackingNumber: order.trackingNumber || "",
              estimatedDelivery: order.estimatedDelivery ? (order.estimatedDelivery.split("T")[0] || "") : "",
              eventTitle: "",
              eventLocation: "",
              eventDescription: "",
            },
          }));
        }
      }
      return next;
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update status");
      }
      
      addToast("success", "Order status updated");
      fetchOrders();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const saveTrackingInfo = async (orderId: string) => {
    const form = trackingForm[orderId];
    if (!form) return;

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier: form.courier || undefined,
          trackingNumber: form.trackingNumber || undefined,
          estimatedDelivery: form.estimatedDelivery || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update tracking info");
      }
      addToast("success", "Courier & Tracking saved!");
      fetchOrders();
    } catch (err: any) {
      addToast("error", err.message || "Error saving tracking info");
    } finally {
      setUpdatingId(null);
    }
  };

  const addTrackingMilestone = async (orderId: string) => {
    const form = trackingForm[orderId];
    if (!form || !form.eventTitle.trim()) {
      addToast("error", "Please provide a milestone title");
      return;
    }

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addTrackingEvent: {
            title: form.eventTitle,
            location: form.eventLocation || undefined,
            description: form.eventDescription || undefined,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to add milestone");
      }
      addToast("success", "Milestone added & notification dispatched!");
      setTrackingForm((tf) => {
        const current = tf[orderId] || {
          courier: "",
          trackingNumber: "",
          estimatedDelivery: "",
          eventTitle: "",
          eventLocation: "",
          eventDescription: "",
        };
        return {
          ...tf,
          [orderId]: {
            ...current,
            eventTitle: "",
            eventLocation: "",
            eventDescription: "",
          },
        };
      });
      fetchOrders();
    } catch (err: any) {
      addToast("error", err.message || "Error adding tracking milestone");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
          <ShoppingBag className="text-olive-600" />
          Order Management
        </h1>
        <p className="text-charcoal-500 mt-1">Track and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="card-surface bg-white rounded-xl border border-olive-100 shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <label htmlFor="search" className="sr-only">Search orders</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 h-4 w-4" />
            <input
              id="search"
              type="text"
              placeholder="Search by order number..."
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
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          aria-label="Filter by payment status"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white text-sm"
        >
          <option value="">All Payments</option>
          {PAYMENT_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden bg-white rounded-xl border border-olive-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-50 text-charcoal-700 border-b border-olive-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order #</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-olive-600" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-charcoal-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedRows.has(order._id);
                  return (
                    <React.Fragment key={order._id}>
                      <tr 
                        className={`hover:bg-olive-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-cream-50/50' : ''}`}
                        onClick={() => toggleRow(order._id)}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-charcoal-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-charcoal-700">
                          {order.shippingAddress?.fullName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-charcoal-700">
                          {order.items?.length || 0}
                        </td>
                        <td className="px-6 py-4 font-medium text-charcoal-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-charcoal-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="p-1.5 text-charcoal-500 hover:bg-olive-100 rounded transition-colors"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr className="bg-cream-50/30 border-b-2 border-olive-100">
                          <td colSpan={8} className="px-6 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left: Order Items (4 cols) */}
                              <div className="lg:col-span-4 space-y-4">
                                <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider">
                                  Order Items ({order.items?.length || 0})
                                </h3>
                                <div className="space-y-3">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-olive-100 shadow-sm">
                                      <div className="relative h-11 w-11 rounded-md overflow-hidden bg-cream-100 shrink-0">
                                        {item.image ? (
                                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xs text-charcoal-400">No Img</div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-charcoal-900 truncate">{item.name}</p>
                                        <p className="text-[11px] text-charcoal-500">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-xs font-bold text-charcoal-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Middle: Parcel Tracking & Milestones (4 cols) */}
                              <div className="lg:col-span-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                                    <Truck className="h-4 w-4 text-olive-700" />
                                    <span>Courier &amp; Tracking</span>
                                  </h3>
                                  <Link
                                    href={`/track?q=${order.orderNumber}`}
                                    target="_blank"
                                    className="text-[11px] font-bold text-olive-800 hover:underline flex items-center gap-1"
                                  >
                                    <span>Live Portal</span>
                                    <ExternalLink size={12} />
                                  </Link>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-olive-100 shadow-sm space-y-3 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                      Carrier / Courier Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. FedEx Express, DHL, UPS, USPS"
                                      value={trackingForm[order._id]?.courier || ""}
                                      onChange={(e) => updateTrackingField(order._id, "courier", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                      Tracking Number
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. TRK-98234729"
                                      value={trackingForm[order._id]?.trackingNumber || ""}
                                      onChange={(e) => updateTrackingField(order._id, "trackingNumber", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                      Estimated Delivery Date
                                    </label>
                                    <input
                                      type="date"
                                      value={trackingForm[order._id]?.estimatedDelivery || ""}
                                      onChange={(e) => updateTrackingField(order._id, "estimatedDelivery", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    disabled={updatingId === order._id}
                                    onClick={() => saveTrackingInfo(order._id)}
                                    className="w-full py-1.5 bg-olive-700 hover:bg-olive-800 text-cream-50 font-bold rounded-lg text-xs transition-colors shadow-2xs"
                                  >
                                    Save Carrier &amp; Tracking
                                  </button>

                                  {/* Add Tracking Milestone Event */}
                                  <div className="pt-3 border-t border-olive-100 space-y-2">
                                    <p className="text-[11px] font-bold text-charcoal-800">Add Live Milestone Event</p>
                                    <input
                                      type="text"
                                      placeholder="Milestone title (e.g. Arrived at Sorting Hub)"
                                      value={trackingForm[order._id]?.eventTitle || ""}
                                      onChange={(e) => updateTrackingField(order._id, "eventTitle", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Location (e.g. Chicago Transit Center, IL)"
                                      value={trackingForm[order._id]?.eventLocation || ""}
                                      onChange={(e) => updateTrackingField(order._id, "eventLocation", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Description note (optional)"
                                      value={trackingForm[order._id]?.eventDescription || ""}
                                      onChange={(e) => updateTrackingField(order._id, "eventDescription", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-olive-200 rounded-lg text-xs"
                                    />

                                    <button
                                      type="button"
                                      disabled={updatingId === order._id || !trackingForm[order._id]?.eventTitle?.trim()}
                                      onClick={() => addTrackingMilestone(order._id)}
                                      className="w-full py-1.5 bg-charcoal-800 hover:bg-charcoal-900 text-cream-50 font-bold rounded-lg text-xs transition-colors shadow-2xs disabled:opacity-50"
                                    >
                                      + Dispatch Milestone Event
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Shipping Address & Status (4 cols) */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider mb-2">Shipping Address</h3>
                                  <div className="bg-white p-4 rounded-xl border border-olive-100 shadow-sm text-xs text-charcoal-700 space-y-1">
                                    <p className="font-bold text-charcoal-900 text-sm">{order.shippingAddress?.fullName}</p>
                                    <p>{order.shippingAddress?.addressLine1}</p>
                                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p className="pt-2 text-charcoal-500">Email: {order.shippingAddress?.email}</p>
                                    <p className="text-charcoal-500">Phone: {order.shippingAddress?.phone}</p>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider mb-2">Update Order Status</h3>
                                  <div className="bg-white p-4 rounded-xl border border-olive-100 shadow-sm flex flex-col gap-3">
                                    <select
                                      id={`status-update-${order._id}`}
                                      className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white text-xs font-semibold"
                                      defaultValue={order.status}
                                    >
                                      {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                          {s.replace("_", " ").toUpperCase()}
                                        </option>
                                      ))}
                                    </select>
                                    <Button
                                      onClick={() => {
                                        const sel = document.getElementById(`status-update-${order._id}`) as HTMLSelectElement;
                                        if (sel) updateOrderStatus(order._id, sel.value);
                                      }}
                                      isLoading={updatingId === order._id}
                                      className="w-full justify-center text-xs py-2"
                                    >
                                      Update Status
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-charcoal-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
