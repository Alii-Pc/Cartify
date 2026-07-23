"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { ArrowRight, ShoppingBag, Eye, RefreshCw, Download } from "lucide-react";
import type { SafeOrder } from "@/types";

const STATUS_TABS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<SafeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?page=${page}&limit=5`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data.orders);
          setTotalPages(json.data.totalPages);
        } else {
          setError(json.message || "Failed to load orders");
        }
      } catch {
        setError("An error occurred while loading your order history.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page]);

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const getStatusTone = (status: string): BadgeTone => {
    if (status === "confirmed" || status === "delivered") return "olive";
    if (status === "processing" || status === "shipped") return "amber";
    if (status === "cancelled") return "charcoal";
    if (status === "pending") return "amber";
    return "olive";
  };

  const getPaymentStatusTone = (status: string): BadgeTone => {
    if (status === "paid") return "olive";
    if (status === "pending") return "amber";
    if (status === "failed") return "red";
    if (status === "refunded") return "sky";
    return "charcoal";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReorder = (order: SafeOrder) => {
    let reorderCount = 0;
    for (const item of order.items) {
      addToCart(
        {
          _id: item.productId,
          name: item.name,
          slug: item.slug,
          price: item.price,
          description: "",
          category: "general",
          images: [item.image],
          stock: 99,
          rating: 5,
          reviewCount: 1,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        item.quantity
      );
      reorderCount += item.quantity;
    }
    addToast("success", `Re-ordered ${reorderCount} items from Order #${order.orderNumber}!`);
  };

  return (
    <ShopLayout>
      <div className="bg-cream-50 min-h-[85vh] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
                Order History
              </h1>
              <p className="mt-1 text-sm text-charcoal-700/70">
                Track and view all of your past orders.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? "bg-olive-800 text-cream-50 shadow-xs"
                      : "bg-white text-charcoal-700/70 hover:bg-cream-100 hover:text-charcoal-900 border border-olive-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-750 border-t-transparent" />
                <p className="text-sm font-medium text-charcoal-700/80">Loading your orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="card-surface p-16 text-center flex flex-col items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-100 text-olive-800 mb-6">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-charcoal-900">
                {orders.length === 0 ? "You haven't placed any orders yet" : `No ${activeTab} orders found`}
              </h2>
              <p className="mt-2 max-w-md text-sm text-charcoal-700/70 leading-relaxed">
                Explore our premium handcrafted essentials and deals to place your order.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-olive-800 px-8 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-olive-900 shadow-sm"
              >
                <span>Explore All Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="card-surface overflow-hidden border border-olive-100/60 hover:shadow-sm transition-all duration-200">
                    {/* Top Order header bar */}
                    <div className="bg-cream-100/40 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-olive-100/60">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <div>
                          <p className="font-semibold text-charcoal-700/60 uppercase tracking-wider">Date Placed</p>
                          <p className="font-bold text-charcoal-900 mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal-700/60 uppercase tracking-wider">Order Number</p>
                          <p className="font-bold font-mono text-charcoal-900 mt-0.5">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal-700/60 uppercase tracking-wider">Total Amount</p>
                          <p className="font-display font-extrabold text-olive-900 mt-0.5">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getStatusTone(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge tone={getPaymentStatusTone(order.paymentStatus)}>
                          {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'pending' ? 'Unpaid' : order.paymentStatus === 'failed' ? 'Failed' : 'Refunded'}
                        </Badge>
                        {order.paymentStatus === 'paid' && (
                          <a
                            href={`/api/orders/${order._id}/invoice`}
                            download
                            className="rounded-full bg-cream-100 border border-olive-200 p-1.5 text-olive-800 hover:bg-olive-100 transition-all shadow-2xs"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="rounded-full bg-cream-100 border border-olive-200 px-3 py-1.5 text-xs font-semibold text-olive-800 hover:bg-olive-100 transition-all flex items-center gap-1 shadow-2xs"
                          title="Re-order these items"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Re-order</span>
                        </button>
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="rounded-full bg-white border border-olive-200 px-3.5 py-1.5 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 transition-all flex items-center gap-1 hover:no-underline shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>

                    {/* Order Body - List of items */}
                    <div className="p-6">
                      <div className="divide-y divide-olive-100/40">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="h-12 w-12 rounded-lg bg-cream-200/50 border border-olive-100 overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-olive-100 text-[10px] text-olive-800">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-charcoal-900 line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-charcoal-700/60 mt-0.5">
                                Qty: {item.quantity} &bull; ${item.price.toFixed(2)} each
                              </p>
                            </div>
                            <p className="text-xs font-extrabold text-charcoal-900 flex-shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-full border border-olive-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-charcoal-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full border border-olive-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
