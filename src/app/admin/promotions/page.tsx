"use client";

import React, { useState } from "react";
import { Bell, Send, AlertCircle } from "lucide-react";

export default function AdminPromotionsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setStatus("loading");
    setMessage("");
    setResults(null);

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Broadcast sent!");
        setResults(data.data);
        setTitle("");
        setBody("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send broadcast");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal-900">Promotions & Broadcasts</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-olive-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-100 text-olive-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Send Push Notification</h2>
              <p className="text-sm text-charcoal-600">Broadcast a message to all opted-in users</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1">
                Notification Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🌟 Flash Sale Weekend!"
                className="w-full rounded-lg border border-olive-200 px-4 py-2.5 text-sm focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1">
                Message Body
              </label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Get 20% off all sneakers using code SNEAKER20. Valid until Sunday!"
                rows={4}
                className="w-full rounded-lg border border-olive-200 px-4 py-2.5 text-sm focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500 resize-none"
              />
            </div>

            {status === "error" && (
              <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{message}</p>
              </div>
            )}
            
            {status === "success" && (
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800 mb-2">{message}</p>
                {results && (
                  <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
                    <li>Successfully delivered to: {results.sent} devices</li>
                    {results.failed > 0 && <li>Failed delivery: {results.failed} devices</li>}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !title || !body}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-olive-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-olive-900 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {status === "loading" ? "Broadcasting..." : "Send Broadcast Now"}
            </button>
          </form>
        </div>
        
        <div className="rounded-2xl border border-olive-100 bg-white p-6 shadow-sm hidden lg:block">
           <h3 className="text-sm font-bold text-charcoal-900 mb-4 uppercase tracking-wider text-center">Notification Preview</h3>
           <div className="max-w-[320px] mx-auto bg-gray-100 rounded-3xl h-[600px] border-[8px] border-gray-800 p-4 relative overflow-hidden flex flex-col justify-start pt-16">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl"></div>
             
             {/* Fake Notification Bubble */}
             <div className={`bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg transition-all duration-300 transform ${title ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-olive-800 rounded-md"></div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Cartify</span>
                  <span className="text-xs text-gray-400 ml-auto">now</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900">{title || "Notification Title"}</h4>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{body || "Notification body text goes here..."}</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
