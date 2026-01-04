"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  // Redirect after successful login
  const handleLoginSuccess = () => {
    router.replace(returnUrl);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
      </div>

      <LoginModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleLoginSuccess}
        dismissible={true}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="size-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
