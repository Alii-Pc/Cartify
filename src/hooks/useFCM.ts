"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const registerToken = async () => {
      try {
        if (!messaging) return;
        if ("Notification" in window && Notification.permission === "granted") {
          const currentToken = await getToken(messaging, {
             // You can pass vapidKey here if you have generated one in Firebase Console (Cloud Messaging -> Web configuration)
          });
          if (currentToken) {
            setFcmToken(currentToken);
            // Sync with backend silently
            await fetch("/api/users/fcm-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken }),
            }).catch(console.error);
          }
        }
      } catch (error) {
        console.error("FCM Background Registration Error:", error);
      }
    };
    
    registerToken();
  }, []);

  const subscribeToNotifications = async () => {
    try {
      if (!messaging) return false;
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging);
        if (token) {
          setFcmToken(token);
          await fetch("/api/users/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("FCM Subscription Error:", error);
      return false;
    }
  };

  return { fcmToken, subscribeToNotifications };
}
