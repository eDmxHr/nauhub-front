import { apiClient } from "./client";
import {
  CategoriesResponse,
  TicketsResponse,
  TicketDetailResponse,
  CreateTicketPayload,
  ReplyTicketPayload,
  ReopenTicketPayload,
} from "@/types/ticket";

/**
 * Get ticket categories and priorities
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const response = await apiClient.get<CategoriesResponse>("/support/categories");
  return response.data;
}

/**
 * Get user's tickets
 */
export async function getTickets(): Promise<TicketsResponse> {
  const response = await apiClient.get<TicketsResponse>("/support/tickets");
  return response.data;
}

/**
 * Create a new ticket
 */
export async function createTicket(
  payload: CreateTicketPayload
): Promise<TicketDetailResponse> {
  const response = await apiClient.post<TicketDetailResponse>(
    "/support/tickets",
    payload
  );
  return response.data;
}

/**
 * Get ticket details with replies
 */
export async function getTicketDetails(
  ticketNumber: string
): Promise<TicketDetailResponse> {
  const response = await apiClient.get<TicketDetailResponse>(
    `/support/tickets/${ticketNumber}`
  );
  return response.data;
}

/**
 * Reply to a ticket
 */
export async function replyToTicket(
  ticketNumber: string,
  payload: ReplyTicketPayload
): Promise<TicketDetailResponse> {
  const response = await apiClient.post<TicketDetailResponse>(
    `/support/tickets/${ticketNumber}/reply`,
    payload
  );
  return response.data;
}

/**
 * Close a ticket
 */
export async function closeTicket(
  ticketNumber: string
): Promise<TicketDetailResponse> {
  const response = await apiClient.post<TicketDetailResponse>(
    `/support/tickets/${ticketNumber}/close`
  );
  return response.data;
}

/**
 * Reopen a ticket
 */
export async function reopenTicket(
  ticketNumber: string,
  payload: ReopenTicketPayload
): Promise<TicketDetailResponse> {
  const response = await apiClient.post<TicketDetailResponse>(
    `/support/tickets/${ticketNumber}/reopen`,
    payload
  );
  return response.data;
}
