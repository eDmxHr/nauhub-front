"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import { Profile } from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Lock,
  LockOpen,
  User,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const DEFAULT_AVATAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
];

const AVATAR_OPTIONS = [
  { id: "red", color: "bg-red-500" },
  { id: "blue", color: "bg-blue-500" },
  { id: "green", color: "bg-green-500" },
  { id: "yellow", color: "bg-yellow-500" },
  { id: "purple", color: "bg-purple-500" },
  { id: "pink", color: "bg-pink-500" },
  { id: "orange", color: "bg-orange-500" },
  { id: "teal", color: "bg-teal-500" },
];

interface ProfileManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileManagement({ isOpen, onClose }: ProfileManagementProps) {
  const { user, addProfile, updateProfile, deleteProfile } = useAuthStore();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("red");
  const [isKids, setIsKids] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const profiles = user?.profiles || [];

  const resetForm = () => {
    setName("");
    setSelectedAvatar("red");
    setIsKids(false);
    setHasPasscode(false);
    setPasscode("");
    setError("");
    setEditingProfile(null);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (profile: Profile) => {
    setName(profile.name);
    setSelectedAvatar(profile.avatar || "red");
    setIsKids(profile.isKids);
    setHasPasscode(!!profile.passcode);
    setPasscode(profile.passcode || "");
    setEditingProfile(profile);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (hasPasscode && passcode.length !== 4) {
      setError("Passcode must be 4 digits");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const profileData = {
        name: name.trim(),
        avatar: selectedAvatar,
        isKids,
        passcode: hasPasscode ? passcode : undefined,
      };

      if (editingProfile) {
        // Update existing profile
        updateProfile(editingProfile.id, profileData);
      } else {
        // Create new profile
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          ...profileData,
          createdAt: new Date(),
        };
        addProfile(newProfile);
      }

      resetForm();
    } catch {
      setError("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (profileId: string) => {
    deleteProfile(profileId);
    setShowDeleteConfirm(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Edit/Create form view
  if (isCreating || editingProfile) {
    return (
      <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
        <ResponsiveModalContent className="max-w-md">
          <ResponsiveModalHeader>
            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
              <ResponsiveModalTitle>
                {editingProfile ? "Edit Profile" : "Add Profile"}
              </ResponsiveModalTitle>
            </div>
          </ResponsiveModalHeader>

          <div className="px-4 py-6 space-y-6">
            {/* Avatar Selection */}
            <div className="text-center">
              <div
                className={cn(
                  "w-24 h-24 mx-auto rounded-lg flex items-center justify-center mb-4",
                  AVATAR_OPTIONS.find((a) => a.id === selectedAvatar)?.color ||
                    "bg-red-500"
                )}
              >
                <User className="size-12 text-white" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all flex items-center justify-center",
                      avatar.color,
                      selectedAvatar === avatar.id && "ring-2 ring-white"
                    )}
                  >
                    {selectedAvatar === avatar.id && (
                      <Check className="size-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-brand"
                maxLength={20}
              />
            </div>

            {/* Kids Profile Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Kids Profile</p>
                <p className="text-sm text-muted-foreground">
                  Show only kids-friendly content
                </p>
              </div>
              <button
                onClick={() => setIsKids(!isKids)}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative",
                  isKids ? "bg-brand" : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                    isKids ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Passcode Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {hasPasscode ? (
                      <Lock className="size-4" />
                    ) : (
                      <LockOpen className="size-4" />
                    )}
                    Profile Lock
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Require a 4-digit passcode
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHasPasscode(!hasPasscode);
                    if (!hasPasscode) setPasscode("");
                  }}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    hasPasscode ? "bg-brand" : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                      hasPasscode ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {hasPasscode && (
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={passcode}
                    onChange={setPasscode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <ResponsiveModalFooter className="px-4 pb-6">
            <div className="flex gap-3 w-full">
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {editingProfile ? "Save" : "Create"}
              </button>
            </div>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  // Profile list view
  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
      <ResponsiveModalContent className="max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Manage Profiles</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="px-4 py-6">
          {/* Profiles List */}
          <div className="space-y-3 mb-6">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-lg flex items-center justify-center relative overflow-hidden",
                    !profile.avatar &&
                      DEFAULT_AVATAR_COLORS[
                        index % DEFAULT_AVATAR_COLORS.length
                      ],
                    profile.avatar &&
                      AVATAR_OPTIONS.find((a) => a.id === profile.avatar)?.color
                  )}
                >
                  {profile.avatar &&
                  !AVATAR_OPTIONS.find((a) => a.id === profile.avatar) ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="size-7 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{profile.name}</p>
                    {profile.passcode && (
                      <Lock className="size-3 text-muted-foreground" />
                    )}
                    {profile.isKids && (
                      <span className="text-[10px] bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">
                        KIDS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(profile)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(profile.id)}
                    className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <button
              onClick={handleStartCreate}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl transition-colors"
            >
              <Plus className="size-5" />
              <span className="font-medium">Add Profile</span>
            </button>
          )}

          {profiles.length >= 5 && (
            <p className="text-center text-sm text-muted-foreground">
              Maximum 5 profiles allowed
            </p>
          )}
        </div>

        <ResponsiveModalFooter className="px-4 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-110 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Delete Profile?</h3>
            <p className="text-muted-foreground mb-6">
              This profile and its watch history will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
}
