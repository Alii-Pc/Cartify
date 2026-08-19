"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DailyRevenue {
  day: string;
  total: number;
}

interface OrderStatusCount {
  status: string;
  count: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  userId: { name: string; email: string };
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueLast7Days: DailyRevenue[];
  ordersByStatus: OrderStatusCount[];
  paymentStatus: { status: string; count: number }[];
  topSellingProducts: { productId: string; name: string; image: string; quantity: number; revenue: number }[];
  recentOrders: RecentOrder[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data.data || data);
        } else {
          setError(data.message || "Failed to load stats");
        }
      } catch (err) {
        setError("An error occurred while fetching stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-cream-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="admin-card h-28 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="admin-card h-64 bg-gray-200 rounded-2xl"></div>
        <div className="admin-card h-20 bg-gray-200 rounded-2xl"></div>
        <div className="admin-card h-80 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 bg-cream-50 min-h-screen">{error}</div>;
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...(stats.revenueLast7Days?.map(d => d.total) || [0]), 1);

  const getStatusTone = (status: string): "olive" | "cream" | "amber" | "charcoal" | "red" | "sky" | "emerald" => {
    switch(status.toLowerCase()) {
      case 'pending': return 'amber';
      case 'confirmed': return 'olive';
      case 'processing': return 'sky';
      case 'shipped': return 'charcoal';
      case 'delivered': return 'emerald';
      case 'cancelled': return 'red';
      default: return 'cream';
    }
  };

  return (
    <div className="p-8 bg-cream-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-display font-bold text-charcoal-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card flex items-center p-6 bg-white rounded-2xl border border-olive-200 shadow-sm">
          <div className="p-4 bg-olive-100 text-olive-600 rounded-xl mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-charcoal-900">
              ${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-charcoal-700">Total Revenue</div>
          </div>
        </div>
        
        <div className="admin-card flex items-center p-6 bg-white rounded-2xl border border-olive-200 shadow-sm">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl mr-4">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-charcoal-900">
              {(stats.totalOrders || 0).toLocaleString()}
            </div>
            <div className="text-sm text-charcoal-700">Total Orders</div>
          </div>
        </div>
        
        <div className="admin-card flex items-center p-6 bg-white rounded-2xl border border-olive-200 shadow-sm">
          <div className="p-4 bg-sky-100 text-sky-600 rounded-xl mr-4">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-charcoal-900">
              {(stats.totalUsers || 0).toLocaleString()}
            </div>
            <div className="text-sm text-charcoal-700">Total Users</div>
          </div>
        </div>

        <div className="admin-card flex items-center p-6 bg-white rounded-2xl border border-olive-200 shadow-sm">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl mr-4">
            <Package size={24} />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-charcoal-900">
              {(stats.totalProducts || 0).toLocaleString()}
            </div>
            <div className="text-sm text-charcoal-700">Total Products</div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
        <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-6">Revenue — Last 7 Days</h2>
        {stats.revenueLast7Days && stats.revenueLast7Days.length > 0 ? (
          <div className="flex items-end h-64 gap-2 w-full pt-6">
            {stats.revenueLast7Days.map((day, i) => {
              const heightPercent = ((day.total || 0) / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-xs text-charcoal-700 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(day.total || 0).toFixed(0)}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-olive-600 to-olive-400 rounded-t-md transition-all duration-300"
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  ></div>
                  <div className="text-xs text-charcoal-700 mt-2">{day.day}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-charcoal-700">
            No revenue data for the last 7 days.
          </div>
        )}
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
          <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-4">Orders by Status</h2>
          <div className="flex flex-wrap gap-3">
            {stats.ordersByStatus?.map((status, i) => {
              const statusStyles: Record<string, string> = {
                pending: "bg-amber-50 border-amber-200 text-amber-700",
                confirmed: "bg-olive-50 border-olive-200 text-olive-700",
                processing: "bg-sky-50 border-sky-200 text-sky-700",
                shipped: "bg-charcoal-700 border-charcoal-800 text-cream-50",
                delivered: "bg-emerald-50 border-emerald-200 text-emerald-700",
                cancelled: "bg-red-50 border-red-200 text-red-700",
              };
              const countStyles: Record<string, string> = {
                pending: "bg-amber-100 text-amber-800",
                confirmed: "bg-olive-100 text-olive-800",
                processing: "bg-sky-100 text-sky-800",
                shipped: "bg-charcoal-800 text-cream-100",
                delivered: "bg-emerald-100 text-emerald-800",
                cancelled: "bg-red-100 text-red-800",
              };
              const style = statusStyles[status.status] || "bg-cream-100 border-olive-200 text-charcoal-700";
              const countStyle = countStyles[status.status] || "bg-cream-200 text-charcoal-800";
              return (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${style}`}>
                  <span className="font-semibold capitalize">{status.status}</span>
                  <span className={`${countStyle} px-2 py-0.5 rounded-full text-xs font-bold`}>
                    {status.count}
                  </span>
                </div>
              );
            })}
            {(!stats.ordersByStatus || stats.ordersByStatus.length === 0) && (
              <div className="text-charcoal-700 text-sm">No orders found.</div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
          <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-4">Payment Status</h2>
          <div className="flex flex-wrap gap-3">
            {stats.paymentStatus?.map((payment, i) => {
              const statusStyles: Record<string, string> = {
                pending: "bg-amber-50 border-amber-200 text-amber-700",
                paid: "bg-emerald-50 border-emerald-200 text-emerald-700",
                failed: "bg-red-50 border-red-200 text-red-700",
                refunded: "bg-sky-50 border-sky-200 text-sky-700",
              };
              const countStyles: Record<string, string> = {
                pending: "bg-amber-100 text-amber-800",
                paid: "bg-emerald-100 text-emerald-800",
                failed: "bg-red-100 text-red-800",
                refunded: "bg-sky-100 text-sky-800",
              };
              const style = statusStyles[payment.status] || "bg-cream-100 border-olive-200 text-charcoal-700";
              const countStyle = countStyles[payment.status] || "bg-cream-200 text-charcoal-800";
              return (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${style}`}>
                  <span className="font-semibold capitalize">{payment.status}</span>
                  <span className={`${countStyle} px-2 py-0.5 rounded-full text-xs font-bold`}>
                    {payment.count}
                  </span>
                </div>
              );
            })}
            {(!stats.paymentStatus || stats.paymentStatus.length === 0) && (
              <div className="text-charcoal-700 text-sm">No payment data found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
        <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-6">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-olive-200 text-charcoal-700 text-sm uppercase">
                <th className="pb-3 px-4 font-semibold">Product</th>
                <th className="pb-3 px-4 font-semibold text-right">Units Sold</th>
                <th className="pb-3 px-4 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topSellingProducts?.map((product: any, idx: number) => (
                <tr key={product.productId} className="border-b border-olive-100 hover:bg-cream-50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <div className="text-charcoal-900 font-semibold">{product.name}</div>
                      <div className="text-charcoal-500 text-xs">#{idx + 1} Best Seller</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-charcoal-900 font-medium">
                    {product.quantity}
                  </td>
                  <td className="py-4 px-4 text-right text-charcoal-900 font-bold text-emerald-600">
                    ${(product.revenue || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!stats.topSellingProducts || stats.topSellingProducts.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-charcoal-700">
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-semibold text-charcoal-900">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-olive-200 text-charcoal-700 text-sm uppercase">
                <th className="pb-3 px-4 font-semibold">Order #</th>
                <th className="pb-3 px-4 font-semibold">Customer</th>
                <th className="pb-3 px-4 font-semibold">Items</th>
                <th className="pb-3 px-4 font-semibold">Total</th>
                <th className="pb-3 px-4 font-semibold">Status</th>
                <th className="pb-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map((order) => {
                const tone = getStatusTone(order.status);
                return (
                  <tr key={order._id} className="border-b border-olive-100 hover:bg-cream-50 transition-colors">
                    <td className="py-4 px-4 text-charcoal-900 font-medium">#{order.orderNumber}</td>
                    <td className="py-4 px-4">
                      <div className="text-charcoal-900 font-medium">{order.userId?.name || 'Guest'}</div>
                      <div className="text-charcoal-700 text-sm">{order.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4 text-charcoal-700">
                      {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                    </td>
                    <td className="py-4 px-4 text-charcoal-900 font-medium">
                      ${(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={tone}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-charcoal-700 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-charcoal-700">
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/admin/orders" className="text-olive-600 hover:text-olive-700 font-semibold text-sm">
            View All Orders &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
