"use server";

import webpush from "web-push";

// Configure VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:hello@nauhub.app",
    vapidPublicKey,
    vapidPrivateKey
  );
}

// In production, store subscriptions in a database
// This is a simple in-memory store for demonstration
const subscriptions: Map<string, PushSubscription> = new Map();

export async function subscribeUser(sub: PushSubscription) {
  // Generate a unique ID for this subscription
  const endpoint = (sub as unknown as { endpoint: string }).endpoint;
  subscriptions.set(endpoint, sub);

  return { success: true };
}

export async function unsubscribeUser() {
  // In production, you would identify the user and remove their subscription
  return { success: true };
}

export async function sendNotification(message: string, title?: string) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "VAPID keys not configured" };
  }

  const payload = JSON.stringify({
    title: title || "Nauhub",
    body: message,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: "/",
  });

  const results = await Promise.allSettled(
    Array.from(subscriptions.values()).map((subscription) =>
      webpush.sendNotification(
        subscription as unknown as webpush.PushSubscription,
        payload
      )
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    success: true,
    sent: successful,
    failed,
  };
}

// Send notification about new content
export async function notifyNewRelease(showTitle: string, showId: string) {
  const payload = JSON.stringify({
    title: "New on Nauhub",
    body: `${showTitle} is now available to watch!`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: `/detail/${showId}`,
    tag: `new-release-${showId}`,
  });

  const results = await Promise.allSettled(
    Array.from(subscriptions.values()).map((subscription) =>
      webpush.sendNotification(
        subscription as unknown as webpush.PushSubscription,
        payload
      )
    )
  );

  return {
    success: true,
    sent: results.filter((r) => r.status === "fulfilled").length,
  };
}
