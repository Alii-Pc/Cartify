"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  AlertCircle,
  Trash2,
  Loader2,
  Calendar,
  Smartphone,
  Sparkles,
  Wifi,
  Battery,
  ShoppingBag,
  Layers,
  CheckCircle2,
} from "lucide-react";

type Promotion = {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  readBy: string[];
};

export default function AdminPromotionsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Preview Mode
  const [previewStyle, setPreviewStyle] = useState<"ios" | "android" | "inapp">("ios");

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch promotions", error);
    } finally {
      setLoadingPromotions(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this promotion? It will be removed from users' notifications."
      )
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete promotion");
      }
    } catch (error) {
      console.error("Error deleting promotion", error);
      alert("Error deleting promotion");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setStatus("loading");
    setMessage("");
    setResults(null);

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Broadcast sent successfully!");
        setResults(data.data);
        setTitle("");
        setBody("");
        fetchPromotions();
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send broadcast");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected network error occurred");
    }
  };

  // Quick preset templates
  const applyPreset = (presetTitle: string, presetBody: string) => {
    setTitle(presetTitle);
    setBody(presetBody);
    setStatus("idle");
    setMessage("");
  };

  // Display texts for preview (uses user input or fallback preview text)
  const previewTitle = title.trim() || "🌟 Weekend Flash Sale!";
  const previewBody =
    body.trim() ||
    "Get 20% off all modern home goods & kitchenware using code FLASH20. Valid this weekend only!";

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateString = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Promotions & Broadcasts</h1>
          <p className="text-sm text-charcoal-600 mt-0.5">
            Broadcast instant push notifications and in-app updates to all registered customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-olive-100 bg-white p-6 sm:p-8 shadow-xs card-surface">
            <div className="flex items-center gap-3 mb-6 border-b border-olive-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-100 text-olive-800">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Compose Push Notification</h2>
                <p className="text-xs text-charcoal-600">
                  Broadcasts will be sent directly to opted-in devices and saved to notification
                  inboxes.
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Quick Templates</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      "⚡ 24-Hour Flash Sale!",
                      "Save up to 40% on selected bestsellers today only. Don't miss out!"
                    )
                  }
                  className="text-xs bg-cream-100 hover:bg-olive-100 text-charcoal-800 px-3 py-1.5 rounded-full border border-olive-200/80 transition-colors"
                >
                  ⚡ Flash Sale
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      "📦 Free Worldwide Delivery",
                      "Enjoy free shipping on all orders placed this week with code FREESHIP."
                    )
                  }
                  className="text-xs bg-cream-100 hover:bg-olive-100 text-charcoal-800 px-3 py-1.5 rounded-full border border-olive-200/80 transition-colors"
                >
                  📦 Free Shipping
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      "🌿 New Spring Collection is Live",
                      "Explore handcrafted ceramic homeware and organic linen items just arrived."
                    )
                  }
                  className="text-xs bg-cream-100 hover:bg-olive-100 text-charcoal-800 px-3 py-1.5 rounded-full border border-olive-200/80 transition-colors"
                >
                  🌿 New Arrivals
                </button>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Notification Title *
                  </label>
                  <span className="text-[11px] text-charcoal-400">{title.length}/60 chars</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🌟 Flash Sale Weekend!"
                  className="w-full rounded-xl border border-olive-200 px-4 py-2.5 text-sm text-charcoal-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Message Body *
                  </label>
                  <span className="text-[11px] text-charcoal-400">{body.length}/180 chars</span>
                </div>
                <textarea
                  required
                  maxLength={180}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g. Get 20% off all sneakers using code SNEAKER20. Valid until Sunday!"
                  rows={4}
                  className="w-full rounded-xl border border-olive-200 px-4 py-2.5 text-sm text-charcoal-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 resize-none transition-colors"
                />
              </div>

              {status === "error" && (
                <div className="rounded-xl bg-red-50 p-3.5 flex items-start gap-3 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{message}</p>
                </div>
              )}

              {status === "success" && (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{message}</span>
                  </div>
                  {results && (
                    <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside mt-1">
                      <li>Successfully delivered to: {results.sent} active devices</li>
                      {results.failed > 0 && <li>Failed delivery: {results.failed} devices</li>}
                    </ul>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !title.trim() || !body.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-olive-800 px-6 py-3 text-sm font-bold text-cream-50 transition-all hover:bg-olive-900 disabled:opacity-50 shadow-sm active:scale-[0.99]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Broadcasting to devices...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Push Broadcast Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Interactive Device Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-olive-100 bg-white p-6 shadow-xs card-surface">
            <div className="flex items-center justify-between mb-4 border-b border-olive-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-olive-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                  Live Device Preview
                </h3>
              </div>

              {/* Preview Style Switcher */}
              <div className="flex bg-cream-100 p-0.5 rounded-lg border border-olive-200/60">
                <button
                  type="button"
                  onClick={() => setPreviewStyle("ios")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    previewStyle === "ios"
                      ? "bg-white text-olive-900 shadow-2xs"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  iOS Lockscreen
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewStyle("android")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    previewStyle === "android"
                      ? "bg-white text-olive-900 shadow-2xs"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewStyle("inapp")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    previewStyle === "inapp"
                      ? "bg-white text-olive-900 shadow-2xs"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  In-App
                </button>
              </div>
            </div>

            {/* Smartphone Mockup */}
            <div className="max-w-[310px] mx-auto bg-gradient-to-b from-charcoal-900 via-charcoal-800 to-charcoal-900 rounded-[40px] p-3 shadow-2xl border-4 border-charcoal-700 relative select-none">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-charcoal-950 rounded-full z-20 flex items-center justify-end pr-3">
                <div className="w-2.5 h-2.5 bg-charcoal-900 rounded-full border border-charcoal-800" />
              </div>

              {/* Phone Screen */}
              <div className="w-full h-[480px] rounded-[32px] overflow-hidden relative flex flex-col justify-between p-4 bg-cover bg-center shadow-inner"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80')",
                }}
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between text-white text-[10px] font-semibold pt-1 z-10 px-1">
                  <span>{timeString}</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Lockscreen Clock & Date */}
                {previewStyle !== "inapp" && (
                  <div className="text-center text-white mt-4 z-10">
                    <p className="text-[11px] font-medium opacity-90">{dateString}</p>
                    <p className="text-4xl font-extrabold tracking-tight mt-0.5">{timeString}</p>
                  </div>
                )}

                {/* Preview Content Area */}
                <div className="my-auto z-10 w-full">
                  {previewStyle === "ios" && (
                    /* iOS Style Push Notification Card */
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/40 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-olive-800 rounded-md flex items-center justify-center text-white text-[8px] font-bold">
                            C
                          </div>
                          <span className="text-[11px] font-bold text-charcoal-900 tracking-tight">
                            CARTIFY
                          </span>
                        </div>
                        <span className="text-[10px] text-charcoal-500 font-medium">now</span>
                      </div>
                      <h4 className="font-bold text-xs text-charcoal-950 leading-tight">
                        {previewTitle}
                      </h4>
                      <p className="text-xs text-charcoal-800 mt-1 leading-snug break-words">
                        {previewBody}
                      </p>
                    </div>
                  )}

                  {previewStyle === "android" && (
                    /* Android Style Notification Card */
                    <div className="bg-charcoal-900/95 backdrop-blur-md rounded-xl p-3.5 shadow-xl border border-charcoal-700 text-white animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-3.5 h-3.5 bg-olive-500 rounded-full flex items-center justify-center text-charcoal-950 text-[7px] font-black">
                          C
                        </div>
                        <span className="text-[10px] font-bold text-olive-300">Cartify</span>
                        <span className="text-[10px] text-charcoal-400 ml-auto">Just now</span>
                      </div>
                      <h4 className="font-bold text-xs text-white leading-tight">
                        {previewTitle}
                      </h4>
                      <p className="text-xs text-charcoal-200 mt-1 leading-snug break-words">
                        {previewBody}
                      </p>
                      <div className="flex gap-3 mt-2.5 pt-2 border-t border-charcoal-700/60">
                        <span className="text-[10px] font-bold text-olive-400 uppercase tracking-wider">
                          Shop Now
                        </span>
                        <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
                          Dismiss
                        </span>
                      </div>
                    </div>
                  )}

                  {previewStyle === "inapp" && (
                    /* In-App Toast Modal Style */
                    <div className="bg-white rounded-2xl p-4 shadow-2xl border border-olive-200 animate-in fade-in slide-in-from-top-4 duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-olive-800">
                              Special Offer
                            </span>
                            <span className="text-[9px] text-charcoal-400">Just now</span>
                          </div>
                          <h4 className="font-bold text-xs text-charcoal-900 mt-0.5">
                            {previewTitle}
                          </h4>
                          <p className="text-[11px] text-charcoal-600 mt-1 leading-snug">
                            {previewBody}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="w-24 h-1 bg-white/60 rounded-full mx-auto z-10 mb-1" />
              </div>
            </div>

            <p className="text-[11px] text-charcoal-400 text-center mt-3">
              ✦ Live preview updates in real-time as you type
            </p>
          </div>
        </div>
      </div>

      {/* Past Broadcast History */}
      <div className="rounded-2xl border border-olive-100 bg-white p-6 sm:p-8 shadow-xs card-surface mt-8">
        <h2 className="text-lg font-bold text-charcoal-900 mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-olive-750" />
          <span>Broadcast History</span>
          <span className="text-xs font-normal text-charcoal-500">
            ({promotions.length} sent)
          </span>
        </h2>

        {loadingPromotions ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-olive-600" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center p-8 text-charcoal-500 bg-cream-50 rounded-xl border border-dashed border-olive-200">
            No promotions broadcast yet.
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo._id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl border border-olive-100 bg-white hover:border-olive-200 hover:shadow-xs transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    <Bell className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-900 text-sm">{promo.title}</h3>
                    <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                      {promo.body}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-charcoal-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-olive-600" />
                        {new Date(promo.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(promo._id)}
                  disabled={deletingId === promo._id}
                  title="Delete Promotion"
                  className="shrink-0 p-2 text-charcoal-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none disabled:opacity-50 opacity-0 group-hover:opacity-100"
                >
                  {deletingId === promo._id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
