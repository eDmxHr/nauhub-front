"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, CheckCircle } from "lucide-react";
import { Show } from "@/lib/data";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface MovieRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show;
}

export function MovieRequestModal({
  isOpen,
  onClose,
  show,
}: MovieRequestModalProps) {
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Auto close after showing success
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2000);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Request Content</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Request this content to be added to our library
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="px-4 pb-4 md:px-0 md:pb-0">
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="size-16 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll notify you when &quot;{show.title}&quot; becomes
                available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Requesting</p>
                <p className="font-semibold">{show.title}</p>
                <p className="text-sm text-muted-foreground">
                  {show.type === "movie" ? "Movie" : "TV Series"} • {show.year}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                This content is not yet available on Nauhub. Submit a request
                and we&apos;ll try to add it to our library.
              </p>

              <button
                onClick={() => setNotifyWhenAvailable(!notifyWhenAvailable)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {notifyWhenAvailable ? (
                    <Bell className="size-5 text-brand" />
                  ) : (
                    <BellOff className="size-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">Notify me when available</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    notifyWhenAvailable ? "bg-brand" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifyWhenAvailable ? "translate-x-4" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        {!isSubmitted && (
          <ResponsiveModalFooter>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </ResponsiveModalFooter>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
