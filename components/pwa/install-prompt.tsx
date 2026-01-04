"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-is-desktop";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function getIsStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

export function InstallPrompt() {
  const [isIOS] = useState(getIsIOS);
  const [isStandalone] = useState(getIsStandalone);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("pwa-install-dismissed") === "true";
    }
    return false;
  });

  useEffect(() => {
    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS prompt after a delay if not installed
    const timer = setTimeout(() => {
      if (!isStandalone && !dismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      clearTimeout(timer);
    };
  }, [isStandalone, dismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed, dismissed, on desktop, or if prompt is hidden
  const isDesktop = useIsDesktop();
  if (isStandalone || dismissed || !showPrompt || isDesktop) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0 size-12 bg-brand rounded-xl flex items-center justify-center">
            <Download className="size-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">Install Balani</h3>

            {isIOS ? (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span>Tap</span>
                <Share className="size-4" />
                <span>then &quot;Add to Home Screen&quot;</span>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Install App
              </button>
            ) : (
              <p className="text-sm text-zinc-400">
                Use your browser menu to install this app
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
