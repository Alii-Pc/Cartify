"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle, Package, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFCM } from "@/hooks/useFCM";

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
  const { fcmToken, subscribeToNotifications } = useFCM();
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-olive-200/60 bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-fadeIn z-[100] flex flex-col overflow-hidden max-h-[85vh] transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-olive-100/80 bg-gradient-to-r from-cream-50/90 to-white/90 px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-olive-900 text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-olive-100 px-2 text-xs font-bold text-olive-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-olive-600 hover:text-olive-800 transition-colors bg-white px-2 py-1 rounded-md border border-olive-100 shadow-sm"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-charcoal-400 hover:bg-cream-100 hover:text-charcoal-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-olive-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center text-charcoal-400 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cream-100 to-olive-50 shadow-inner">
                  <Bell className="h-8 w-8 text-olive-300" />
                </div>
                <p className="text-sm font-medium text-charcoal-500">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-olive-50/50 p-2 space-y-1">
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
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor} ${iconColor} ring-4 ring-white shadow-sm`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold truncate ${notif.isRead ? "text-charcoal-600" : "text-olive-900"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-bold text-charcoal-400 whitespace-nowrap uppercase tracking-wider">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${notif.isRead ? "text-charcoal-500" : "text-charcoal-700"}`}>
                          {notif.body}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-amber-500 mt-2 shadow-sm shadow-amber-200"></div>
                      )}
                    </div>
                  );

                  return notif.link ? (
                    <Link
                      href={notif.link}
                      key={notif._id}
                      onClick={() => markAsRead(notif._id, notif.isRead)}
                      className={`block p-3 rounded-xl transition-all duration-200 hover:bg-cream-50 hover:shadow-sm ${!notif.isRead ? "bg-olive-50/40 border border-olive-100/50" : "border border-transparent"}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={notif._id}
                      onClick={() => markAsRead(notif._id, notif.isRead)}
                      className={`w-full text-left block p-3 rounded-xl transition-all duration-200 hover:bg-cream-50 hover:shadow-sm ${!notif.isRead ? "bg-olive-50/40 border border-olive-100/50" : "border border-transparent"}`}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Push Notifications Prompt Footer */}
          {!fcmToken && (
            <div className="border-t border-olive-100/80 bg-cream-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-olive-900">Never miss an update</p>
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Enable push notifications for instant alerts.</p>
                </div>
                <button
                  onClick={subscribeToNotifications}
                  className="shrink-0 rounded-full bg-olive-800 px-3 py-1.5 text-xs font-bold text-cream-50 hover:bg-olive-900 transition-colors shadow-sm"
                >
                  Enable
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
