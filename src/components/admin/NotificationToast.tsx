"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
}

export function NotificationToast() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("join_room", "admin");

      socket.on("admin_notification", (data: Omit<Notification, "id">) => {
        const newNotification = { ...data, id: Math.random().toString(36).substr(2, 9) };
        setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Keep last 5

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
        }, 5000);
      });

      return () => {
        socket.off("admin_notification");
        socket.emit("leave_room", "admin");
      };
    }
  }, [socket, isConnected]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex w-80 items-start gap-3 rounded-lg bg-white p-4 shadow-xl border border-olive-100 animate-slideUp"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-800">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-charcoal-900">{notification.title}</h4>
            <p className="mt-1 text-xs text-charcoal-700/80">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-charcoal-700/50 hover:text-charcoal-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
