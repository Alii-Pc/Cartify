"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/Loader";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [promoBanner, setPromoBanner] = useState({
    isActive: false,
    message: "",
  });
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 10,
    minSubtotal: 0,
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, couponsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/coupons")
      ]);
      
      const settingsData = await settingsRes.json();
      const couponsData = await couponsRes.json();

      if (settingsData.success) {
        const promoSetting = settingsData.data.find((s: any) => s.key === "promo_banner");
        if (promoSetting) {
          setPromoBanner(promoSetting.value);
        }
      }

      if (couponsData.success) {
        setCoupons(couponsData.data);
      }
    } catch (err) {
      console.error("Failed to load settings or coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "promo_banner",
          value: promoBanner,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Banner settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save settings." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setNewCoupon({ code: "", type: "percentage", value: 10, minSubtotal: 0, description: "" });
        setMessage({ type: "success", text: "Coupon created successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to create coupon." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error creating coupon." });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter((c) => c._id !== id));
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete coupon." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error deleting coupon." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="font-display text-3xl font-bold text-charcoal-900">Settings</h1>

      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-olive-100 text-olive-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Promo Banner Settings */}
      <div className="admin-card space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal-900">Promo Banner</h2>
          <p className="mt-1 text-sm text-charcoal-600">
            Configure the announcement banner displayed at the top of the website.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={promoBanner.isActive}
              onChange={(e) =>
                setPromoBanner((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-5 w-5 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
            />
            <span className="text-sm font-medium text-charcoal-800">Enable Promo Banner</span>
          </label>

          {promoBanner.isActive && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal-800">
                Banner Message (e.g. 'Use SUMMER15 for 15% off!')
              </label>
              <input
                type="text"
                value={promoBanner.message}
                onChange={(e) =>
                  setPromoBanner((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Enter banner text here..."
                className="admin-input"
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveBanner}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Save Banner"}
          </button>
        </div>
      </div>

      {/* Coupon Management */}
      <div className="admin-card space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal-900">Discount Coupons</h2>
          <p className="mt-1 text-sm text-charcoal-600">
            Create and manage promo codes for your customers.
          </p>
        </div>

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-cream-50 p-4 rounded-xl border border-olive-100">
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-charcoal-700">Code</label>
            <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="e.g. FALL20" className="admin-input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">Type</label>
            <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="admin-select">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">Value</label>
            <input required type="number" min="0" step="any" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: parseFloat(e.target.value)})} className="admin-input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">Min Subtotal</label>
            <input type="number" min="0" value={newCoupon.minSubtotal} onChange={e => setNewCoupon({...newCoupon, minSubtotal: parseFloat(e.target.value)})} className="admin-input" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-charcoal-700">Description</label>
            <input required type="text" value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} placeholder="e.g. 20% off all orders" className="admin-input" />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button type="submit" className="btn-primary w-full sm:w-auto mt-2">Add Coupon</button>
          </div>
        </form>

        <div className="admin-table-wrapper mt-6">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Spend</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td className="font-semibold text-charcoal-900">{coupon.code}</td>
                  <td>{coupon.description}</td>
                  <td className="capitalize">{coupon.type.replace("_", " ")}</td>
                  <td>{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}</td>
                  <td>${coupon.minSubtotal || 0}</td>
                  <td className="text-right">
                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-charcoal-500 py-6">No coupons active.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
