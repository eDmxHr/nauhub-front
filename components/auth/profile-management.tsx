"use client";

import { useState, useEffect } from "react";
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
  createProfile,
  updateProfile as updateProfileAPI,
  deleteProfile as deleteProfileAPI,
} from "@/lib/api/profiles";
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
import {
  AVATAR_OPTIONS,
  getAvatarColor,
  isColorAvatar,
} from "@/lib/constants/avatar";

interface ProfileManagementProps {
  isOpen: boolean;
  onClose: () => void;
  initialCreateMode?: boolean;
}

export function ProfileManagement({
  isOpen,
  onClose,
  initialCreateMode = false,
}: ProfileManagementProps) {
  const { user, addProfile, updateProfile, deleteProfile, fetchProfiles } = useAuthStore();
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
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const profiles = user?.profiles || [];

  useEffect(() => {
    if (isOpen) {
      if (initialCreateMode) {
        setIsCreating(true);
        // Reset form for new profile
        setName("");
        setSelectedAvatar("red");
        setIsKids(false);
        setHasPin(false);
        setPin("");
        setError("");
        setEditingProfile(null);
      }
    } else {
      // Reset everything when modal closes
      resetForm();
    }
  }, [isOpen, initialCreateMode]);

  const resetForm = () => {
    setName("");
    setSelectedAvatar("red");
    setIsKids(false);
    setHasPin(false);
    setPin("");
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
    setHasPin(!!profile.pin);
    setPin(profile.pin || "");
    setEditingProfile(profile);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (hasPin && pin.length !== 4) {
      setError("Passcode must be 4 digits");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (editingProfile) {
        // Update existing profile
        await updateProfileAPI(editingProfile.id, {
          name: name.trim(),
          avatar_url: selectedAvatar,
          isKids,
          pin: hasPin ? pin : undefined,
        });

        // Refetch profiles to get the latest data from backend (including PIN status)
        await fetchProfiles();
      } else {
        const newProfile = await createProfile({
          name: name.trim(),
          avatar_url: selectedAvatar,
          isKids,
          pin: hasPin ? pin : undefined,
        });

        // Refetch profiles to get the latest data from backend (including PIN status)
        await fetchProfiles();
      }

      resetForm();
      onClose(); // Close modal after successful save
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save profile";
      setError(errorMessage);
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    setIsSaving(true);
    try {
      await deleteProfileAPI(profileId);
      deleteProfile(profileId);
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Edit/Create form view
  if (isCreating || editingProfile) {
    return (
      <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
        <ResponsiveModalContent className="max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {editingProfile ? "Edit Profile" : "Add Profile"}
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-6 p-4 overflow-y-auto max-h-[90vh]">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Avatar</label>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center",
                    getAvatarColor(selectedAvatar)
                  )}
                >
                  <User className="size-8 text-white" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
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
            </div>

            {/* Name Input */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium mb-2"
              >
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-brand"
                maxLength={20}
                autoFocus
              />
            </div>

            {/* Kids Profile Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Kids Profile</div>
                <div className="text-sm text-muted-foreground">
                  Show only kids-friendly content
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKids(!isKids)}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative",
                  isKids ? "bg-brand" : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                    isKids ? "right-1" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Passcode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasPin ? (
                  <Lock className="size-5 text-muted-foreground" />
                ) : (
                  <LockOpen className="size-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">Profile Lock</div>
                  <div className="text-sm text-muted-foreground">
                    Require a 4-digit passcode
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHasPin(!hasPin);
                  if (!hasPin) setPin("");
                }}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative",
                  hasPin ? "bg-brand" : "bg-white/20"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                    hasPin ? "right-1" : "left-1"
                  )}
                />
              </button>
            </div>

            {hasPin && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Passcode
                </label>
                <InputOTP maxLength={4} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <ResponsiveModalFooter>
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {editingProfile ? "Save" : "Create"}
            </button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  // Profile list view
  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Manage Profiles</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="py-4">
          {/* Profiles List */}
          <div className="space-y-3 mb-6">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No profiles yet</p>
                <p className="text-sm">
                  Create your first profile to get started
                </p>
              </div>
            ) : (
              profiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                      getAvatarColor(profile.avatar, index)
                    )}
                  >
                    {!isColorAvatar(profile.avatar) && profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <User className="size-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{profile.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {profile.pin && (
                        <span className="flex items-center gap-1">
                          <Lock className="size-3" />
                          Protected
                        </span>
                      )}
                      {profile.isKids && (
                        <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                          KIDS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(profile)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      aria-label="Edit profile"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(profile.id)}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                      aria-label="Delete profile"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Profile Button */}
          {profiles.length < 4 && (
            <button
              onClick={handleStartCreate}
              className="w-full py-3 border-2 border-dashed border-white/20 hover:border-white/40 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="size-5" />
              Add Profile
            </button>
          )}

          {profiles.length >= 4 && (
            <div className="text-center text-sm text-muted-foreground">
              Maximum 4 profiles allowed
            </div>
          )}
        </div>

        <ResponsiveModalFooter>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </ResponsiveModalFooter>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-zinc-900 p-6 rounded-lg max-w-sm w-full space-y-4">
              <h3 className="text-lg font-semibold">Delete Profile?</h3>
              <p className="text-sm text-muted-foreground">
                This profile and its watch history will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
