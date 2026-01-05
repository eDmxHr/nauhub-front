"use client";

import { useState } from "react";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { cn } from "@/lib/utils";

const AVATAR_COLORS: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
};

export default function EditProfilePage() {
  const router = useRouter();
  const { user, activeProfile, updateUser } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(!user);
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const isAuthenticated = !!user;

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    setSuccess(false);

    try {
      // Update user in store (in production, also call API)
      updateUser({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-semibold">Edit Profile</h1>
      </div>

      {/* Content */}
      {isAuthenticated ? (
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Avatar */}
          <div className="text-center mb-8">
            <div
              className={cn(
                "w-24 h-24 mx-auto rounded-lg flex items-center justify-center",
                activeProfile?.avatar && AVATAR_COLORS[activeProfile.avatar]
                  ? AVATAR_COLORS[activeProfile.avatar]
                  : "bg-brand/20"
              )}
            >
              <User className="size-12 text-white" />
            </div>
            {activeProfile && (
              <p className="mt-2 text-sm text-muted-foreground">
                Editing as {activeProfile.name}
              </p>
            )}
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-brand"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Phone number cannot be changed
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className={cn(
                "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                success
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-brand hover:bg-brand/90",
                (isSaving || !name.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {success ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to edit your profile.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (!user) router.back();
        }}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}
