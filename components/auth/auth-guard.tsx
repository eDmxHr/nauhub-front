"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "./login-modal";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAuthRequired?: () => void;
}

export function AuthGuard({
  children,
  fallback,
  onAuthRequired,
}: AuthGuardProps) {
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access this content
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
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            onAuthRequired?.();
          }}
        />
      </>
    );
  }

  return <>{children}</>;
}

export function useRequireAuth() {
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setShowLoginModal(true);
    }
  };

  const LoginModalComponent = (
    <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
    />
  );

  return {
    isAuthenticated: !!user,
    requireAuth,
    showLoginModal,
    setShowLoginModal,
    LoginModalComponent,
  };
}
