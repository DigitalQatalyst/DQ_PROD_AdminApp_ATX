export type TicketStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketSource = 'customer_auth' | 'customer_unauth' | 'internal';

export interface SupportTicket {
  id: string;
  title: string;
  message: string;
  source: TicketSource;
  status: TicketStatus;
  priority: TicketPriority;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  customerUserId?: string;
  ownerId?: string;
  ownerName?: string;
  serviceRequestId?: string;
  resolutionNote?: string;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  message: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  priority?: TicketPriority;
  source?: TicketSource;
  ownerId?: string;
  ownerName?: string;
  serviceRequestId?: string;
  customerUserId?: string;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  ownerId?: string;
  ownerName?: string;
  resolutionNote?: string;
  escalationReason?: string;
  serviceRequestId?: string;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const APP_API_BASE =
  import.meta.env.VITE_APP_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

const BASE_URL = `${APP_API_BASE}/api/support/tickets`;

export class SupportService {
  static async listTickets(filters?: { status?: TicketStatus; priority?: TicketPriority }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load tickets (${res.status})`);
    const body = await res.json();
    return body.data || [];
  }

  static async createTicket(input: CreateTicketInput): Promise<SupportTicket> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to create ticket');
    return body.data;
  }

  static async updateTicket(id: string, input: UpdateTicketInput): Promise<SupportTicket> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to update ticket');
    return body.data;
  }
}

// ─── Timeline Events ──────────────────────────────────────────────────────────

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  actor_name?: string;
  from_status?: string;
  to_status?: string;
  note?: string;
  created_at: string;
}

// ─── Replies ──────────────────────────────────────────────────────────────────

export interface TicketReply {
  id: string;
  ticket_id: string;
  author_name: string;
  author_type: 'internal' | 'customer';
  body: string;
  created_at: string;
}

export interface CreateReplyInput {
  authorName: string;
  authorType: 'internal' | 'customer';
  body: string;
}

// ─── Extended SupportService methods ─────────────────────────────────────────

export class SupportEventsService {
  static async listEvents(ticketId: string): Promise<TicketEvent[]> {
    const res = await fetch(`${BASE_URL}/${ticketId}/events`);
    if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
    const body = await res.json();
    return body.data || [];
  }
}

export class SupportRepliesService {
  static async listReplies(ticketId: string): Promise<TicketReply[]> {
    const res = await fetch(`${BASE_URL}/${ticketId}/replies`);
    if (!res.ok) throw new Error(`Failed to load replies (${res.status})`);
    const body = await res.json();
    return body.data || [];
  }

  static async postReply(ticketId: string, input: CreateReplyInput): Promise<TicketReply> {
    const res = await fetch(`${BASE_URL}/${ticketId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to post reply');
    return body.data;
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface TicketNotification {
  id: string;
  ticket_id: string;
  type: string;
  recipient: string;
  message: string;
  read: boolean;
  created_at: string;
}

export class SupportNotificationsService {
  static async listNotifications(ticketId: string): Promise<TicketNotification[]> {
    const res = await fetch(`${BASE_URL}/${ticketId}/notifications`);
    if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`);
    const body = await res.json();
    return body.data || [];
  }

  static async markRead(ticketId: string, notificationId: string): Promise<void> {
    await fetch(`${BASE_URL}/${ticketId}/notifications/${notificationId}/read`, { method: 'PATCH' });
  }
}
