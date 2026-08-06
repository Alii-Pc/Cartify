"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/Loader";
import { Trash2, Settings, ShieldCheck, Store, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "security">("store");
  const [loading, setLoading] = useState(true);

  // Store Config State
  const [promoBanner, setPromoBanner] = useState({ isActive: false, message: "" });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 10,
    minSubtotal: 0,
    description: "",
  });
  const [savingBanner, setSavingBanner] = useState(false);

  // Security Config State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const { addToast } = useToast();

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
    setSavingBanner(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "promo_banner", value: promoBanner }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("success", "Banner settings saved successfully!");
      } else {
        addToast("error", data.message || "Failed to save settings.");
      }
    } catch (err) {
      addToast("error", "An error occurred while saving.");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
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
        addToast("success", "Coupon created successfully!");
      } else {
        addToast("error", data.message || "Failed to create coupon.");
      }
    } catch (err) {
      addToast("error", "Error creating coupon.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter((c) => c._id !== id));
        addToast("success", "Coupon deleted.");
      } else {
        addToast("error", data.message || "Failed to delete coupon.");
      }
    } catch (err) {
      addToast("error", "Error deleting coupon.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return addToast("error", "New passwords do not match.");
    }
    if (passwordData.newPassword.length < 8) {
      return addToast("error", "New password must be at least 8 characters.");
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        addToast("error", data.message || "Failed to change password.");
      }
    } catch (err) {
      addToast("error", "An error occurred.");
    } finally {
      setSavingPassword(false);
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900 flex items-center gap-3">
            <Settings className="text-olive-600" />
            Settings
          </h1>
          <p className="text-charcoal-700 mt-1">Manage store configuration and admin security.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab("store")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "store"
                ? "bg-olive-800 text-white shadow-md"
                : "text-charcoal-600 hover:bg-olive-100 hover:text-olive-800"
            }`}
          >
            <Store className="h-5 w-5" />
            <span className="font-medium">Store Config</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "security"
                ? "bg-olive-800 text-white shadow-md"
                : "text-charcoal-600 hover:bg-olive-100 hover:text-olive-800"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Admin Security</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[400px]">
          {activeTab === "store" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Promo Banner Settings */}
              <div className="admin-card p-6 rounded-2xl bg-white border border-olive-100 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-charcoal-900">Promo Banner</h2>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Configure the announcement banner displayed at the top of the website.
                  </p>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoBanner.isActive}
                      onChange={(e) =>
                        setPromoBanner((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="h-5 w-5 rounded border-olive-300 text-olive-600 focus:ring-olive-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-charcoal-800">Enable Promo Banner</span>
                  </label>

                  {promoBanner.isActive && (
                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-medium text-charcoal-800">
                        Banner Message
                      </label>
                      <input
                        type="text"
                        value={promoBanner.message}
                        onChange={(e) =>
                          setPromoBanner((prev) => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="e.g. Use SUMMER15 for 15% off!"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500/20"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveBanner} disabled={savingBanner} className="btn-primary">
                    {savingBanner ? "Saving..." : "Save Banner"}
                  </button>
                </div>
              </div>

              {/* Coupon Management */}
              <div className="admin-card p-6 rounded-2xl bg-white border border-olive-100 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-charcoal-900">Discount Coupons</h2>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Create and manage promo codes for your customers.
                  </p>
                </div>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-cream-50 p-4 rounded-xl border border-olive-100/50 shadow-sm">
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
                  <div className="flex items-end justify-end sm:col-span-2 lg:col-span-3">
                    <button type="submit" className="btn-primary mt-2 shadow-sm">Add Coupon</button>
                  </div>
                </form>

                <div className="admin-table-wrapper mt-6 border border-olive-100 rounded-xl overflow-hidden">
                  <table className="admin-table w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider">Code</th>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider">Description</th>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider">Type</th>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider">Value</th>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider">Min Spend</th>
                        <th className="font-semibold text-xs text-charcoal-600 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {coupons.map(coupon => (
                        <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="font-bold text-charcoal-900">{coupon.code}</td>
                          <td className="text-charcoal-600">{coupon.description}</td>
                          <td className="capitalize text-charcoal-600">{coupon.type.replace("_", " ")}</td>
                          <td className="font-semibold text-olive-700">{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}</td>
                          <td className="text-charcoal-600">${coupon.minSubtotal || 0}</td>
                          <td className="text-right">
                            <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-charcoal-500 py-10 font-medium">No coupons active.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="admin-card p-6 rounded-2xl bg-white border border-olive-100 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-charcoal-900">Change Password</h2>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Ensure your admin account remains secure by updating your password regularly.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-charcoal-800">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input 
                        type="password" 
                        required 
                        value={passwordData.currentPassword} 
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500/20" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-charcoal-800">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input 
                        type="password" 
                        required 
                        minLength={8}
                        value={passwordData.newPassword} 
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500/20" 
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-[11px] text-charcoal-400 mt-1">Must be at least 8 characters long.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-charcoal-800">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input 
                        type="password" 
                        required 
                        minLength={8}
                        value={passwordData.confirmPassword} 
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500/20" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={savingPassword} className="btn-primary shadow-sm">
                      {savingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
