"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";

export function PromoBanner() {
  const [banner, setBanner] = useState<{ isActive: boolean; message: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("promo_dismissed") === "true") {
      setIsVisible(false);
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.data.promo_banner) {
          setBanner(data.data.promo_banner);
        }
      } catch (err) {
        console.error("Failed to load promo banner");
      }
    };

    fetchSettings();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("promo_dismissed", "true");
  };

  const renderMessage = (msg: string) => {
    const parts = msg.split(/\[(.*?)\]/);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="mx-1.5 inline-block border border-dashed border-charcoal-400/60 bg-black/40 px-2 py-0.5 rounded text-cream-50 font-mono text-[11px] sm:text-xs tracking-widest font-bold">
            {part.trim()}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!banner?.isActive || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 overflow-hidden rounded-full bg-olive-800 px-5 py-3 text-sm font-medium text-cream-50 shadow-2xl animate-slide-up border border-olive-700/50 backdrop-blur-md">
      {/* Ambient shine effect passing through */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" style={{ animationDuration: '4s' }}></div>
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Tag className="h-4 w-4 text-olive-300" />
        <span className="tracking-wide text-[13px] sm:text-sm font-medium">{renderMessage(banner.message)}</span>
      </div>
      
      <button
        onClick={handleDismiss}
        className="relative z-20 ml-2 rounded-full bg-black/20 p-1.5 text-olive-200 transition-colors hover:bg-black/40 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
