import React, { Component, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { OpportunityStageBadge } from '../components/OpportunityStageBadge';
import { OpportunityPriorityBadge } from '../components/OpportunityPriorityBadge';
import { OpportunityTagManager } from '../components/OpportunityTagManager';
import { OpportunityActivityTimeline } from '../components/OpportunityActivityTimeline';
import { OpportunityProcessFlow } from '../components/OpportunityProcessFlow';
import { Opportunity, TeamMember, OpportunityStage } from '../types';

// Error boundary to isolate OpportunityProcessFlow render failures
interface BpfErrorBoundaryState { hasError: boolean }
class BpfErrorBoundary extends Component<React.PropsWithChildren, BpfErrorBoundaryState> {
  state: BpfErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div className="w-full mb-6 text-xs text-muted-foreground px-1">Pipeline unavailable</div>;
    }
    return this.props.children;
  }
}

interface OpportunityDetailProps {
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onBack: () => void;
  onStageChange: (id: string, stage: OpportunityStage) => void;
  onAssign: (id: string, memberId: string) => void;
  onAddNote: (id: string, note: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Opportunity>) => void;
  usingMock?: boolean;
}

const inputCls = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const textareaCls = 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectCls = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// Inline editable field component
interface InlineEditProps {
  value: string;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  className?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, type = 'text', placeholder, className }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className={cn('h-7 w-full rounded border border-indigo-400 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500', className)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className="group flex items-center gap-1 cursor-pointer"
      onClick={() => setEditing(true)}
    >
      <span className={cn('text-sm text-gray-900', !value && 'text-gray-400 italic')}>{value || placeholder || '—'}</span>
      <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </span>
  );
};

// Inline editable select
interface InlineSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (val: string) => void;
}

