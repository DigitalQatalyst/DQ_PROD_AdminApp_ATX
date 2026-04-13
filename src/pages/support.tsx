import React, { useEffect, useMemo, useState } from 'react';
import { Columns, LayoutList, Maximize2, Sidebar } from 'lucide-react';
import { LVEWorkspaceLayout, LVETab, LVEViewMode } from '../components/layout/LVEWorkspaceLayout';
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
type SupportWorkspaceTab = 'details' | 'review_comments' | 'customer_details' | 'linked_records' | 'insights';
const WORKFLOW_STAGES = ['new', 'open', 'in_progress', 'pending', 'escalated', 'resolved', 'closed', 'reopened'] as const;
type IntakeCategory = 'Bug' | 'Technical Issue' | 'Billing' | 'Feature Request' | 'General Inquiry';
type IntakePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
type IntakeAssignedTeam = 'Support Tier 1' | 'Billing Team' | 'Tech Support';

// Allowed next states per current state (mirrors backend state machine)
const NEXT_STATES: Record<TicketStatus, TicketStatus[]> = {
  open:        ['in_progress'],
  in_progress: ['resolved', 'escalated'],
  escalated:   ['in_progress'],
  resolved:    ['closed', 'in_progress'],
  closed:      [],
};

type CreateTicketForm = {
  title: string;
  description: string;
  category: IntakeCategory;
  subcategory: string;
  priority: IntakePriority;
  severity: '' | 'Minor' | 'Major' | 'Critical';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accountOrganization: string;
  customerId: string;
  assignedAgent: string;
  teamQueue: string;
  escalationLevel: '' | 'Level 1' | 'Level 2' | 'Level 3';
  slaType: '' | 'Standard' | 'Premium' | 'Enterprise';
  firstResponseDue: string;
  resolutionDue: string;
  slaStatus: '' | 'On Track' | 'At Risk' | 'Breached';
  createdBy: string;
  lastUpdatedBy: string;
  assignedTeam: IntakeAssignedTeam | '';
  tagsText: string;
  attachments: File[];
};

