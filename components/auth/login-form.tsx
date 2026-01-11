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
type Mode = "signin" | "signup";

export function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const setShowProfileSelector = useAuthStore((state) => state.setShowProfileSelector);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setIsInitialized = useAuthStore((state) => state.setIsInitialized);

  const handleSendOTP = async () => {
    // For sign up, name is required
    if (mode === "signup" && !name.trim()) {
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
      // Only send name for sign up
      const response = await loginAPI(phone, otp, mode === "signup" ? name : undefined);

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
          hasPin: p.hasPin,
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

      // Mark as initialized and not loading to hide skeleton
      setIsLoading(false);
      setIsInitialized(true);

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
    setName("");
    setOtp("");
    setStep("phone");
    setMode("signin");
    setError("");
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    // Clear name when switching to sign in
    if (newMode === "signin") {
      setName("");
    }
  };

  return (
    <div className="w-full h-[440px] flex flex-col">
      {/* Step 1: Phone Number */}
      {step === "phone" && (
        <div className="flex flex-col h-full">
          {/* Mode Toggle */}
          <div className="mb-6 mt-4">
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg mb-4">
              <button
                onClick={() => handleModeChange("signin")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleModeChange("signup")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {mode === "signin" ? "Sign In" : "Sign Up"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === "signin"
                  ? "Enter your phone number to receive OTP"
                  : "Create an account with your phone number"}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 flex flex-col">
            {/* Name Input - Only for Sign Up */}
            {mode === "signup" && (
              <div className="">
                <label
                  className="text-sm font-medium text-muted-foreground mb-2 block"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 rounded-xl py-3 px-4 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}
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


            
          </div>
          <div className="mt-auto">
              {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={
                isRequestingOTP ||
                phone.length < 7 ||
                (mode === "signup" && !name.trim())
              }
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
              {mode === "signup" && name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signing up as {name}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 flex flex-col">
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

           
          </div>
          <div className="mt-auto">
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
                `Verify & ${mode === "signin" ? "Sign In" : "Sign Up"}`
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
