import React, { useState } from "react";
import { Lock, Save, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) return null;

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
        onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-olive-500/20 focus:border-olive-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={loading} variant="primary" className="gap-2 px-8">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      {/* Linked Accounts Section */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-display font-semibold text-charcoal-900 mb-4">Linked Accounts</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Google</p>
              <p className="text-[11px] text-charcoal-500">
                {user?.hasGoogle ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          
          <div>
            {!user?.hasGoogle ? (
              <div className="w-32">
                <GoogleLoginButton action="link" />
              </div>
            ) : (
              <span className="text-xs font-medium text-olive-600 bg-olive-50 px-2.5 py-1 rounded-full">
                Linked
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
