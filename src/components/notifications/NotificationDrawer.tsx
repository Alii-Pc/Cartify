"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle, Package, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type NotificationType = {
  _id: string;
  title: string;
  body: string;
  type: "order_update" | "promotion" | "system";
  isRead: boolean;
  link?: string;
  createdAt: string;
};

export function NotificationDrawer() {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) return;

    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );

    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    } catch (err) {
      console.error("Failed to mark as read", err);
      // Revert if failed
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await Promise.all(
        unreadIds.map(id => fetch(`/api/notifications/${id}/read`, { method: "PUT" }))
      );
    } catch (err) {
      console.error("Failed to mark all as read", err);
      fetchNotifications(); // Reload to get true state
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-full p-2.5 text-olive-800 transition-colors hover:bg-olive-100 focus:outline-none focus:ring-2 focus:ring-olive-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-cream-50 shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown / Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-olive-100 bg-white shadow-xl ring-1 ring-black/5 animate-fadeIn z-[100] flex flex-col overflow-hidden max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-olive-100 bg-cream-50 px-4 py-3">
            <h3 className="font-bold text-charcoal-900">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-olive-600 hover:text-olive-800 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-olive-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-charcoal-400 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100">
                  <Bell className="h-6 w-6 text-olive-300" />
                </div>
                <p className="text-sm">You have no notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-olive-50">
                {notifications.map((notif) => {
                  let Icon = Info;
                  let iconColor = "text-blue-600";
                  let bgColor = "bg-blue-50";

                  if (notif.type === "order_update") {
                    Icon = Package;
                    iconColor = "text-emerald-600";
                    bgColor = "bg-emerald-50";
                  } else if (notif.type === "promotion") {
                    Icon = Bell;
                    iconColor = "text-amber-600";
                    bgColor = "bg-amber-50";
                  }

                  const content = (
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bgColor} ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold truncate ${notif.isRead ? "text-charcoal-600" : "text-charcoal-900"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-medium text-charcoal-400 whitespace-nowrap pt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${notif.isRead ? "text-charcoal-500" : "text-charcoal-700"}`}>
                          {notif.body}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-olive-600 mt-2"></div>
                      )}
                    </div>
                  );

                  return notif.link ? (
                    <Link
                      href={notif.link}
                      key={notif._id}
                      onClick={() => markAsRead(notif._id, notif.isRead)}
                      className={`block p-4 transition-colors hover:bg-cream-50 ${!notif.isRead ? "bg-olive-50/30" : ""}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={notif._id}
                      onClick={() => markAsRead(notif._id, notif.isRead)}
                      className={`w-full text-left block p-4 transition-colors hover:bg-cream-50 ${!notif.isRead ? "bg-olive-50/30" : ""}`}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
