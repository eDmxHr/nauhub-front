"use client";

import { useState } from "react";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/hooks/use-tickets";
import { CreateTicketModal } from "./_components/create-ticket-modal";
import { TicketDetailView } from "./_components/ticket-detail-view";
import { TicketCard } from "./_components/ticket-card";

export default function RequestsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(!user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const { data: tickets, isLoading } = useTickets();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Requests</h1>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand hover:bg-brand/90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Ticket</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {isAuthenticated ? (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setSelectedTicket(ticket.ticket_number)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-4">No Tickets Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first support ticket to get help or request content.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-brand hover:bg-brand/90 mx-auto"
              >
                <Plus className="size-4" />
                Create Ticket
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view and create support tickets.
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-brand hover:bg-brand/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedTicket && (
        <TicketDetailView
          ticketNumber={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (!user) router.back();
        }}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}
