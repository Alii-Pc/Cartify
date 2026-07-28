"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = 'primary'
}: AdminModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-6 text-left shadow-2xl backdrop-blur-md transition-all animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-charcoal-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-2 mb-6 text-sm text-charcoal-700">
          {children}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="btn-secondary px-5 py-2 !text-sm"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`btn-primary px-5 py-2 !text-sm ${
                confirmVariant === 'danger' 
                  ? '!bg-red-600 hover:!bg-red-700 !text-white' 
                  : ''
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
