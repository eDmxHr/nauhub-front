"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveModalContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

function ResponsiveModal({
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <ResponsiveModalContext.Provider value={{ isDesktop }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isDesktop }}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveModalContext.Provider>
  );
}

function ResponsiveModalTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogTrigger className={className} asChild>
        {children}
      </DialogTrigger>
    );
  }

  return (
    <DrawerTrigger className={className} asChild>
      {children}
    </DrawerTrigger>
  );
}

function ResponsiveModalContent({
  children,
  className,
}: ResponsiveModalContentProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogContent className={className}>{children}</DialogContent>;
  }

  return <DrawerContent className={className}>{children}</DrawerContent>;
}

function ResponsiveModalHeader({
  children,
  className,
}: ResponsiveModalHeaderProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>;
  }

  return <DrawerHeader className={className}>{children}</DrawerHeader>;
}

function ResponsiveModalFooter({
  children,
  className,
}: ResponsiveModalFooterProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }

  return <DrawerFooter className={className}>{children}</DrawerFooter>;
}

function ResponsiveModalTitle({
  children,
  className,
}: ResponsiveModalTitleProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return <DialogTitle className={className}>{children}</DialogTitle>;
  }

  return <DrawerTitle className={className}>{children}</DrawerTitle>;
}

function ResponsiveModalDescription({
  children,
  className,
}: ResponsiveModalDescriptionProps) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogDescription className={className}>{children}</DialogDescription>
    );
  }

  return (
    <DrawerDescription className={className}>{children}</DrawerDescription>
  );
}

function ResponsiveModalClose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isDesktop } = React.useContext(ResponsiveModalContext);

  if (isDesktop) {
    return (
      <DialogClose className={className} asChild>
        {children}
      </DialogClose>
    );
  }

  return (
    <DrawerClose className={className} asChild>
      {children}
    </DrawerClose>
  );
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
};
