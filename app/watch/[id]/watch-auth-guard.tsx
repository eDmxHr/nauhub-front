"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Show } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";

interface WatchAuthGuardProps {
  show: Show;
  children: React.ReactNode;
}

export function WatchAuthGuard({ show, children }: WatchAuthGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const [isChecking, setIsChecking] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      setIsChecking(false);

      // Check if content is available
      if (show.isAvailable === false) {
        router.replace(`/detail/${show.id}`);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        setShowLoginModal(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, show, router]);

  // Handle login modal cancel - go back to detail page
  const handleLoginCancel = () => {
    router.replace(`/detail/${show.id}`);
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center -mt-16 -mb-20">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If content unavailable, show nothing (redirect will happen)
  if (show.isAvailable === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center -mt-16 -mb-20">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center -mt-16 -mb-20">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="size-8 text-brand" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to watch {show.title}
            </p>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginCancel}
          dismissible={false}
        />
      </>
    );
  }

  return <>{children}</>;
}
