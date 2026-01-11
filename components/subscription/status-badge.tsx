"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Subscription } from "@/types/subscription";

interface StatusBadgeProps {
  status: Subscription["status"];
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending Approval",
      variant: "outline" as const,
      className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    },
    active: {
      label: "Active",
      variant: "outline" as const,
      className: "bg-green-500/20 text-green-500 border-green-500/30",
    },
    expired: {
      label: "Expired",
      variant: "outline" as const,
      className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive" as const,
      className: "",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
