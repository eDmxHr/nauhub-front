"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useTicketDetails,
  useReplyToTicket,
  useCloseTicket,
  useReopenTicket,
} from "@/hooks/use-tickets";
import { TicketStatusBadge } from "./ticket-status-badge";
import { formatDateTime } from "./utils";

interface TicketDetailViewProps {
  ticketNumber: string;
  onClose: () => void;
}

export function TicketDetailView({
  ticketNumber,
  onClose,
}: TicketDetailViewProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenError, setReopenError] = useState("");

  const { data: ticket, isLoading } = useTicketDetails(ticketNumber);
  const replyMutation = useReplyToTicket();
  const closeMutation = useCloseTicket();
  const reopenMutation = useReopenTicket();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError("");

    if (!replyMessage.trim()) {
      setReplyError("Please enter a message");
      return;
    }

    try {
      await replyMutation.mutateAsync({
        ticketNumber,
        payload: { message: replyMessage.trim() },
      });
      setReplyMessage("");
    } catch (err: any) {
      setReplyError(
        err?.response?.data?.message || "Failed to send reply. Please try again."
      );
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(ticketNumber);
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }
  };

  const handleReopenClick = () => {
    setShowReopenModal(true);
    setReopenReason("");
    setReopenError("");
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    setReopenError("");

    if (!reopenReason.trim()) {
      setReopenError("Please provide a reason for reopening the ticket");
      return;
    }

    try {
      await reopenMutation.mutateAsync({
        ticketNumber,
        payload: { reason: reopenReason.trim() },
      });
      setShowReopenModal(false);
      setReopenReason("");
    } catch (err: any) {
      setReopenError(
        err?.response?.data?.message || "Failed to reopen ticket. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ticket not found</p>
          <Button
            onClick={onClose}
            className="bg-brand hover:bg-brand/90"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Allow replies for open, pending, and resolved tickets (only closed tickets cannot be replied to)
  const canReply = ticket.status !== "closed";
  const canClose = ticket.status === "open" || ticket.status === "pending";
  const canReopen = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto pt-header-safe lg:pt-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="-ml-2"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Ticket #{ticket.ticket_number}</h1>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Ticket Info */}
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{ticket.subject}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Category: {ticket.category || "N/A"}</span>
              <span>Priority: {ticket.priority || "N/A"}</span>
              <span>Created: {formatDateTime(ticket.created_at)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {ticket.message}
            </p>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="size-5" />
            Replies ({ticket.replies?.length || 0})
          </h3>

          {ticket.replies && ticket.replies.length > 0 ? (
            <div className="space-y-4">
              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={cn(
                    "bg-white/5 rounded-xl p-4",
                    reply.is_admin && "bg-brand/10 border border-brand/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {reply.is_admin ? "Admin" : "You"}
                      </span>
                      {reply.is_admin && (
                        <Badge
                          variant="outline"
                          className="bg-brand/20 text-brand border-brand/30"
                        >
                          Staff
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No replies yet. Be the first to reply!
            </p>
          )}
        </div>

        {/* Reply Form */}
        {canReply && (
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Reply</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <Textarea
                value={replyMessage}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  setReplyError("");
                }}
                rows={4}
                placeholder="Type your reply..."
                className="resize-none"
              />
              {replyError && <p className="text-red-500 text-sm">{replyError}</p>}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={replyMutation.isPending || !replyMessage.trim()}
                  className="bg-brand hover:bg-brand/90"
                >
                  {replyMutation.isPending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pb-6">
          {canClose && (
            <Button
              onClick={handleClose}
              disabled={closeMutation.isPending}
              variant="outline"
            >
              <XCircle className="size-4" />
              {closeMutation.isPending ? "Closing..." : "Close Ticket"}
            </Button>
          )}
          {canReopen && (
            <Button
              onClick={handleReopenClick}
              disabled={reopenMutation.isPending}
              className="bg-brand hover:bg-brand/90"
            >
              <CheckCircle2 className="size-4" />
              Reopen Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Reopen Ticket Modal */}
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reopen Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReopen} className="space-y-4">
            <div>
              <Label htmlFor="reopen-reason" className="mb-2">
                Reason for Reopening
              </Label>
              <Textarea
                id="reopen-reason"
                value={reopenReason}
                onChange={(e) => {
                  setReopenReason(e.target.value);
                  setReopenError("");
                }}
                rows={5}
                placeholder="Please explain why you are reopening this ticket..."
                required
                className="resize-none"
              />
            </div>

            {reopenError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-sm">
                {reopenError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReopenModal(false);
                  setReopenReason("");
                  setReopenError("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reopenReason.trim() || reopenMutation.isPending}
                className="bg-brand hover:bg-brand/90"
              >
                {reopenMutation.isPending ? "Reopening..." : "Reopen Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
