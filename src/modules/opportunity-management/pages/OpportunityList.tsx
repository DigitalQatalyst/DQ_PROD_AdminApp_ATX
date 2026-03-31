import React, { useRef, useState, useEffect } from 'react';
import { Filter, Trash2, Users as UserPlus, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { OpportunityStageBadge } from '../components/OpportunityStageBadge';
import { OpportunityValueDisplay } from '../components/OpportunityValueDisplay';
import {
  Opportunity,
  OpportunityFilterState,
  OpportunityStage,
  TeamMember,
} from '../types';

interface OpportunityListProps {
  opportunities: Opportunity[];
  filters: OpportunityFilterState;
  setFilters: (filters: OpportunityFilterState) => void;
  onOpportunityClick: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  teamMembers: TeamMember[];
  onBulkUpdateStage: (ids: string[], stage: OpportunityStage) => void;
  onBulkAssign: (ids: string[], memberId: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const ALL_STAGES: OpportunityStage[] = [
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const DEFAULT_FILTERS: OpportunityFilterState = {
  stage: 'All',
  assignedTo: 'All',
  search: '',
  closeDateFrom: '',
  closeDateTo: '',
  dealValueMin: 0,
  dealValueMax: 0,
};

const selectCls =
  'h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500';

const inputCls =
  'h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500';

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  filters,
  setFilters,
  onOpportunityClick,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  teamMembers,
  onBulkUpdateStage,
  onBulkAssign,
  onBulkDelete,
}) => {
  const allSelected =
    opportunities.length > 0 && selectedIds.length === opportunities.length;

  const [showStagePicker, setShowStagePicker] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const assignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node))
        setShowStagePicker(false);
      if (assignRef.current && !assignRef.current.contains(e.target as Node))
        setShowAssignPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOverdue = (closeDate: string) =>
    closeDate && new Date(closeDate) < new Date(new Date().toDateString());

  const probabilityColor = (p: number) => {
    if (p >= 70) return 'text-green-600 font-semibold';
    if (p >= 40) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* Filter Bar */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-1">
            <Filter className="w-4 h-4" /> Filters:
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search opportunities..."
            className={cn(inputCls, 'w-48')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          {/* Stage */}
          <select
            className={selectCls}
            value={filters.stage}
            onChange={(e) =>
              setFilters({
                ...filters,
                stage: e.target.value as OpportunityStage | 'All',
              })
            }
          >
            <option value="All">All Stages</option>
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Assigned To */}
          <select
            className={selectCls}
            value={filters.assignedTo}
            onChange={(e) =>
              setFilters({ ...filters, assignedTo: e.target.value })
            }
          >
            <option value="All">All Assignees</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Close Date From */}
          <input
            type="date"
            className={inputCls}
            value={filters.closeDateFrom}
            onChange={(e) =>
              setFilters({ ...filters, closeDateFrom: e.target.value })
            }
            title="Close date from"
          />

          {/* Close Date To */}
          <input
            type="date"
            className={inputCls}
            value={filters.closeDateTo}
            onChange={(e) =>
              setFilters({ ...filters, closeDateTo: e.target.value })
            }
            title="Close date to"
          />

          {/* Deal Value Min */}
          <input
            type="number"
            placeholder="Min value"
            className={cn(inputCls, 'w-28')}
            value={filters.dealValueMin || ''}
            min={0}
            onChange={(e) =>
              setFilters({
                ...filters,
                dealValueMin: Number(e.target.value) || 0,
              })
            }
          />

          {/* Deal Value Max */}
          <input
            type="number"
            placeholder="Max value"
            className={cn(inputCls, 'w-28')}
            value={filters.dealValueMax || ''}
            min={0}
            onChange={(e) =>
              setFilters({
                ...filters,
                dealValueMax: Number(e.target.value) || 0,
              })
            }
          />

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Clear Filters
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {opportunities.length} results
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.length} opportunit
            {selectedIds.length > 1 ? 'ies' : 'y'} selected
          </span>
          <div className="flex items-center gap-2">
            {/* Update Stage */}
            <div ref={stageRef} className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8"
                onClick={() => {
                  setShowStagePicker(!showStagePicker);
                  setShowAssignPicker(false);
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" /> Update Stage
              </Button>
              {showStagePicker && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {ALL_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => {
                        onBulkUpdateStage(selectedIds, stage);
                        setShowStagePicker(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <OpportunityStageBadge stage={stage} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assign To */}
            <div ref={assignRef} className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8"
                onClick={() => {
                  setShowAssignPicker(!showAssignPicker);
                  setShowStagePicker(false);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" /> Assign To
              </Button>
              {showAssignPicker && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        onBulkAssign(selectedIds, member.id);
                        setShowAssignPicker(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className={cn('text-white text-[10px]', member.color)}
                        >
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* Delete */}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-300 hover:text-red-100 hover:bg-red-900/20 h-8"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={allSelected}
                    onChange={() =>
                      onSelectAll(opportunities.map((o) => o.id))
                    }
                  />
                </th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3 text-right">Deal Value</th>
                <th className="px-6 py-3">Probability</th>
                <th className="px-6 py-3">Close Date</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Tags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No opportunities found matching your filters.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => {
                  const assignedMember = teamMembers.find(
                    (m) => m.id === opp.assignedTo
                  );
                  const overdue = isOverdue(opp.closeDate);
                  const visibleTags = opp.tags.slice(0, 2);
                  const overflowCount = opp.tags.length - 2;

                  return (
                    <tr
                      key={opp.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedIds.includes(opp.id) && 'bg-blue-50/50'
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.includes(opp.id)}
                          onChange={() => onToggleSelect(opp.id)}
                        />
                      </td>

                      {/* Title + Company */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 hover:text-indigo-600">
                            {opp.title}
                          </span>
                          {opp.companyName && (
                            <span className="text-xs text-gray-500">
                              {opp.companyName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stage */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <OpportunityStageBadge stage={opp.stage} />
                      </td>

                      {/* Deal Value */}
                      <td
                        className="px-6 py-4 text-right cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <span className="text-sm font-medium text-gray-900">
                          <OpportunityValueDisplay
                            value={opp.dealValue}
                            currency={opp.currency}
                          />
                        </span>
                      </td>

                      {/* Probability */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <span
                          className={cn(
                            'text-sm',
                            probabilityColor(opp.probability)
                          )}
                        >
                          {opp.probability}%
                        </span>
                      </td>

                      {/* Close Date */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <span
                          className={cn(
                            'text-sm',
                            overdue ? 'text-red-600 font-medium' : 'text-gray-700'
                          )}
                        >
                          {opp.closeDate
                            ? new Date(opp.closeDate).toLocaleDateString()
                            : '—'}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback
                              className={cn(
                                'text-[10px] text-white',
                                assignedMember?.color ?? 'bg-gray-400'
                              )}
                            >
                              {assignedMember?.initials ?? 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700">
                            {assignedMember?.name.split(' ')[0] ?? 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => onOpportunityClick(opp.id)}
                      >
                        <div className="flex items-center gap-1 flex-wrap">
                          {visibleTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {overflowCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              +{overflowCount}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[400px] mx-4 p-6">
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5" /> Delete {selectedIds.length}{' '}
              Opportunit{selectedIds.length > 1 ? 'ies' : 'y'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {selectedIds.length} opportunit
                {selectedIds.length > 1 ? 'ies' : 'y'}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
