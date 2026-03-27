import React, { useEffect, useMemo, useState } from 'react';
import { LVEWorkspaceLayout, LVETab } from '../components/layout/LVEWorkspaceLayout';
import {
  SupportTicket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketStatus,
  TicketPriority,
  TicketEvent,
  TicketReply,
  TicketNotification,
  CreateReplyInput,
  SupportService,
  SupportEventsService,
  SupportRepliesService,
  SupportNotificationsService,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '../api/support/supportService';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS: TicketStatus[] = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];

// Allowed next states per current state (mirrors backend state machine)
const NEXT_STATES: Record<TicketStatus, TicketStatus[]> = {
  open:        ['in_progress'],
  in_progress: ['resolved', 'escalated'],
  escalated:   ['in_progress'],
  resolved:    ['closed', 'in_progress'],
  closed:      [],
};

const emptyForm: CreateTicketInput = {
  title: '',
  message: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  priority: 'medium',
  source: 'internal',
  ownerName: '',
  serviceRequestId: '',
  customerUserId: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');

  // Workspace state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<LVETab[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateTicketInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Transition modal state
  const [transitionTarget, setTransitionTarget] = useState<TicketStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [assignOwnerName, setAssignOwnerName] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Timeline & replies
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [replyForm, setReplyForm] = useState<CreateReplyInput>({ authorName: '', authorType: 'internal', body: '' });
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  // ─── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupportService.listTickets();
      setTickets(data);
      if (data.length > 0) {
        openTicketWorkspace(data[0]);
      } else {
        openNewTicketWorkspace();
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.contactName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.contactEmail || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) || null,
    [tickets, activeTicketId]
  );

  // ─── Workspace helpers ─────────────────────────────────────────────────────

  const openTicketWorkspace = (ticket: SupportTicket) => {
    setActiveTicketId(ticket.id);
    setIsCreating(false);
    setFormError(null);
    setTransitionTarget(null);
    setEvents([]);
    setReplies([]);
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === ticket.id);
      const next = exists
        ? prev
        : [...prev.filter((t) => t.id !== 'new-ticket'), { id: ticket.id, label: `#${ticket.id.slice(0, 6)} ${ticket.title}` }];
      return next.map((t) => ({ ...t, isActive: t.id === ticket.id }));
    });
    // Load timeline and replies
    SupportEventsService.listEvents(ticket.id).then(setEvents).catch((_e) => { /* silent */ });
    SupportRepliesService.listReplies(ticket.id).then(setReplies).catch((_e) => { /* silent */ });
    SupportNotificationsService.listNotifications(ticket.id).then(setNotifications).catch((_e) => { /* silent */ });
  };

  const openNewTicketWorkspace = () => {
    setActiveTicketId(null);
    setIsCreating(true);
    setForm(emptyForm);
    setFormError(null);
    setTransitionTarget(null);
    setTabs((prev) =>
      [...prev.filter((t) => t.id !== 'new-ticket'), { id: 'new-ticket', label: 'New Ticket' }]
        .map((t) => ({ ...t, isActive: t.id === 'new-ticket' }))
    );
  };

  const handleTabSelect = (tabId: string) => {
    if (tabId === 'new-ticket') { openNewTicketWorkspace(); return; }
    const ticket = tickets.find((t) => t.id === tabId);
    if (ticket) openTicketWorkspace(ticket);
  };

  const handleTabClose = (tabId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (remaining.length === 0) { openNewTicketWorkspace(); return [{ id: 'new-ticket', label: 'New Ticket', isActive: true }]; }
      if (prev.find((t) => t.id === tabId)?.isActive) {
        const next = remaining[remaining.length - 1];
        handleTabSelect(next.id);
        return remaining.map((t) => ({ ...t, isActive: t.id === next.id }));
      }
      return remaining;
    });
  };

  // ─── Create ticket ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.message.trim()) { setFormError('Message is required'); return; }
    if (!form.contactEmail?.trim() && !form.contactPhone?.trim()) {
      setFormError('Contact email or phone is required'); return;
    }
    if (form.source === 'customer_unauth' && !form.contactName?.trim()) {
      setFormError('Contact name is required for unauthenticated customer tickets'); return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const created = await SupportService.createTicket(form);
      setTickets((prev) => [created, ...prev]);
      openTicketWorkspace(created);
    } catch (e: any) {
      setFormError(e?.message || 'Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  // ─── Transition ticket ─────────────────────────────────────────────────────

  const handleTransition = async () => {
    if (!activeTicket || !transitionTarget) return;
    setTransitionError(null);

    const update: UpdateTicketInput = { status: transitionTarget };
    if (transitionTarget === 'resolved') update.resolutionNote = resolutionNote;
    if (transitionTarget === 'escalated') update.escalationReason = escalationReason;
    if (transitionTarget === 'in_progress' && assignOwnerName) {
      update.ownerName = assignOwnerName;
    }

    try {
      setTransitioning(true);
      const updated = await SupportService.updateTicket(activeTicket.id, update);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setTransitionTarget(null);
      setResolutionNote('');
      setEscalationReason('');
      setAssignOwnerName('');
    } catch (e: any) {
      setTransitionError(e?.message || 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  // ─── Assign owner ──────────────────────────────────────────────────────────

  const handleAssign = async (ownerName: string) => {
    if (!activeTicket) return;
    try {
      const updated = await SupportService.updateTicket(activeTicket.id, { ownerName, ownerId: ownerName });
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e: any) {
      setFormError(e?.message || 'Failed to assign owner');
    }
  };

  // ─── Post reply ────────────────────────────────────────────────────────────

  const handlePostReply = async () => {
    if (!activeTicket) return;
    if (!replyForm.authorName.trim()) { setReplyError('Author name is required'); return; }
    if (!replyForm.body.trim()) { setReplyError('Reply message is required'); return; }
    try {
      setSendingReply(true);
      setReplyError(null);
      const reply = await SupportRepliesService.postReply(activeTicket.id, replyForm);
      setReplies((prev) => [...prev, reply]);
      setReplyForm((p) => ({ ...p, body: '' }));
      // Refresh notifications
      SupportNotificationsService.listNotifications(activeTicket.id).then(setNotifications).catch((_e) => { /* silent */ });
    } catch (e: any) {
      setReplyError(e?.message || 'Failed to post reply');
    } finally {
      setSendingReply(false);
    }
  };

  // ─── Panes ─────────────────────────────────────────────────────────────────

  const listPane = (
    <div className="p-4 h-full flex flex-col text-xs text-slate-700">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase">Ticket Queue</div>
          <div className="text-[10px] text-slate-400">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} in view</div>
        </div>
        <button
          type="button"
          onClick={openNewTicketWorkspace}
          className="inline-flex items-center rounded-md bg-indigo-600 text-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-indigo-700"
        >
          + New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="mb-3 space-y-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, name, email..."
          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Loading tickets...</div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-amber-600 text-xs">{error}</div>
      ) : (
        <div className="flex-1 overflow-auto border border-slate-200 rounded-md bg-white">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Title</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Priority</th>
                <th className="px-3 py-2 text-left font-semibold">Owner</th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No tickets match the current filters.</td></tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => openTicketWorkspace(t)}
                    className={`cursor-pointer border-b border-slate-100 ${t.id === activeTicketId ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 font-medium text-slate-900 max-w-[140px] truncate">{t.title}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[t.priority]}`}>
                        {PRIORITY_LABELS[t.priority]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{t.ownerName || 'Unassigned'}</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── Work Pane ─────────────────────────────────────────────────────────────

  const workPane = (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">
            {isCreating ? 'Create Ticket' : 'Ticket Workspace'}
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {isCreating ? 'New Support Ticket' : activeTicket?.title || '—'}
          </div>
        </div>
        {activeTicket && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[activeTicket.status]}`}>
              {STATUS_LABELS[activeTicket.status]}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[activeTicket.priority]}`}>
              {PRIORITY_LABELS[activeTicket.priority]}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-700 space-y-4">
        {/* ── Create form ── */}
        {isCreating && (
          <>
            {formError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">{formError}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Title<span className="text-rose-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Message<span className="text-rose-500">*</span></label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                  placeholder="Describe the issue in detail (immutable after creation)"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  value={form.contactName || ''}
                  onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Email<span className="text-rose-500">*</span></label>
                <input
                  value={form.contactEmail || ''}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  value={form.contactPhone || ''}
                  onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="+971..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority || 'medium'}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TicketPriority }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Owner</label>
                <input
                  value={form.ownerName || ''}
                  onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Assigned agent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Creation Source</label>
                <select
                  value={form.source || 'internal'}
                  onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as any, customerUserId: e.target.value !== 'customer_auth' ? '' : p.customerUserId }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="internal">Internal (agent/phone)</option>
                  <option value="customer_auth">Customer — Authenticated</option>
                  <option value="customer_unauth">Customer — Unauthenticated</option>
                </select>
              </div>
              {form.source === 'customer_auth' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer User ID</label>
                  <input
                    value={(form as any).customerUserId || ''}
                    onChange={(e) => setForm((p) => ({ ...p, customerUserId: e.target.value } as any))}
                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Authenticated customer's user ID"
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Request ID</label>
                <input
                  value={form.serviceRequestId || ''}
                  onChange={(e) => setForm((p) => ({ ...p, serviceRequestId: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Optional — link to a Service Request (e.g. SR-XXXX)"
                />
              </div>
            </div>
          </>
        )}

        {/* ── View / Edit existing ticket ── */}
        {!isCreating && activeTicket && (
          <>
            {formError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">{formError}</div>
            )}

            {/* Immutable fields */}
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Original Message (immutable)</div>
              <p className="text-xs text-slate-800 whitespace-pre-wrap">{activeTicket.message}</p>
              <div className="flex gap-4 text-[11px] text-slate-500">
                <span>Source: <span className="font-medium text-slate-700">{activeTicket.source}</span></span>
                {activeTicket.contactEmail && <span>Email: <span className="font-medium text-slate-700">{activeTicket.contactEmail}</span></span>}
                {activeTicket.contactPhone && <span>Phone: <span className="font-medium text-slate-700">{activeTicket.contactPhone}</span></span>}
              </div>
            </div>

            {/* State machine actions */}
            {NEXT_STATES[activeTicket.status].length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Transition Ticket</div>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATES[activeTicket.status].map((next) => (
                    <button
                      key={next}
                      type="button"
                      onClick={() => { setTransitionTarget(next); setTransitionError(null); }}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-medium border ${
                        transitionTarget === next
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      → {STATUS_LABELS[next]}
                    </button>
                  ))}
                </div>

                {/* Transition inputs */}
                {transitionTarget === 'resolved' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Resolution Note<span className="text-rose-500">*</span></label>
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
                      placeholder="Describe how the issue was resolved"
                    />
                  </div>
                )}
                {transitionTarget === 'escalated' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Escalation Reason<span className="text-rose-500">*</span></label>
                    <textarea
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px]"
                      placeholder="Why is this being escalated?"
                    />
                  </div>
                )}
                {transitionTarget === 'in_progress' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assign Owner</label>
                    <input
                      value={assignOwnerName}
                      onChange={(e) => setAssignOwnerName(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Agent name"
                    />
                  </div>
                )}
                {transitionError && (
                  <div className="text-xs text-red-600">{transitionError}</div>
                )}
                {transitionTarget && (
                  <button
                    type="button"
                    onClick={handleTransition}
                    disabled={transitioning}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {transitioning ? 'Saving...' : `Confirm → ${STATUS_LABELS[transitionTarget]}`}
                  </button>
                )}
              </div>
            )}

            {activeTicket.status === 'closed' && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                This ticket is closed. No further transitions are allowed.
              </div>
            )}

            {/* Resolution note display */}
            {activeTicket.resolutionNote && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 space-y-1">
                <div className="text-[11px] font-semibold text-green-700">Resolution Note</div>
                <p className="text-xs text-green-800">{activeTicket.resolutionNote}</p>
              </div>
            )}

            {/* Linked customer — shown when ticket was created by authenticated customer */}
            {activeTicket.customerUserId && (
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Linked Customer</div>
                <p className="text-xs text-slate-500">Customer user ID: <span className="font-medium text-slate-700">{activeTicket.customerUserId}</span></p>
              </div>
            )}

            {/* Linked Service Request */}
            {activeTicket.serviceRequestId && (
              <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 space-y-1">
                <div className="text-[11px] font-semibold text-indigo-700">Linked Service Request</div>
                <p className="text-xs text-indigo-600 font-medium">{activeTicket.serviceRequestId}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-slate-200 px-4 py-2 flex items-center justify-between bg-slate-50">
        <div className="text-[11px] text-slate-500">
          {isCreating ? 'New ticket — state will be set to Open.' : `ID: ${activeTicket?.id?.slice(0, 8)}...`}
        </div>
        <div className="flex items-center gap-2">
          {isCreating && (
            <>
              <button
                type="button"
                onClick={openNewTicketWorkspace}
                className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700 bg-white hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Ticket'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Pop Pane ───────────────────────────────────────────────────────────────

  const popPane = (
    <div className="p-4 text-xs text-slate-700 space-y-3">
      <div className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase mb-1">Ticket Context</div>

      {activeTicket ? (
        <>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-800">At a Glance</div>
            <div className="text-[11px] text-slate-600">Status: <span className="font-medium">{STATUS_LABELS[activeTicket.status]}</span></div>
            <div className="text-[11px] text-slate-600">Priority: <span className="font-medium">{PRIORITY_LABELS[activeTicket.priority]}</span></div>
            <div className="text-[11px] text-slate-600">Owner: <span className="font-medium">{activeTicket.ownerName || 'Unassigned'}</span></div>
            <div className="text-[11px] text-slate-600">Source: <span className="font-medium">{activeTicket.source}</span></div>
            <div className="text-[11px] text-slate-600">Created: <span className="font-medium">{new Date(activeTicket.createdAt).toLocaleString()}</span></div>
          </div>

          {activeTicket.contactName && (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">Contact</div>
              <div className="text-[11px] text-slate-600">{activeTicket.contactName}</div>
              {activeTicket.contactEmail && <div className="text-[11px] text-slate-500">{activeTicket.contactEmail}</div>}
              {activeTicket.contactPhone && <div className="text-[11px] text-slate-500">{activeTicket.contactPhone}</div>}
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold text-slate-800 mb-2">Timeline</div>
            {events.length === 0 ? (
              <p className="text-[11px] text-slate-400">No events yet.</p>
            ) : (
              <ol className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-2 text-[11px]">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-700 capitalize">{ev.event_type.replace(/_/g, ' ')}</span>
                      {ev.from_status && ev.to_status && (
                        <span className="text-slate-500"> · {ev.from_status} → {ev.to_status}</span>
                      )}
                      {ev.actor_name && <span className="text-slate-500"> by {ev.actor_name}</span>}
                      {ev.note && <p className="text-slate-500 mt-0.5">{ev.note}</p>}
                      <p className="text-slate-400">{new Date(ev.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Customer Reply Thread */}
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-2">
            <div className="text-[11px] font-semibold text-slate-800">Reply Thread</div>
            {replies.length === 0 ? (
              <p className="text-[11px] text-slate-400">No replies yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-md px-2 py-1.5 text-[11px] ${
                      r.author_type === 'customer'
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-slate-800">{r.author_name}</span>
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${r.author_type === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                        {r.author_type}
                      </span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{r.body}</p>
                    <p className="text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply compose */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              {replyError && <p className="text-[11px] text-red-600">{replyError}</p>}
              <input
                value={replyForm.authorName}
                onChange={(e) => setReplyForm((p) => ({ ...p, authorName: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={replyForm.authorType}
                onChange={(e) => setReplyForm((p) => ({ ...p, authorType: e.target.value as any }))}
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="internal">Internal</option>
                <option value="customer">Customer</option>
              </select>
              <textarea
                value={replyForm.body}
                onChange={(e) => setReplyForm((p) => ({ ...p, body: e.target.value }))}
                placeholder="Write a reply..."
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[50px]"
              />
              <button
                type="button"
                onClick={handlePostReply}
                disabled={sendingReply}
                className="w-full rounded bg-indigo-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>

          {/* Linked Customer User ID */}
          {activeTicket.customerUserId && (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">Linked Customer</div>
              <div className="text-[11px] text-slate-500">User ID:</div>
              <div className="text-[11px] font-mono text-slate-700 break-all">{activeTicket.customerUserId}</div>
            </div>
          )}

          {/* Notification Log */}
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-800">Notification Log</div>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="text-[10px] rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 font-medium">
                  {notifications.filter((n) => !n.read).length} unread
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-[11px] text-slate-400">No notifications yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded px-2 py-1.5 text-[11px] flex items-start gap-2 ${n.read ? 'bg-slate-50 text-slate-400' : 'bg-amber-50 border border-amber-100 text-slate-700'}`}
                  >
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${n.read ? 'bg-slate-300' : 'bg-amber-400'}`} />
                    <div className="flex-1">
                      <p>{n.message}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{n.recipient}</span>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => {
                          SupportNotificationsService.markRead(activeTicket.id, n.id);
                          setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
                        }}
                        className="text-[10px] text-indigo-500 hover:text-indigo-700 shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-slate-400 text-[11px]">Select a ticket to see context.</p>
      )}
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const activeTabs: LVETab[] = tabs.length === 0
    ? [{ id: 'new-ticket', label: 'New Ticket', isActive: true }]
    : tabs;

  return (
    <LVEWorkspaceLayout
      headerTitle="Support Management"
      tenantLabel="Enterprise Admin"
      streamLabel="Support Tickets"
      tabs={activeTabs}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      listPane={listPane}
      workPane={workPane}
      popPane={popPane}
      footer={<span>MVP: Internal ticket creation and full lifecycle management.</span>}
    />
  );
};

export default SupportPage;
