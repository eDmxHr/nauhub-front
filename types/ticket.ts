export interface CategoriesResponse {
  categories: {
    [key: string]: string; // e.g., "movie_request": "Movie Request"
  };
  priorities: {
    [key: string]: string; // e.g., "low": "Low"
  };
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  user_id: number;
  category_id: number | string; // Can be numeric ID or string key
  priority_id: number | string; // Can be numeric ID or string key
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  category?: string; // Category name or key
  priority?: string; // Priority name or key
}

export interface TicketDetail extends Ticket {
  replies: TicketReply[];
}

export interface TicketsResponse {
  tickets: Ticket[];
}

export interface CreateTicketPayload {
  category: string; // Category key (e.g., "movie_request")
  priority_id: string; // Priority key (e.g., "low")
  subject: string;
  description: string;
}

export interface ReplyTicketPayload {
  message: string;
}

export interface ReopenTicketPayload {
  reason: string;
}

export interface TicketDetailResponse {
  ticket: TicketDetail;
}
