import React, { Component, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, MoreHorizontal, Edit, CheckCircle, CheckCircle2, FileText, Clock, Briefcase, Building2, Target, Trash2, Download } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { LeadScoreBadge } from '../components/LeadScoreBadge';
import { LeadSourceBadge } from '../components/LeadSourceBadge';
import { LeadPriorityBadge } from '../components/LeadPriorityBadge';
import { LeadStatusPicker } from '../components/LeadStatusPicker';
import { LeadTagManager } from '../components/LeadTagManager';
import { LeadActivityTimeline } from '../components/LeadActivityTimeline';
import { Lead, TeamMember, LeadStatus } from '../types';
import { LeadProcessFlow } from '../components/LeadProcessFlow';

// Error boundary to isolate LeadProcessFlow render failures
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

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  teamMembers: TeamMember[];
  onAssign: (leadId: string, memberId: string) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onAddTag: (leadId: string, tag: string) => void;
  onRemoveTag: (leadId: string, tag: string) => void;
  onAddNote: (leadId: string, note: string) => void;
  onDelete: (leadId: string) => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}

const inputCls = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const textareaCls = 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectCls = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead, onBack, teamMembers, onAssign, onStatusChange, onAddTag, onRemoveTag, onAddNote, onDelete, onUpdate,
}) => {
  const assignedMember = teamMembers.find((m) => m.id === lead.assignedTo);
  const [convertedConfirm, setConvertedConfirm] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, service: lead.service, notes: lead.notes });
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
  const moreRef = useRef<HTMLDivElement>(null);
  const isConverted = lead.status === 'Converted';

  useEffect(() => {
    setEditForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, service: lead.service, notes: lead.notes });
  }, [lead.id, lead.name, lead.email, lead.phone, lead.company, lead.service, lead.notes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setAssignOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkConverted = () => {
    if (isConverted) return;
    onStatusChange(lead.id, 'Converted');
    setConvertedConfirm(true);
    setTimeout(() => setConvertedConfirm(false), 2000);
  };

  const handleEmailSubmit = () => {
    if (!emailSubject.trim()) return;
    onAddNote(lead.id, `📧 Email sent: "${emailSubject}" — ${emailMessage || 'No body'}`);
    setEmailSubject(''); setEmailMessage(''); setEmailDialogOpen(false);
  };

  const handleCallSubmit = () => {
    onAddNote(lead.id, `📞 Call logged (${callDuration}) — Outcome: ${callOutcome}${callNotes ? ` — Notes: ${callNotes}` : ''}`);
    setCallDuration('15min'); setCallOutcome('Connected'); setCallNotes(''); setCallDialogOpen(false);
  };

  const handleMeetingSubmit = () => {
    if (!meetingDate) return;
    onAddNote(lead.id, `📅 Meeting scheduled: ${meetingDate} at ${meetingTime || 'TBD'}${meetingAttendees ? ` — Attendees: ${meetingAttendees}` : ''}${meetingNotes ? ` — Notes: ${meetingNotes}` : ''}`);
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
              <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
              <LeadStatusBadge status={lead.status} />
              {lead.priority && <LeadPriorityBadge priority={lead.priority} />}
            </div>
            <p className="text-sm text-gray-500">{lead.company} • {lead.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleMarkConverted} disabled={isConverted}
            className={cn('gap-2 hidden sm:flex',
              convertedConfirm ? 'bg-green-600 hover:bg-green-600 text-white' :
              isConverted ? 'bg-green-100 text-green-700 cursor-not-allowed' :
              'bg-orange-500 hover:bg-orange-600 text-white')}>
            {convertedConfirm ? <><CheckCircle2 className="w-4 h-4" /> Converted ✓</> :
             isConverted ? <><CheckCircle2 className="w-4 h-4" /> Already Converted</> :
             <><CheckCircle className="w-4 h-4" /> Mark Converted</>}
          </Button>
          <div ref={moreRef} className="relative">
            <Button variant="ghost" size="icon" onClick={() => setMoreOpen(!moreOpen)}>
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </Button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {[
                  { icon: Edit, label: 'Edit Lead', onClick: () => { setEditDialogOpen(true); setMoreOpen(false); } },
                  { icon: Mail, label: 'Send Email', onClick: () => { setEmailDialogOpen(true); setMoreOpen(false); } },
                  { icon: Phone, label: 'Log Call', onClick: () => { setCallDialogOpen(true); setMoreOpen(false); } },
                  { icon: Calendar, label: 'Schedule Meeting', onClick: () => { setMeetingDialogOpen(true); setMoreOpen(false); } },
                ].map(({ icon: Icon, label, onClick }) => (
                  <button key={label} onClick={onClick} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Icon className="w-4 h-4 text-gray-400" /> {label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { alert('Export as PDF coming soon!'); setMoreOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 text-gray-400" /> Export as PDF
                </button>
                <button onClick={() => { setDeleteDialogOpen(true); setMoreOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Delete Lead
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <BpfErrorBoundary>
          <LeadProcessFlow
            leadId={lead.id}
            currentStatus={lead.status}
            lead={lead}
            teamMembers={teamMembers}
            onStatusChange={onStatusChange}
            onUpdate={onUpdate}
          />
        </BpfErrorBoundary>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Lead Score</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-gray-900">{lead.score}</div>
                    <LeadScoreBadge score={lead.score} />
                  </div>
                  <div className="text-sm text-right text-gray-500">
                    {lead.priority ? `${lead.priority} Priority` : 'Standard Priority'}<br />based on form data
                  </div>
                </div>
              </div>
              {(lead.followUpSla || lead.suggestedRouting) && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Follow-up & Routing</h3>
                  <div className="space-y-3">
                    {lead.followUpSla && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <Clock className={cn('w-5 h-5', lead.followUpSla === 'Automated' ? 'text-gray-400' : lead.followUpSla.includes('24') ? 'text-amber-500' : 'text-blue-500')} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Follow-up SLA</p>
                          <p className={cn('text-sm font-semibold', lead.followUpSla === 'Automated' ? 'text-gray-600' : lead.followUpSla.includes('24') ? 'text-amber-700' : 'text-blue-700')}>{lead.followUpSla}</p>
                        </div>
                      </div>
                    )}
                    {lead.suggestedRouting && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <Target className="w-5 h-5 text-indigo-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Suggested Routing</p>
                          <p className="text-sm font-semibold text-indigo-700">{lead.suggestedRouting}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Pipeline Status</h3>
                <LeadStatusPicker currentStatus={lead.status} onStatusChange={(status) => onStatusChange(lead.id, status)} />
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400" /><a href={`mailto:${lead.email}`} className="text-slate-900 hover:underline">{lead.email}</a></div>
                  {lead.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400" /><a href={`tel:${lead.phone}`} className="text-gray-700">{lead.phone}</a></div>}
                  {lead.company && <div className="flex items-center gap-3 text-sm"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{lead.company}</span></div>}
                  {lead.jobTitle && <div className="flex items-center gap-3 text-sm"><Briefcase className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{lead.jobTitle}</span></div>}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Assignment</h3>
                <div ref={assignRef} className="relative">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback className={cn('text-white text-xs', assignedMember?.color)}>{assignedMember?.initials}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{assignedMember?.name}</p>
                        <p className="text-xs text-gray-500">{assignedMember?.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAssignOpen(!assignOpen)}>Change</Button>
                  </div>
                  {assignOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      {teamMembers.map((member) => (
                        <button key={member.id} onClick={() => { onAssign(lead.id, member.id); setAssignOpen(false); }}
                          className={cn('flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors hover:bg-gray-50', member.id === lead.assignedTo && 'bg-gray-50')}>
                          <Avatar className="h-7 w-7"><AvatarFallback className={cn('text-white text-[10px]', member.color)}>{member.initials}</AvatarFallback></Avatar>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                          {member.id === lead.assignedTo && <span className="text-xs text-gray-400 font-medium">Current</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Tags</h3>
                <LeadTagManager tags={lead.tags} onAddTag={(tag) => onAddTag(lead.id, tag)} onRemoveTag={(tag) => onRemoveTag(lead.id, tag)} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Source</h3>
                  <LeadSourceBadge source={lead.source} />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Service Interest</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700">{lead.service}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {lead.formType && (
              <div className="bg-white border border-l-4 border-l-slate-900 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-slate-900"><FileText className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Form Submission Details</h3>
                      <p className="text-sm text-gray-500">Submitted via {lead.source}</p>
                    </div>
                  </div>
                  {lead.suggestedRouting && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Suggested Routing</p>
                      <p className="text-sm font-medium text-slate-900">{lead.suggestedRouting}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {(lead.industry || lead.companySize || lead.sector) && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Qualification</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {lead.industry && <div><p className="text-xs text-gray-500">Industry</p><p className="text-sm font-medium">{lead.industry}</p></div>}
                        {lead.companySize && <div><p className="text-xs text-gray-500">Company Size</p><p className="text-sm font-medium">{lead.companySize}</p></div>}
                        {lead.sector && <div className="col-span-2"><p className="text-xs text-gray-500">Sector Interest</p><p className="text-sm font-medium">{lead.sector}</p></div>}
                      </div>
                    </div>
                  )}
                  {(lead.budget || lead.projectTimeline || lead.productName) && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Project Scope</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {lead.budget && <div><p className="text-xs text-gray-500">Budget</p><p className="text-sm font-medium text-green-700">{lead.budget}</p></div>}
                        {lead.projectTimeline && <div><p className="text-xs text-gray-500">Timeline</p><p className="text-sm font-medium text-amber-700">{lead.projectTimeline}</p></div>}
                        {lead.productName && <div className="col-span-2"><p className="text-xs text-gray-500">Product</p><p className="text-sm font-medium">{lead.productName} <span className="text-gray-400">({lead.productCode})</span></p></div>}
                      </div>
                    </div>
                  )}
                  {lead.message && (
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Message</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">"{lead.message}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', onClick: () => setEmailDialogOpen(true) },
                { icon: Phone, label: 'Log Call', onClick: () => setCallDialogOpen(true) },
                { icon: Calendar, label: 'Meeting', onClick: () => setMeetingDialogOpen(true) },
              ].map(({ icon: Icon, label, onClick }) => (
                <Button key={label} variant="outline" onClick={onClick}
                  className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50 hover:border-orange-500/50 group">
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                  <span className="text-xs font-medium">{label}</span>
                </Button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>
              <LeadActivityTimeline activities={lead.activities} onAddNote={(note) => onAddNote(lead.id, note)} />
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
              <div><label className="text-sm font-medium text-gray-700">Duration</label>
                <select className={selectCls} value={callDuration} onChange={(e) => setCallDuration(e.target.value)}>
                  <option>5min</option><option>15min</option><option>30min</option><option>45min</option><option>60min</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Outcome</label>
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
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5" /> Delete Lead</h2>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold">{lead.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { onDelete(lead.id); setDeleteDialogOpen(false); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[500px] mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Edit className="w-5 h-5" /> Edit Lead</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">Name</label><input className={inputCls} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-gray-700">Company</label><input className={inputCls} value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">Email</label><input type="email" className={inputCls} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-gray-700">Phone</label><input className={inputCls} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Notes</label><textarea className={textareaCls} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => { onUpdate(lead.id, editForm); setEditDialogOpen(false); }}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
