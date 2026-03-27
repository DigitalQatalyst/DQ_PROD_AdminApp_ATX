import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../auth/utils/supabaseClient';

/**
 * Support Tickets API — backed by Supabase table `public.support_tickets`.
 * MVP: Internal creation + full lifecycle management.
 * Future: customer_auth and customer_unauth creation paths.
 */

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

// Valid state machine transitions
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open:        ['in_progress'],
  in_progress: ['resolved', 'escalated'],
  escalated:   ['in_progress'],
  resolved:    ['closed', 'in_progress'],
  closed:      [], // terminal
};

const TABLE = 'support_tickets';

function rowToTicket(r: any): SupportTicket {
  return {
    id: r.id,
    title: r.title,
    message: r.message,
    source: r.source,
    status: r.status,
    priority: r.priority ?? 'medium',
    contactName: r.contact_name ?? undefined,
    contactEmail: r.contact_email ?? undefined,
    contactPhone: r.contact_phone ?? undefined,
    customerUserId: r.customer_user_id ?? undefined,
    ownerId: r.owner_id ?? undefined,
    ownerName: r.owner_name ?? undefined,
    serviceRequestId: r.service_request_id ?? undefined,
    resolutionNote: r.resolution_note ?? undefined,
    escalationReason: r.escalation_reason ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const SELECT_COLS = 'id, title, message, source, status, priority, contact_name, contact_email, contact_phone, customer_user_id, owner_id, owner_name, service_request_id, resolution_note, escalation_reason, created_at, updated_at';

// ─── Helper: insert timeline event ───────────────────────────────────────────
async function insertEvent(ticketId: string, eventType: string, opts: {
  actorName?: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
} = {}) {
  await supabaseAdmin.from('support_ticket_events').insert({
    ticket_id: ticketId,
    event_type: eventType,
    actor_name: opts.actorName ?? null,
    from_status: opts.fromStatus ?? null,
    to_status: opts.toStatus ?? null,
    note: opts.note ?? null,
  });
}

// ─── Helper: insert notification ─────────────────────────────────────────────
async function insertNotification(ticketId: string, type: string, recipient: string, message: string) {
  await supabaseAdmin.from('support_ticket_notifications').insert({
    ticket_id: ticketId,
    type,
    recipient,
    message,
    read: false,
  });
}

const router = Router();

// ─── GET /api/support/tickets ────────────────────────────────────────────────
// Filters: status, owner_id, priority
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    let query = supabaseAdmin
      .from(TABLE)
      .select(SELECT_COLS)
      .order('created_at', { ascending: false });

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.owner_id) query = query.eq('owner_id', req.query.owner_id);
    if (req.query.priority) query = query.eq('priority', req.query.priority);

    const { data, error } = await query;
    if (error) {
      console.error('Support GET error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
    return res.json({ status: 'success', data: (data ?? []).map(rowToTicket) });
  } catch (e) {
    console.error('Support GET exception:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to load tickets' });
  }
});

// ─── GET /api/support/tickets/:id ────────────────────────────────────────────
router.get('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select(SELECT_COLS)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ status: 'error', message: 'Ticket not found' });
      return res.status(500).json({ status: 'error', message: error.message });
    }
    return res.json({ status: 'success', data: rowToTicket(data) });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to load ticket' });
  }
});

// ─── POST /api/support/tickets ───────────────────────────────────────────────
router.post('/tickets', async (req: Request, res: Response) => {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim() : '';
  const contactPhone = typeof body.contactPhone === 'string' ? body.contactPhone.trim() : '';
  const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : '';

  if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });
  if (!message) return res.status(400).json({ status: 'error', message: 'Message is required' });
  if (!contactEmail && !contactPhone) {
    return res.status(400).json({ status: 'error', message: 'Contact email or phone is required' });
  }

  const payload: Record<string, unknown> = {
    title,
    message,
    source: body.source ?? 'internal',
    status: 'open',
    priority: body.priority ?? 'medium',
    contact_name: contactName || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
    customer_user_id: body.customerUserId ?? null,
    owner_id: body.ownerId ?? null,
    owner_name: body.ownerName ?? null,
    service_request_id: body.serviceRequestId ?? null,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(payload)
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.error('Support POST error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }

    const created = rowToTicket(data);

    // Auto-insert timeline event and notification
    await insertEvent(created.id, 'created', { actorName: created.ownerName ?? 'System', note: `Ticket created via ${created.source}` });
    await insertNotification(created.id, 'ticket_created', 'internal', `New ticket: "${created.title}" was created.`);
    if (created.source !== 'internal') {
      await insertNotification(created.id, 'ticket_created', 'customer', `Your support ticket "${created.title}" has been received.`);
    }

    return res.status(201).json({ status: 'success', data: created });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to create ticket' });
  }
});

