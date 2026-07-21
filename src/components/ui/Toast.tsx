"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
      setToasts((prev) => {
        const next = [...prev, { id, type, message, duration, createdAt: Date.now() }];
        // If exceeding max visible, remove the oldest
        if (next.length > MAX_VISIBLE) {
          return next.slice(next.length - MAX_VISIBLE);
        }
        return next;
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Individual Toast ──

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-olive-700 flex-shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-sky-600 flex-shrink-0" />,
};

const STYLE_MAP: Record<ToastType, string> = {
  success: "border-olive-300 bg-olive-50/95 text-olive-900",
  error: "border-red-300 bg-red-50/95 text-red-900",
  warning: "border-amber-300 bg-amber-50/95 text-amber-900",
  info: "border-sky-300 bg-sky-50/95 text-sky-900",
};

const PROGRESS_MAP: Record<ToastType, string> = {
  success: "bg-olive-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  useEffect(() => {
    // Progress bar countdown
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);

    // Auto-dismiss timer
    timerRef.current = setTimeout(handleDismiss, toast.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.duration, handleDismiss]);

  return (
    <div
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${
        STYLE_MAP[toast.type]
      } ${
        isExiting
          ? "translate-x-full opacity-0 scale-95"
          : "translate-x-0 opacity-100 scale-100 animate-[slideInRight_0.3s_ease-out]"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {ICON_MAP[toast.type]}
        <p className="text-sm font-medium leading-snug flex-1 min-w-0">
          {toast.message}
        </p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-black/5">
        <div
          className={`h-full transition-none ${PROGRESS_MAP[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
