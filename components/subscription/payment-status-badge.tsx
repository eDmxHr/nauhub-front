"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Payment } from "@/types/subscription";

interface PaymentStatusBadgeProps {
  status: Payment["status"];
  refundStatus: Payment["refund_status"];
  className?: string;
}

export function PaymentStatusBadge({
  status,
  refundStatus,
  className,
}: PaymentStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "outline" as const,
      className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    },
    approved: {
      label: "Approved",
      variant: "outline" as const,
      className: "bg-green-500/20 text-green-500 border-green-500/30",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
      className: "",
    },
  };

  const refundConfig = {
    none: null,
    partially_refunded: {
      label: "Partially Refunded",
      variant: "outline" as const,
      className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    },
    refunded: {
      label: "Refunded",
      variant: "outline" as const,
      className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const refundBadge = refundConfig[refundStatus];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        variant={config.variant}
        className={cn(config.className, className)}
      >
        {config.label}
      </Badge>
      {refundBadge && (
        <Badge
          variant={refundBadge.variant}
          className={refundBadge.className}
        >
          {refundBadge.label}
        </Badge>
      )}
    </div>
  );
}