const emptyForm: CreateTicketForm = {
  title: '',
  description: '',
  category: 'Technical Issue',
  subcategory: '',
  priority: 'Medium',
  severity: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  accountOrganization: '',
  customerId: '',
  assignedAgent: '',
  teamQueue: '',
  escalationLevel: '',
  slaType: '',
  firstResponseDue: '',
  resolutionDue: '',
  slaStatus: '',
  createdBy: '',
  lastUpdatedBy: '',
  assignedTeam: '',
  tagsText: '',
  attachments: [],
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
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'internal' | 'customer_auth' | 'customer_unauth'>('all');

  // Workspace state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<LVETab[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateTicketForm>(emptyForm);
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
  const [paneMode, setPaneMode] = useState<LVEViewMode>('list-work-context');
  const [workspaceTab, setWorkspaceTab] = useState<SupportWorkspaceTab>('details');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

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
      const matchOwner = ownerFilter === 'all' || (t.ownerName || 'Unassigned') === ownerFilter;
      const matchSource = sourceFilter === 'all' || t.source === sourceFilter;
      return matchSearch && matchStatus && matchPriority && matchOwner && matchSource;
    });
  }, [tickets, search, statusFilter, priorityFilter, ownerFilter, sourceFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pagedTickets = filteredTickets.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

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
    setWorkspaceTab('details');
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
    if (!form.description.trim()) { setFormError('Description is required'); return; }
    if (!form.category) { setFormError('Category is required'); return; }
    if (!form.customerEmail.trim() && !form.customerId.trim()) { setFormError('Customer email or Customer ID is required'); return; }
    try {
      setSaving(true);
      setFormError(null);
      const priorityMap: Record<IntakePriority, TicketPriority> = {
        Low: 'low',
        Medium: 'medium',
        High: 'high',
        Urgent: 'critical',
      };
      const tags = form.tagsText.split(',').map((t) => t.trim()).filter(Boolean);
      const payload: CreateTicketInput & Record<string, unknown> = {
        title: form.title.trim(),
        message: form.description.trim(),
        priority: priorityMap[form.priority || 'Medium'],
        contactEmail: form.customerEmail.trim() || undefined,
        customerUserId: form.customerId.trim() || undefined,
        source: form.customerId.trim() ? 'customer_auth' : 'customer_unauth',
        category: form.category,
        assignedTeam: form.assignedTeam || undefined,
        tags,
        attachments: form.attachments.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      };
      const created = await SupportService.createTicket(payload);
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
    if (transitionTarget === 'in_progress' && assignOwnerName.trim()) {
      // Backend validation requires ownerId for open -> in_progress.
      // For MVP, use the entered owner text as both display name and identifier.
      update.ownerName = assignOwnerName.trim();
      update.ownerId = assignOwnerName.trim();
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
    <div className="p-4 h-full flex flex-col text-[13px] text-slate-700">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-[13px] tracking-wide">Ticket Queue</div>
          <div className="text-[12px] text-slate-500">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} in view</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5 border border-gray-200">
            <button
              type="button"
              title="List only"
              onClick={() => setPaneMode('list-only')}
              className={`p-1.5 rounded-sm transition-colors ${
                paneMode === 'list-only'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="List + workspace"
              onClick={() => setPaneMode('list-work')}
              className={`p-1.5 rounded-sm transition-colors ${
                paneMode === 'list-work'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sidebar className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Workspace focus"
              onClick={() => setPaneMode('list-work')}
              className="p-1.5 rounded-sm transition-colors text-gray-500 hover:text-gray-700"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="List + workspace + context"
              onClick={() => setPaneMode('list-work-context')}
              className={`p-1.5 rounded-sm transition-colors ${
                paneMode === 'list-work-context'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={openNewTicketWorkspace}
            className={`inline-flex items-center justify-center bg-blue-600 text-white font-semibold hover:bg-blue-700 ${
              paneMode === 'list-only'
                ? 'h-9 px-3 rounded-md text-[12px]'
                : 'h-9 w-9 rounded-md text-[20px] leading-none'
            }`}
            title="Create Ticket"
          >
            {paneMode === 'list-only' ? '+ Create Ticket' : '+'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 space-y-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, name, email..."
          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All owners</option>
            {Array.from(new Set(tickets.map((t) => t.ownerName || 'Unassigned'))).map((owner) => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All sources</option>
            <option value="internal">Internal</option>
            <option value="customer_auth">Customer Auth</option>
            <option value="customer_unauth">Customer Unauth</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Loading tickets...</div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-amber-600 text-xs">{error}</div>
      ) : (
        <div className="flex-1 overflow-auto space-y-2">
          {pagedTickets.length === 0 ? (
            <div className="px-3 py-6 text-center text-slate-400 border border-slate-200 rounded-md bg-white">No tickets match the current filters.</div>
          ) : (
            pagedTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => openTicketWorkspace(t)}
                className={`w-full text-left border rounded-md px-3 py-2 transition-colors ${t.id === activeTicketId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-[15px] text-slate-900 truncate">{t.title}</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[12px] text-slate-500">
                  <span>{t.ownerName || 'Unassigned'}</span>
                  <span>Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
      <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-slate-600">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 gap-0.5">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white shadow-sm rounded-md px-2 py-1 text-[11px] text-blue-600 font-semibold border-0 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <span className="text-slate-500 text-[11px]">{(filteredTickets.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1)}–{Math.min(pageSafe * pageSize, filteredTickets.length)} of {filteredTickets.length}</span>
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 gap-0.5">
          <button
            type="button"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-2 py-1 rounded-md transition-all text-[12px] font-medium ${pageSafe <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
          >‹</button>
          <button
            type="button"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-2 py-1 rounded-md transition-all text-[12px] font-medium ${pageSafe >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
          >›</button>
        </div>
      </div>
    </div>
  );

  // ─── Work Pane ─────────────────────────────────────────────────────────────

  const workPane = (
    <div className="h-full flex flex-col">
      {/* Sticky header + workflow + tabs (view/edit mode only) */}
      {!isCreating && (
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {isCreating ? 'New Support Ticket' : activeTicket?.title || 'Support Ticket'}
            </div>
            <div className="text-[12px] text-slate-600 flex gap-4 mt-0.5 flex-wrap">
              <span>Ticket ID: <span className="font-medium">{activeTicket ? `SUP-${activeTicket.id.slice(0, 6).toUpperCase()}` : 'Auto'}</span></span>
              <span>Status: <span className="font-medium">{activeTicket ? STATUS_LABELS[activeTicket.status] : 'New'}</span></span>
              <span>Owner: <span className="font-medium">{activeTicket?.ownerName || 'Unassigned'}</span></span>
              {paneMode !== 'list-work-context' && (
                <>
                  <span>Created: <span className="font-medium">{activeTicket ? new Date(activeTicket.createdAt).toLocaleDateString() : '—'}</span></span>
                  <span>Updated: <span className="font-medium">{activeTicket ? new Date(activeTicket.updatedAt).toLocaleDateString() : '—'}</span></span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isCreating && activeTicket && (
              <>
                <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-blue-700">Assign Ticket</button>
                <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-blue-700">Escalate</button>
                <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-blue-700">Resolve</button>
                <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-blue-700">Close</button>
              </>
            )}
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="relative overflow-x-auto pb-1">
            <div className="absolute left-0 right-0 top-3 h-[2px] bg-slate-200" />
            <div className="relative grid grid-cols-8 gap-2 min-w-[900px]">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const current = activeTicket?.status || 'open';
                const normalizedCurrent = current === 'open' ? 'open' : current;
                const stageOrder = ['new', 'open', 'in_progress', 'pending', 'escalated', 'resolved', 'closed', 'reopened'];
                const active = normalizedCurrent === stage || (!activeTicket && stage === 'new');
                const completed = stageOrder.indexOf(normalizedCurrent as any) > idx;
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <span
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold bg-white ${
                        active
                          ? 'text-white border-blue-600 bg-blue-600'
                          : completed
                            ? 'text-blue-700 border-blue-500'
                            : 'text-slate-400 border-slate-300'
                      }`}
                    >
                      {completed ? '✓' : idx + 1}
                    </span>
                    <span className={`mt-1 text-[11px] font-medium capitalize ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-4 border-t border-slate-200 flex items-center gap-4 text-[11px]">
          {[
            ['details', 'Details'],
            ['review_comments', 'Review & Comments'],
            ['customer_details', 'Customer Details'],
            ['linked_records', 'Linked Records'],
            ['insights', 'Insights'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setWorkspaceTab(id as SupportWorkspaceTab)}
              className={`py-2 border-b-2 ${workspaceTab === id ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-700 space-y-4">
        {/* ── Create form ── */}
        {isCreating && (
          <>
            {formError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">{formError}</div>
            )}
            <div className="max-w-4xl space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-[22px] font-semibold leading-tight text-slate-900">Create New Ticket</h3>
                <p className="text-[13px] leading-tight text-slate-500">Fill in the details below to create support ticket.</p>
              </div>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">Basic Information</h4>
                  <p className="text-[12px] text-slate-500">Essential details about the ticket.</p>
                </header>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Title<span className="text-rose-500">*</span></label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Brief summary of the issue"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Description<span className="text-rose-500">*</span></label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[120px]"
                      placeholder="Describe the issue in detail"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">Category<span className="text-rose-500">*</span></label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as IntakeCategory }))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Bug">Bug</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Billing">Billing</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">Subcategory</label>
                      <input
                        value={form.subcategory}
                        onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Optional dependent category"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">Status & Priority</h4>
                </header>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Priority<span className="text-rose-500">*</span></label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as IntakePriority }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Severity</label>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as CreateTicketForm['severity'] }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select severity</option>
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">Customer Information</h4>
                </header>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Customer Email</label>
                    <input value={form.customerEmail} onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Customer Phone</label>
                    <input value={form.customerPhone} onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Account/Organization</label>
                    <input value={form.accountOrganization} onChange={(e) => setForm((p) => ({ ...p, accountOrganization: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Customer ID (lookup)</label>
                    <input value={form.customerId} onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Customer reference" />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">Assignment</h4>
                </header>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Assigned Agent</label>
                    <input value={form.assignedAgent} onChange={(e) => setForm((p) => ({ ...p, assignedAgent: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Team/Queue</label>
                    <input value={form.teamQueue} onChange={(e) => setForm((p) => ({ ...p, teamQueue: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Support Tier 1, Tier 2..." />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Escalation Level</label>
                    <select value={form.escalationLevel} onChange={(e) => setForm((p) => ({ ...p, escalationLevel: e.target.value as CreateTicketForm['escalationLevel'] }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">Select escalation level</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Assigned Team</label>
                    <select value={form.assignedTeam} onChange={(e) => setForm((p) => ({ ...p, assignedTeam: e.target.value as IntakeAssignedTeam | '' }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">Unassigned</option>
                      <option value="Support Tier 1">Support Tier 1</option>
                      <option value="Billing Team">Billing Team</option>
                      <option value="Tech Support">Tech Support</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">SLA & Timing</h4>
                </header>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">SLA Type</label>
                    <select value={form.slaType} onChange={(e) => setForm((p) => ({ ...p, slaType: e.target.value as CreateTicketForm['slaType'] }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">Select SLA type</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">SLA Status</label>
                    <select value={form.slaStatus} onChange={(e) => setForm((p) => ({ ...p, slaStatus: e.target.value as CreateTicketForm['slaStatus'] }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">Select status</option>
                      <option value="On Track">On Track</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Breached">Breached</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">First Response Due</label>
                    <input type="datetime-local" value={form.firstResponseDue} onChange={(e) => setForm((p) => ({ ...p, firstResponseDue: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Resolution Due</label>
                    <input type="datetime-local" value={form.resolutionDue} onChange={(e) => setForm((p) => ({ ...p, resolutionDue: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-4 py-3">
                  <h4 className="text-[14px] font-semibold text-slate-900">System Metadata</h4>
                </header>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Created By</label>
                    <input value={form.createdBy} onChange={(e) => setForm((p) => ({ ...p, createdBy: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Last Updated By</label>
                    <input value={form.lastUpdatedBy} onChange={(e) => setForm((p) => ({ ...p, lastUpdatedBy: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Attachments</label>
                    <input type="file" multiple onChange={(e) => setForm((p) => ({ ...p, attachments: Array.from(e.target.files ?? []) }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] bg-white" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">Tags</label>
                    <input value={form.tagsText} onChange={(e) => setForm((p) => ({ ...p, tagsText: e.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Comma separated tags" />
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {/* ── View / Edit existing ticket ── */}
        {!isCreating && activeTicket && workspaceTab === 'details' && (
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
                          ? 'bg-blue-600 text-white border-blue-600'
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
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
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
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
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
                      onFocus={() => {
                        if (!assignOwnerName && activeTicket.ownerName) {
                          setAssignOwnerName(activeTicket.ownerName);
                        }
                      }}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                <div className="text-[11px] font-semibold text-blue-700">Linked Service Request</div>
                <p className="text-xs text-indigo-600 font-medium">{activeTicket.serviceRequestId}</p>
              </div>
            )}
          </>
        )}
        {!isCreating && activeTicket && workspaceTab === 'review_comments' && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold text-slate-800 mb-2">Review & Comments</div>
            <p className="text-[11px] text-slate-500 mb-3">Activity timeline and replies are available in the Context pane.</p>
          </div>
        )}
        {!isCreating && activeTicket && workspaceTab === 'customer_details' && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
            <div className="text-[11px] font-semibold text-slate-800">Customer Details</div>
            <p className="text-[11px] text-slate-600">Name: {activeTicket.contactName || '—'}</p>
            <p className="text-[11px] text-slate-600">Email: {activeTicket.contactEmail || '—'}</p>
            <p className="text-[11px] text-slate-600">Phone: {activeTicket.contactPhone || '—'}</p>
            <p className="text-[11px] text-slate-600">Source: {activeTicket.source}</p>
          </div>
        )}
        {!isCreating && activeTicket && workspaceTab === 'linked_records' && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
            <div className="text-[11px] font-semibold text-slate-800">Linked Records</div>
            <p className="text-[11px] text-slate-600">Service Request: {activeTicket.serviceRequestId || '—'}</p>
            <p className="text-[11px] text-slate-600">Customer User: {activeTicket.customerUserId || '—'}</p>
          </div>
        )}
        {!isCreating && activeTicket && workspaceTab === 'insights' && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 space-y-1">
            <div className="text-[11px] font-semibold text-slate-800">Insights</div>
            <p className="text-[11px] text-slate-600">Time in current state: {STATUS_LABELS[activeTicket.status]}</p>
            <p className="text-[11px] text-slate-600">Priority trend: {PRIORITY_LABELS[activeTicket.priority]}</p>
          </div>
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
                className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={replyForm.authorType}
                onChange={(e) => setReplyForm((p) => ({ ...p, authorType: e.target.value as any }))}
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="internal">Internal</option>
                <option value="customer">Customer</option>
              </select>
              <textarea
                value={replyForm.body}
                onChange={(e) => setReplyForm((p) => ({ ...p, body: e.target.value }))}
                placeholder="Write a reply..."
                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[50px]"
              />
              <button
                type="button"
                onClick={handlePostReply}
                disabled={sendingReply}
                className="w-full rounded bg-blue-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                        className="text-[10px] text-indigo-500 hover:text-blue-700 shrink-0"
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
    ? []
    : [];

  return (
    <LVEWorkspaceLayout
      headerTitle="Support Management"
      tenantLabel="Enterprise Admin"
      streamLabel="Support Tickets"
      tabs={activeTabs}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      viewMode={paneMode}
      onViewModeChange={setPaneMode}
      listPane={listPane}
      workPane={workPane}
      popPane={popPane}
      footer={<span>MVP: Internal ticket creation and full lifecycle management.</span>}
    />
  );
};

export default SupportPage;




