"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";
import { SafeOrder } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-olive-100 text-olive-800",
  processing: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-sky-100 text-sky-800",
};

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
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

  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
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
                            <div className="flex flex-col md:flex-row gap-8">
                              {/* Order Items */}
                              <div className="flex-1 space-y-4">
                                <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider">Order Items</h3>
                                <div className="space-y-3">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-olive-100 shadow-sm">
                                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-cream-100 shrink-0">
                                        {item.image ? (
                                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xs text-charcoal-400">No Img</div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal-900 truncate">{item.name}</p>
                                        <p className="text-xs text-charcoal-500">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-sm font-medium text-charcoal-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping & Actions */}
                              <div className="w-full md:w-72 space-y-6">
                                <div>
                                  <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider mb-3">Shipping Address</h3>
                                  <div className="bg-white p-4 rounded-lg border border-olive-100 shadow-sm text-sm text-charcoal-700 space-y-1">
                                    <p className="font-medium text-charcoal-900">{order.shippingAddress?.fullName}</p>
                                    <p>{order.shippingAddress?.addressLine1}</p>
                                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p className="pt-2 text-xs">Email: {order.shippingAddress?.email}</p>
                                    <p className="text-xs">Phone: {order.shippingAddress?.phone}</p>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wider mb-3">Update Status</h3>
                                  <div className="bg-white p-4 rounded-lg border border-olive-100 shadow-sm flex flex-col gap-3">
                                    <select
                                      id={`status-update-${order._id}`}
                                      className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white text-sm"
                                      defaultValue={order.status}
                                    >
                                      {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                      ))}
                                    </select>
                                    <Button
                                      onClick={() => {
                                        const sel = document.getElementById(`status-update-${order._id}`) as HTMLSelectElement;
                                        if (sel) updateOrderStatus(order._id, sel.value);
                                      }}
                                      isLoading={updatingId === order._id}
                                      className="w-full justify-center"
                                    >
                                      Update
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
