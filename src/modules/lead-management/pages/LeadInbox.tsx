import React, { useEffect, useRef, useState } from 'react';
import { Filter, Trash2, Tag, Users as UserPlus, ArrowRight, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { LeadSourceBadge } from '../components/LeadSourceBadge';
import { LeadScoreBadge } from '../components/LeadScoreBadge';
import { LeadPriorityBadge } from '../components/LeadPriorityBadge';
import { Lead, FilterState, LeadStatus, LeadSource, TeamMember } from '../types';

interface LeadInboxProps {
  leads: Lead[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onLeadClick: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  teamMembers: TeamMember[];
  onBulkUpdateStatus: (ids: string[], status: LeadStatus) => void;
  onBulkAssign: (ids: string[], memberId: string) => void;
  onBulkAddTag: (ids: string[], tag: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const allStatuses: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Proposal Sent', 'Converted', 'Lost'];
const selectCls = 'h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500';

export const LeadInbox: React.FC<LeadInboxProps> = ({
  leads, filters, setFilters, onLeadClick, selectedIds, onToggleSelect, onSelectAll,
  teamMembers, onBulkUpdateStatus, onBulkAssign, onBulkAddTag, onBulkDelete,
}) => {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const assignRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setShowAssignPicker(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBulkTag = () => {
    if (tagValue.trim()) { onBulkAddTag(selectedIds, tagValue.trim()); setTagValue(''); setShowTagInput(false); }
  };

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          <select className={selectCls} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as LeadStatus | 'All' })}>
            <option value="All">All Statuses</option>
            {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectCls} value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value as LeadSource | 'All' })}>
            <option value="All">All Sources</option>
            <optgroup label="Website Forms">
              <option>Website Form</option><option>Service Request</option><option>Product Demo</option>
              <option>Tour Request</option><option>Consultation</option><option>Newsletter</option>
              <option>Whitepaper</option><option>Waitlist</option><option>Enquiry</option>
            </optgroup>
            <optgroup label="Other">
              <option>Email</option><option>Chatbot</option><option>Marketplace</option>
              <option>Webinar</option><option>Referral</option>
            </optgroup>
          </select>
          <select className={selectCls} value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}>
            <option value="All">All Assignees</option>
            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="text-sm text-gray-500">Showing {leads.length} results</div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2">
            <div ref={assignRef} className="relative">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8"
                onClick={() => { setShowAssignPicker(!showAssignPicker); setShowStatusPicker(false); setShowTagInput(false); }}>
                <UserPlus className="w-4 h-4 mr-2" /> Assign
              </Button>
              {showAssignPicker && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button key={member.id} onClick={() => { onBulkAssign(selectedIds, member.id); setShowAssignPicker(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={cn('text-white text-[10px]', member.color)}>{member.initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={statusRef} className="relative">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8"
                onClick={() => { setShowStatusPicker(!showStatusPicker); setShowAssignPicker(false); setShowTagInput(false); }}>
                <ArrowRight className="w-4 h-4 mr-2" /> Move Status
              </Button>
              {showStatusPicker && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {allStatuses.map((status) => (
                    <button key={status} onClick={() => { onBulkUpdateStatus(selectedIds, status); setShowStatusPicker(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LeadStatusBadge status={status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input autoFocus value={tagValue} onChange={(e) => setTagValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleBulkTag(); if (e.key === 'Escape') { setShowTagInput(false); setTagValue(''); } }}
                    className="h-8 w-32 text-xs bg-white text-gray-900 rounded-md border border-gray-300 px-2 focus:outline-none" placeholder="Tag name..." />
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 px-2" onClick={handleBulkTag}>Add</Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 px-1" onClick={() => { setShowTagInput(false); setTagValue(''); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8"
                  onClick={() => { setShowTagInput(true); setShowAssignPicker(false); setShowStatusPicker(false); }}>
                  <Tag className="w-4 h-4 mr-2" /> Tag
                </Button>
              )}
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <Button size="sm" variant="ghost" className="text-red-300 hover:text-red-100 hover:bg-red-900/20 h-8" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-3 w-10">
                  <input type="checkbox" className="rounded border-gray-300" checked={allSelected} onChange={() => onSelectAll(leads.map((l) => l.id))} />
                </th>
                <th className="px-6 py-3">Lead Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Assigned</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No leads found matching your filters.</td></tr>
              ) : leads.map((lead) => {
                const assignedMember = teamMembers.find((m) => m.id === lead.assignedTo);
                return (
                  <tr key={lead.id} className={cn('hover:bg-gray-50 transition-colors', selectedIds.includes(lead.id) && 'bg-blue-50/50')}>
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(lead.id)} onChange={() => onToggleSelect(lead.id)} />
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{lead.name}</span>
                        <span className="text-xs text-gray-500">{lead.company}</span>
                        {lead.priority && <div className="mt-1"><LeadPriorityBadge priority={lead.priority} className="text-[10px] px-1.5 py-0" /></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{lead.email}</span>
                        <span className="text-xs text-gray-500">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}><LeadSourceBadge source={lead.source} /></td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}><LeadStatusBadge status={lead.status} /></td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}><LeadScoreBadge score={lead.score} /></td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onLeadClick(lead.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={cn('text-[10px] text-white', assignedMember?.color ?? 'bg-gray-400')}>
                            {assignedMember?.initials ?? 'UN'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">{assignedMember?.name.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 cursor-pointer" onClick={() => onLeadClick(lead.id)}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[400px] mx-4 p-6">
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5" /> Delete {selectedIds.length} Lead{selectedIds.length > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { onBulkDelete(selectedIds); setShowDeleteConfirm(false); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
