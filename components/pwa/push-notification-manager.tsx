"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeUser, unsubscribeUser } from "@/app/actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const checkSubscription = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [checkSubscription]);

  const subscribeToPush = async () => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error("VAPID public key not configured");
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });
      setSubscription(sub);
      setPermission("granted");

      // Send subscription to server
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      if (Notification.permission === "denied") {
        setPermission("denied");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl">
        <BellOff className="size-5 text-zinc-500" />
        <div>
          <p className="text-sm font-medium">Notifications Blocked</p>
          <p className="text-xs text-zinc-500">
            Enable notifications in your browser settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl">
      <div className="flex items-center gap-3">
        <Bell className="size-5 text-zinc-400" />
        <div>
          <p className="text-sm font-medium">Push Notifications</p>
          <p className="text-xs text-zinc-500">
            {subscription ? "Enabled" : "Get notified about new releases"}
          </p>
        </div>
      </div>

      <button
        onClick={subscription ? unsubscribeFromPush : subscribeToPush}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          subscription
            ? "bg-zinc-800 text-white hover:bg-zinc-700"
            : "bg-white text-black hover:bg-gray-200"
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : subscription ? (
          "Disable"
        ) : (
          "Enable"
        )}
      </button>
    </div>
  );
}
