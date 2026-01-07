"use client";

import { useState } from "react";
import { Phone, Loader2, ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/lib/store";
import { sendOTP, login as loginAPI, getCurrentUser } from "@/lib/api/auth";
import { AxiosError } from "axios";

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void; // Cancel button callback (for going back on watch route)
}

type Step = "phone" | "otp";

export function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const setShowProfileSelector = useAuthStore((state) => state.setShowProfileSelector);

  const handleSendOTP = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (phone.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsRequestingOTP(true);
    setError("");

    try {
      await sendOTP(phone);
      setStep("otp");
      setError("");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await loginAPI(phone, otp, name);

      // First, store the token in auth store and cookies
      // This is needed for the axios interceptor to include it in subsequent requests
      login({
        id: "", // Will be updated after fetching user data
        phone: phone,
        name: name,
        token: response.token,
        avatar: "",
        createdAt: new Date(),
      });

      // Small delay to ensure cookie is set before making the next request
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now fetch user data with the stored token
      const userData = await getCurrentUser();

      // Map profiles correctly: avatar_url -> avatar
      const mappedProfiles =
        userData.profiles?.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar_url, // Map avatar_url to avatar
          isKids: p.isKids,
          pin: p.pin,
          createdAt: new Date(p.createdAt),
        })) || [];

      // Update the user with complete data and profiles
      const userToStore = {
        id: userData.id,
        phone: userData.phone,
        name: userData.name || name,
        token: response.token,
        avatar: userData.avatar,
        createdAt: new Date(userData.createdAt),
        profiles: mappedProfiles,
      };
      login(userToStore);

      // Call success callback to close modal first
      onSuccess?.();

      // Show profile selector after a brief delay to allow modal to close
      if (mappedProfiles.length > 0) {
        setTimeout(() => {
          setShowProfileSelector(true);
        }, 300);
      }

      // Reset form
      resetForm();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setError("");
  };

  const resetForm = () => {
    setPhone("");
    setOtp("");
    setStep("phone");
    setError("");
  };

  return (
    <div className="w-full h-[450px] flex flex-col">
      {/* Step 1: Phone Number */}
      {step === "phone" && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Sign In</h2>
            <p className="text-muted-foreground text-sm">
              Enter your phone number to receive OTP
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label
                className="text-sm font-medium text-muted-foreground mb-2 block"
                id="name"
              >
                Name
              </label>
              <input
                name="name"
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/10 rounded-xl py-3 px-4 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {/* Phone Input */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" />
                  <span className="text-sm">+960</span>
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="9XX XXX"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setPhone(value);
                    setError("");
                  }}
                  disabled={isRequestingOTP}
                  className="w-full bg-white/10 rounded-xl py-3 pl-24 pr-4 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={isRequestingOTP || phone.length < 7 || !name.trim()}
              className="w-full py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isRequestingOTP ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Continue"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center animate-in fade-in">
                {error}
              </p>
            )}

            {/* Cancel Button */}
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isRequestingOTP}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <div className="flex flex-col h-full">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBackToPhone}
              disabled={isVerifying}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4 disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm">Back</span>
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
              <p className="text-muted-foreground text-sm">
                We sent a code to +960 {phone}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 flex-1 flex flex-col">
            {/* OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Verification Code
                </label>
                <button
                  onClick={handleSendOTP}
                  disabled={isRequestingOTP}
                  className="text-xs text-brand hover:text-brand/80 transition-colors disabled:opacity-50"
                >
                  {isRequestingOTP ? "Sending..." : "Resend"}
                </button>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError("");
                  }}
                  disabled={isVerifying}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-3 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center animate-in fade-in">
                {error}
              </p>
            )}

            {/* Cancel Button */}
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isVerifying}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
