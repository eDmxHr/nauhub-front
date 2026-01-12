import { ArrowLeft, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Ticket } from "@/types/ticket";
import { formatDate } from "@/lib/utils";
import { TicketStatusBadge } from "./ticket-status-badge";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

function getStatusIcon(status: Ticket["status"]) {
  switch (status) {
    case "open":
      return <MessageSquare className="size-4 text-green-500" />;
    case "pending":
      return <Clock className="size-4 text-yellow-500" />;
    case "resolved":
      return <CheckCircle2 className="size-4 text-blue-500" />;
    case "closed":
      return <XCircle className="size-4 text-gray-500" />;
    default:
      return <MessageSquare className="size-4" />;
  }
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(ticket.status)}
            <h3 className="font-semibold truncate">{ticket.subject}</h3>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {ticket.message}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>#{ticket.ticket_number}</span>
            {ticket.category && <span>{ticket.category}</span>}
            {ticket.priority && <span>{ticket.priority}</span>}
            <span>{formatDate(ticket.created_at)}</span>
          </div>
        </div>
        <ArrowLeft className="size-5 text-muted-foreground rotate-180 flex-shrink-0" />
      </div>
    </button>
  );
}
