import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getTickets,
  createTicket,
  getTicketDetails,
  replyToTicket,
  closeTicket,
  reopenTicket,
} from "@/lib/api/tickets";
import {
  CreateTicketPayload,
  ReplyTicketPayload,
  ReopenTicketPayload,
} from "@/types/ticket";
import { useAuthStore } from "@/lib/store";

/**
 * Hook to fetch ticket categories and priorities from API
 */
export function useCategories() {
  return useQuery({
    queryKey: ["ticket-categories"],
    queryFn: async () => {
      try {
        return await getCategories();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return { categories: [], priorities: [] };
      }
    },
  });
}

/**
 * Hook to fetch user's tickets
 */
export function useTickets() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      try {
        const response = await getTickets();
        return response.tickets;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        return [];
      }
    },
    enabled: !!user, // Only fetch if user is authenticated
  });
}

/**
 * Hook to fetch ticket details
 */
export function useTicketDetails(ticketNumber: string | null) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["ticket-details", ticketNumber],
    queryFn: async () => {
      if (!ticketNumber) return null;
      try {
        const response = await getTicketDetails(ticketNumber);
        return response.ticket;
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        return null;
      }
    },
    enabled: !!user && !!ticketNumber, // Only fetch if user is authenticated and ticket number is provided
  });
}

/**
 * Hook to create a new ticket
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      return await createTicket(payload);
    },
    onSuccess: () => {
      // Invalidate and refetch tickets list
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

/**
 * Hook to reply to a ticket
 */
export function useReplyToTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketNumber,
      payload,
    }: {
      ticketNumber: string;
      payload: ReplyTicketPayload;
    }) => {
      return await replyToTicket(ticketNumber, payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch ticket details and tickets list
      queryClient.invalidateQueries({
        queryKey: ["ticket-details", variables.ticketNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

/**
 * Hook to close a ticket
 */
export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketNumber: string) => {
      return await closeTicket(ticketNumber);
    },
    onSuccess: (data, ticketNumber) => {
      // Invalidate and refetch ticket details and tickets list
      queryClient.invalidateQueries({
        queryKey: ["ticket-details", ticketNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

/**
 * Hook to reopen a ticket
 */
export function useReopenTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketNumber,
      payload,
    }: {
      ticketNumber: string;
      payload: ReopenTicketPayload;
    }) => {
      return await reopenTicket(ticketNumber, payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch ticket details and tickets list
      queryClient.invalidateQueries({
        queryKey: ["ticket-details", variables.ticketNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