// ─── PATCH /api/support/tickets/:id ─────────────────────────────────────────
// Handles: assign owner, change status (with transition validation), update fields
router.patch('/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body || {};

  try {
    // Fetch current ticket
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from(TABLE)
      .select(SELECT_COLS)
      .eq('id', id)
      .single();

    if (fetchErr || !current) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    }

    const ticket = rowToTicket(current);
    const updates: Record<string, unknown> = {};

    // Status transition validation
    if (body.status && body.status !== ticket.status) {
      const newStatus: TicketStatus = body.status;

      if (ticket.status === 'closed') {
        return res.status(400).json({ status: 'error', message: 'Closed tickets cannot be transitioned' });
      }
      if (!ALLOWED_TRANSITIONS[ticket.status].includes(newStatus)) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot transition from '${ticket.status}' to '${newStatus}'`,
        });
      }
      // Resolve requires resolution note
      if (newStatus === 'resolved' && !body.resolutionNote && !ticket.resolutionNote) {
        return res.status(400).json({ status: 'error', message: 'Resolution note is required to resolve a ticket' });
      }
      // Escalate requires reason
      if (newStatus === 'escalated' && !body.escalationReason) {
        return res.status(400).json({ status: 'error', message: 'Escalation reason is required' });
      }
      // Assigning owner on open → in_progress
      if (newStatus === 'in_progress' && !body.ownerId && !ticket.ownerId) {
        return res.status(400).json({ status: 'error', message: 'Owner must be assigned to move to in_progress' });
      }

      updates.status = newStatus;
    }

    // Owner assignment — if open and owner set, auto-advance to in_progress
    if (body.ownerId !== undefined) {
      updates.owner_id = body.ownerId;
      updates.owner_name = body.ownerName ?? null;
      if (ticket.status === 'open' && body.ownerId) {
        updates.status = 'in_progress';
      }
    }

    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.resolutionNote !== undefined) updates.resolution_note = body.resolutionNote;
    if (body.escalationReason !== undefined) updates.escalation_reason = body.escalationReason;
    if (body.serviceRequestId !== undefined) updates.service_request_id = body.serviceRequestId;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.error('Support PATCH error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }

    const updated = rowToTicket(data);

    // Auto-insert timeline events
    if (updates.status && updates.status !== ticket.status) {
      await insertEvent(updated.id, 'status_changed', {
        actorName: body.actorName ?? updated.ownerName ?? 'System',
        fromStatus: ticket.status,
        toStatus: updates.status as string,
        note: updates.resolution_note as string ?? updates.escalation_reason as string ?? undefined,
      });
      // Notifications
      if (updates.status === 'resolved') {
        await insertNotification(updated.id, 'ticket_resolved', 'internal', `Ticket "${updated.title}" has been resolved.`);
        await insertNotification(updated.id, 'ticket_resolved', 'customer', `Your ticket "${updated.title}" has been resolved.`);
      }
      if (updates.status === 'escalated') {
        await insertNotification(updated.id, 'ticket_escalated', 'internal', `Ticket "${updated.title}" has been escalated.`);
      }
    }
    if (updates.owner_id && updates.owner_id !== ticket.ownerId) {
      await insertEvent(updated.id, 'assigned', {
        actorName: 'System',
        note: `Assigned to ${updates.owner_name ?? updates.owner_id}`,
      });
      await insertNotification(updated.id, 'ticket_assigned', 'internal', `Ticket "${updated.title}" assigned to ${updates.owner_name ?? updates.owner_id}.`);
    }

    return res.json({ status: 'success', data: updated });
  } catch (e) {
    console.error('Support PATCH exception:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to update ticket' });
  }
});

export default router;

// ─── GET /api/support/tickets/:id/events ─────────────────────────────────────
router.get('/tickets/:id/events', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_ticket_events')
      .select('id, ticket_id, event_type, actor_name, from_status, to_status, note, created_at')
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    return res.json({ status: 'success', data: data ?? [] });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to load events' });
  }
});

// ─── POST /api/support/tickets/:id/events ────────────────────────────────────
router.post('/tickets/:id/events', async (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.event_type) return res.status(400).json({ status: 'error', message: 'event_type is required' });

  try {
    const { data, error } = await supabaseAdmin
      .from('support_ticket_events')
      .insert({
        ticket_id: req.params.id,
        event_type: body.event_type,
        actor_name: body.actor_name ?? null,
        from_status: body.from_status ?? null,
        to_status: body.to_status ?? null,
        note: body.note ?? null,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    return res.status(201).json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
});

// ─── GET /api/support/tickets/:id/replies ────────────────────────────────────
router.get('/tickets/:id/replies', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_ticket_replies')
      .select('id, ticket_id, author_name, author_type, body, created_at')
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    return res.json({ status: 'success', data: data ?? [] });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to load replies' });
  }
});

// ─── POST /api/support/tickets/:id/replies ───────────────────────────────────
router.post('/tickets/:id/replies', async (req: Request, res: Response) => {
  const body = req.body || {};
  const authorName = typeof body.authorName === 'string' ? body.authorName.trim() : '';
  const replyBody = typeof body.body === 'string' ? body.body.trim() : '';

  if (!authorName) return res.status(400).json({ status: 'error', message: 'authorName is required' });
  if (!replyBody) return res.status(400).json({ status: 'error', message: 'body is required' });

  try {
    const { data, error } = await supabaseAdmin
      .from('support_ticket_replies')
      .insert({
        ticket_id: req.params.id,
        author_name: authorName,
        author_type: body.authorType ?? 'internal',
        body: replyBody,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ status: 'error', message: error.message });

    // Notify the other party when a reply is posted
    const notifyRecipient = (body.authorType ?? 'internal') === 'customer' ? 'internal' : 'customer';
    await insertNotification(req.params.id, 'reply_received', notifyRecipient, `New reply from ${authorName}.`);

    return res.status(201).json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to post reply' });
  }
});

// ─── GET /api/support/tickets/:id/notifications ───────────────────────────────
router.get('/tickets/:id/notifications', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_ticket_notifications')
      .select('id, ticket_id, type, recipient, message, read, created_at')
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    return res.json({ status: 'success', data: data ?? [] });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to load notifications' });
  }
});

// ─── PATCH /api/support/tickets/:id/notifications/:nid/read ──────────────────
router.patch('/tickets/:id/notifications/:nid/read', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('support_ticket_notifications')
      .update({ read: true })
      .eq('id', req.params.nid)
      .eq('ticket_id', req.params.id);

    if (error) return res.status(500).json({ status: 'error', message: error.message });
    return res.json({ status: 'success' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to mark notification read' });
  }
});