const InlineSelect: React.FC<InlineSelectProps> = ({ value, options, onSave }) => {
  const [editing, setEditing] = useState(false);
  const label = options.find((o) => o.value === value)?.label ?? value;

  if (editing) {
    return (
      <select
        autoFocus
        value={value}
        onChange={(e) => { onSave(e.target.value); setEditing(false); }}
        onBlur={() => setEditing(false)}
        className="h-7 rounded border border-indigo-400 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  return (
    <span className="group flex items-center gap-1 cursor-pointer" onClick={() => setEditing(true)}>
      <span className="text-sm text-gray-900">{label}</span>
      <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </span>
  );
};

// Inline editable textarea
interface InlineTextareaProps {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
}

const InlineTextarea: React.FC<InlineTextareaProps> = ({ value, onSave, placeholder }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        rows={4}
        className="w-full rounded-md border border-indigo-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="group flex items-start gap-1 cursor-pointer" onClick={() => setEditing(true)}>
      <p className={cn('text-sm flex-1', value ? 'text-gray-700' : 'text-gray-400 italic')}>{value || placeholder || 'Click to add description...'}</p>
      <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
    </div>
  );
};

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'AED', label: 'AED' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({
  opportunity,
  teamMembers,
  onBack,
  onStageChange,
  onAssign,
  onAddNote,
  onAddTag,
  onRemoveTag,
  onDelete,
  onUpdate,
  usingMock,
}) => {
  const assignedMember = teamMembers.find((m) => m.id === opportunity.assignedTo);
  const [assignOpen, setAssignOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [callDuration, setCallDuration] = useState('15min');
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const assignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setAssignOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmailSubmit = () => {
    if (!emailSubject.trim()) return;
    onAddNote(opportunity.id, `📧 Email sent: "${emailSubject}" — ${emailMessage || 'No body'}`);
    setEmailSubject(''); setEmailMessage(''); setEmailDialogOpen(false);
  };

  const handleCallSubmit = () => {
    onAddNote(opportunity.id, `📞 Call logged (${callDuration}) — Outcome: ${callOutcome}${callNotes ? ` — Notes: ${callNotes}` : ''}`);
    setCallDuration('15min'); setCallOutcome('Connected'); setCallNotes(''); setCallDialogOpen(false);
  };

  const handleMeetingSubmit = () => {
    if (!meetingDate) return;
    onAddNote(opportunity.id, `📅 Meeting scheduled: ${meetingDate} at ${meetingTime || 'TBD'}${meetingAttendees ? ` — Attendees: ${meetingAttendees}` : ''}${meetingNotes ? ` — Notes: ${meetingNotes}` : ''}`);
    setMeetingDate(''); setMeetingTime(''); setMeetingAttendees(''); setMeetingNotes(''); setMeetingDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{opportunity.title}</h1>
              <OpportunityStageBadge stage={opportunity.stage} />
              {opportunity.priority && <OpportunityPriorityBadge priority={opportunity.priority} />}
            </div>
            {opportunity.companyName && (
              <p className="text-sm text-gray-500">{opportunity.companyName}{opportunity.contactEmail ? ` • ${opportunity.contactEmail}` : ''}</p>
            )}
          </div>
        </div>
        {usingMock && (
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-medium">
            Mock Data
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <BpfErrorBoundary>
          <OpportunityProcessFlow
            opportunityId={opportunity.id}
            currentStage={opportunity.stage}
            opportunity={opportunity}
            teamMembers={teamMembers}
            onStageChange={onStageChange}
            onUpdate={onUpdate}
          />
        </BpfErrorBoundary>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (1/3) */}
          <div className="space-y-6">
            {/* Deal Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deal Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                  <InlineEdit
                    value={String(opportunity.dealValue)}
                    type="number"
                    placeholder="0"
                    onSave={(v) => onUpdate(opportunity.id, { dealValue: Number(v) })}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Currency</p>
                  <InlineSelect
                    value={opportunity.currency}
                    options={CURRENCY_OPTIONS}
                    onSave={(v) => onUpdate(opportunity.id, { currency: v })}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Probability (%)</p>
                  <InlineEdit
                    value={String(opportunity.probability)}
                    type="number"
                    placeholder="0"
                    onSave={(v) => onUpdate(opportunity.id, { probability: Math.min(100, Math.max(0, Number(v))) })}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Close Date</p>
                  <InlineEdit
                    value={opportunity.closeDate ?? ''}
                    type="date"
                    onSave={(v) => onUpdate(opportunity.id, { closeDate: v })}
                  />
                </div>
              </div>
            </div>

            {/* Company & Contact Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Company & Contact</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <InlineEdit value={opportunity.companyName ?? ''} placeholder="Company name" onSave={(v) => onUpdate(opportunity.id, { companyName: v })} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Name</p>
                  <InlineEdit value={opportunity.contactName ?? ''} placeholder="Contact name" onSave={(v) => onUpdate(opportunity.id, { contactName: v })} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                  <InlineEdit value={opportunity.contactEmail ?? ''} type="email" placeholder="email@example.com" onSave={(v) => onUpdate(opportunity.id, { contactEmail: v })} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Phone</p>
                  <InlineEdit value={opportunity.contactPhone ?? ''} type="tel" placeholder="+1 234 567 890" onSave={(v) => onUpdate(opportunity.id, { contactPhone: v })} />
                </div>
              </div>
            </div>

            {/* Assignee Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Assignee</h3>
              <div ref={assignRef} className="relative">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={cn('text-white text-xs', assignedMember?.color)}>
                        {assignedMember?.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignedMember?.name ?? 'Unassigned'}</p>
                      <p className="text-xs text-gray-500">{assignedMember?.role ?? ''}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAssignOpen(!assignOpen)}>
                    Reassign
                  </Button>
                </div>
                {assignOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => { onAssign(opportunity.id, member.id); setAssignOpen(false); }}
                        className={cn('flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors hover:bg-gray-50', member.id === opportunity.assignedTo && 'bg-gray-50')}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className={cn('text-white text-[10px]', member.color)}>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                        {member.id === opportunity.assignedTo && <span className="text-xs text-gray-400 font-medium">Current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Tags</h3>
              <OpportunityTagManager
                tags={opportunity.tags}
                onAddTag={(tag) => onAddTag(opportunity.id, tag)}
                onRemoveTag={(tag) => onRemoveTag(opportunity.id, tag)}
              />
            </div>

            {/* View Source Lead link */}
            {opportunity.leadId && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <a
                  href={`#lead-${opportunity.leadId}`}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Source Lead →
                </a>
              </div>
            )}
          </div>

          {/* Right Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Description</h3>
              <InlineTextarea
                value={opportunity.description ?? ''}
                placeholder="Add a description..."
                onSave={(v) => onUpdate(opportunity.id, { description: v })}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', onClick: () => setEmailDialogOpen(true) },
                { icon: Phone, label: 'Log Call', onClick: () => setCallDialogOpen(true) },
                { icon: Calendar, label: 'Meeting', onClick: () => setMeetingDialogOpen(true) },
              ].map(({ icon: Icon, label, onClick }) => (
                <Button
                  key={label}
                  variant="outline"
                  onClick={onClick}
                  className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50 hover:border-orange-500/50 group"
                >
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                  <span className="text-xs font-medium">{label}</span>
                </Button>
              ))}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
              <OpportunityActivityTimeline
                activities={opportunity.activities}
                onAddNote={(note) => onAddNote(opportunity.id, note)}
              />
            </div>

            {/* Delete Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {emailDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEmailDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[500px] mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Send Email</h2>
            <div className="space-y-3">
              <div><label className="text-sm font-medium text-gray-700">Subject *</label><input className={inputCls} value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." /></div>
              <div><label className="text-sm font-medium text-gray-700">Message</label><textarea className={textareaCls} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Email body..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleEmailSubmit}>Send Email</Button>
            </div>
          </div>
        </div>
      )}

      {callDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCallDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[500px] mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Phone className="w-5 h-5" /> Log Call</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <select className={selectCls} value={callDuration} onChange={(e) => setCallDuration(e.target.value)}>
                  <option>5min</option><option>15min</option><option>30min</option><option>45min</option><option>60min</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Outcome</label>
                <select className={selectCls} value={callOutcome} onChange={(e) => setCallOutcome(e.target.value)}>
                  <option>Connected</option><option>No Answer</option><option>Left Voicemail</option><option>Busy</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Notes</label><textarea className={textareaCls} value={callNotes} onChange={(e) => setCallNotes(e.target.value)} placeholder="Call notes..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleCallSubmit}>Log Call</Button>
            </div>
          </div>
        </div>
      )}

      {meetingDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMeetingDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[500px] mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Schedule Meeting</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">Date *</label><input type="date" className={inputCls} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} /></div>
                <div><label className="text-sm font-medium text-gray-700">Time</label><input type="time" className={inputCls} value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Attendees</label><input className={inputCls} value={meetingAttendees} onChange={(e) => setMeetingAttendees(e.target.value)} placeholder="Names or emails..." /></div>
              <div><label className="text-sm font-medium text-gray-700">Notes</label><textarea className={textareaCls} value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} placeholder="Meeting agenda..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleMeetingSubmit}>Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[400px] mx-4 p-6">
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5" /> Delete Opportunity</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{opportunity.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { onDelete(opportunity.id); setDeleteDialogOpen(false); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
