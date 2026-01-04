"use client";

import { useState } from "react";
import { Phone, Loader2, ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/lib/store";
import { requestOTP, login as loginAPI } from "@/lib/api/auth";
import { AxiosError } from "axios";

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void; // Cancel button callback (for going back on watch route)
}

type Step = "phone" | "otp";

export function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);

  const handleSendOTP = async () => {
    if (phone.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsRequestingOTP(true);
    setError("");

    try {
      await requestOTP(phone);
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
      const response = await loginAPI(phone, otp);

      // Store user info with token
      login({
        id: crypto.randomUUID(),
        mobile: phone,
        token: response.data,
        createdAt: new Date(),
      });

      // Call success callback
      onSuccess?.();

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
    <div className="w-full h-[380px] flex flex-col">
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
              disabled={isRequestingOTP || phone.length < 7}
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

            {/* Spacer */}
            <div className="flex-1" />

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
