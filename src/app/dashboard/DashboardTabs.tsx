"use client";

import React, { useState } from "react";
import { User, Settings, ShieldCheck, Mail, Calendar, Phone, Lock, Save, Loader2, Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
};

export default function DashboardTabs({ user }: { user: DashboardUser }) {
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "settings">("overview");

  return (
    <div className="mt-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-olive-800 text-white shadow-md"
              : "text-charcoal-600 hover:bg-olive-100 hover:text-olive-800"
          }`}
        >
          <Info className="h-5 w-5" />
          <span className="font-medium">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === "profile"
              ? "bg-olive-800 text-white shadow-md"
              : "text-charcoal-600 hover:bg-olive-100 hover:text-olive-800"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">User Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-olive-800 text-white shadow-md"
              : "text-charcoal-600 hover:bg-olive-100 hover:text-olive-800"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Account Settings</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 card-surface p-6 sm:p-8 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab user={user} />}
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// OVERVIEW TAB
// -------------------------------------------------------------
function OverviewTab({ user }: { user: DashboardUser }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-6">Account Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-5 rounded-2xl bg-cream-50 border border-olive-100/50 flex flex-col items-start shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-100 text-olive-700 mb-3">
            <Mail className="h-5 w-5" />
          </div>
          <p className="text-xs text-charcoal-500 font-medium uppercase tracking-wider">Email Address</p>
          <p className="mt-1 font-semibold text-charcoal-900 truncate w-full">{user.email}</p>
        </div>

        <div className="p-5 rounded-2xl bg-cream-50 border border-olive-100/50 flex flex-col items-start shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-100 text-olive-700 mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-xs text-charcoal-500 font-medium uppercase tracking-wider">Verification Status</p>
          <div className="mt-1 flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <p className="font-semibold text-charcoal-900">
              {user.isVerified ? "Verified User" : "Unverified"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-50 border border-olive-100/50 flex flex-col items-start shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-100 text-olive-700 mb-3">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs text-charcoal-500 font-medium uppercase tracking-wider">Member Since</p>
          <p className="mt-1 font-semibold text-charcoal-900">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PROFILE TAB
// -------------------------------------------------------------
function ProfileTab({ user }: { user: DashboardUser }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Profile updated successfully");
      } else {
        addToast("error", data.message || "Failed to update profile");
      }
    } catch (err) {
      addToast("error", "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-xl">
      <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-2">User Profile</h2>
      <p className="text-sm text-charcoal-500 mb-8">Update your personal information and contact details.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">Email Address <span className="text-xs text-charcoal-400 font-normal ml-2">(Cannot be changed)</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-charcoal-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <Phone className="h-5 w-5" />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={loading} className="gap-2 px-8">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// SETTINGS TAB
// -------------------------------------------------------------
function SettingsTab() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return addToast("error", "New passwords do not match");
    }
    if (formData.newPassword.length < 8) {
      return addToast("error", "New password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Password changed successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        addToast("error", data.message || "Failed to change password");
      }
    } catch (err) {
      addToast("error", "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-xl">
      <h2 className="text-xl font-display font-semibold text-charcoal-900 mb-2">Account Settings</h2>
      <p className="text-sm text-charcoal-500 mb-8">Manage your account security and password.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">Current Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Must be at least 8 characters long.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-charcoal-800">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end border-b border-gray-100 pb-8">
          <Button type="submit" disabled={loading} variant="primary" className="gap-2 px-8">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      {/* Linked Accounts Section */}
      <div className="mt-8">
        <h3 className="text-lg font-display font-semibold text-charcoal-900 mb-2">Linked Accounts</h3>
        <p className="text-sm text-charcoal-500 mb-6">Manage your connected social accounts.</p>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Google</p>
              <p className="text-xs text-charcoal-500">
                {user?.hasGoogle ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          
          <div>
            {!user?.hasGoogle ? (
              <div className="w-40">
                <GoogleLoginButton action="link" />
              </div>
            ) : (
              <span className="text-sm font-medium text-olive-600 bg-olive-50 px-3 py-1.5 rounded-full">
                Linked
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
