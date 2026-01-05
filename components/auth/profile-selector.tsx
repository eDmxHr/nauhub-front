"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import { Profile } from "@/lib/types";
import { Lock, Pencil, User, ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyProfilePin } from "@/lib/api/profiles";
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

interface ProfileSelectorProps {
  onManageProfiles?: () => void;
  onCreateProfile?: () => void;
}

export function ProfileSelector({
  onManageProfiles,
  onCreateProfile,
}: ProfileSelectorProps) {
  const { user, setActiveProfile, showProfileSelector } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && !isVerifying && selectedProfile) {
      const submitPin = async () => {
        setIsVerifying(true);
        setPinError("");

        try {
          const result = await verifyProfilePin(selectedProfile.id, pin);
          if (result.verified) {
            setActiveProfile(selectedProfile);
          } else {
            setPinError("Incorrect PIN");
            setPin(""); // Clear on error
          }
        } catch (err) {
          setPinError(err instanceof Error ? err.message : "Incorrect PIN");
          setPin(""); // Clear on error
        } finally {
          setIsVerifying(false);
        }
      };

      submitPin();
    }
  }, [pin, isVerifying, selectedProfile, setActiveProfile]);

  if (!showProfileSelector || !user) return null;

  const profiles = user.profiles || [];

  const handleProfileSelect = (profile: Profile) => {
    if (profile.pin) {
      setSelectedProfile(profile);
      setPin("");
      setPinError("");
    } else {
      setActiveProfile(profile);
    }
  };

  const handlePinSubmit = async (pinValue: string = pin) => {
    if (!selectedProfile) return;
    if (pinValue.length !== 4) return;

    setIsVerifying(true);
    setPinError("");

    try {
      const result = await verifyProfilePin(selectedProfile.id, pinValue);
      if (result.verified) {
        setActiveProfile(selectedProfile);
      } else {
        setPinError("Incorrect PIN");
        setPin(""); // Clear on error
      }
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "Incorrect PIN");
      setPin(""); // Clear on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToProfiles = () => {
    setSelectedProfile(null);
    setPin("");
    setPinError("");
  };

  // PIN entry screen
  if (selectedProfile) {
    return (
      <div className="fixed inset-0 z-100 bg-black flex items-center justify-center">
        {/* Back Arrow - Top Left */}
        <button
          onClick={handleBackToProfiles}
          className="absolute top-6 left-6 p-2 text-muted-foreground hover:text-white transition-colors"
          aria-label="Back to profiles"
        >
          <ArrowLeft className="size-6" />
        </button>

        <div className="text-center px-4 max-w-md w-full">
          {/* Profile Avatar */}
          <div className="mb-6">
            <div
              className={cn(
                "w-24 h-24 mx-auto rounded-lg overflow-hidden flex items-center justify-center",
                getAvatarColor(selectedProfile.avatar)
              )}
            >
              {!isColorAvatar(selectedProfile.avatar) &&
              selectedProfile.avatar ? (
                <Image
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Lock className="size-4 text-muted-foreground" />
              <span className="text-lg font-medium">
                {selectedProfile.name}
              </span>
            </div>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">Enter your profile PIN</p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setPinError("");
                }}
                disabled={isVerifying}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {pinError && (
              <p className="text-red-500 text-sm mt-3">{pinError}</p>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={() => handlePinSubmit()}
            disabled={pin.length !== 4 || isVerifying}
            className="w-52 py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isVerifying ? "Verifying..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  // Profile selection screen
  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Who&apos;s watching?
        </h1>
        <p className="text-muted-foreground mb-10">
          {profiles.length > 0
            ? "Select a profile to continue"
            : "Create a profile to get started"}
        </p>

        {/* Profiles Grid or Create Profile */}
        {profiles.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
            {profiles.map((profile, index) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className="group flex flex-col items-center gap-3"
              >
                <div
                  className={cn(
                    "relative w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden transition-all group-hover:ring-4 ring-white flex items-center justify-center",
                    getAvatarColor(profile.avatar, index)
                  )}
                >
                  {!isColorAvatar(profile.avatar) && profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="size-10 md:size-14 text-white" />
                  )}
                  {profile.pin && (
                    <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                      <Lock className="size-3" />
                    </div>
                  )}
                  {profile.isKids && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                      KIDS
                    </div>
                  )}
                </div>
                <span className="text-sm md:text-base text-muted-foreground group-hover:text-white transition-colors">
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-white/10 flex items-center justify-center">
              <User className="size-12 md:size-16 text-muted-foreground" />
            </div>
            <button
              onClick={() => onCreateProfile?.()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
            >
              <Plus className="size-5" />
              Create Profile
            </button>
          </div>
        )}

        {/* Manage Profiles */}
        {onManageProfiles && profiles.length > 0 && (
          <button
            onClick={onManageProfiles}
            className="inline-flex items-center gap-2 px-6 py-2 border border-white/30 hover:border-white/60 rounded-lg text-muted-foreground hover:text-white transition-colors"
          >
            <Pencil className="size-4" />
            Manage Profiles
          </button>
        )}
      </div>
    </div>
  );
}
