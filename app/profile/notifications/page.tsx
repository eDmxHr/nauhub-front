"use client";

import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 lg:top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold">Notifications</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Coming Soon Message */}
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-brand/20 rounded-full">
                <Bell className="size-8 text-brand" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">Notifications Coming Soon</h2>
            <p className="text-sm text-muted-foreground">
              We're working on bringing you notification preferences and settings to keep you updated on new releases, recommendations, and account activity.
            </p>
          </div>

          {/* Placeholder Sections */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Manage email notifications for new releases, recommendations, and account updates.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Control push notifications on your devices for new content and updates.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Content Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Get notified about new shows and movies based on your viewing history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
