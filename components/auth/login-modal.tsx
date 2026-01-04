"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal";
import { LoginForm } from "./login-form";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  dismissible?: boolean; // If false, user can't close modal (for required auth)
  onSuccess?: () => void; // Called after successful login
}

export function LoginModal({
  isOpen,
  onClose,
  dismissible = true,
  onSuccess,
}: LoginModalProps) {
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if dismissible is true
    if (dismissible || !open) {
      onClose();
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent>
        <div className="px-4 pb-6 md:px-0 md:pb-0">
          <LoginForm
            onSuccess={handleSuccess}
            onCancel={dismissible ? onClose : undefined}
          />
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
