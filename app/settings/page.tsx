"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
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
          <h1 className="text-xl lg:text-2xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Coming Soon Message */}
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Settings Coming Soon</h2>
            <p className="text-sm text-muted-foreground">
              We're working on bringing you customizable settings to enhance your viewing experience.
            </p>
          </div>

          {/* Placeholder Sections */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Playback Settings</h3>
              <p className="text-sm text-muted-foreground">
                Adjust video quality, autoplay, and playback preferences.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Account Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and security settings.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Control how and when you receive notifications.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Language & Region</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language and region settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
