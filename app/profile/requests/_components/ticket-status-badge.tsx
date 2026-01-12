import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/types/ticket";

interface TicketStatusBadgeProps {
  status: Ticket["status"];
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const statusConfig = {
    open: {
      label: "Open",
      className: "bg-green-500/20 text-green-500 border-green-500/30",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    },
    resolved: {
      label: "Resolved",
      className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
