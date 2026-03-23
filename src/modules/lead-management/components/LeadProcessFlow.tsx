import { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { Lead, LeadStatus, LeadSource, LeadPriority, TeamMember } from '../types';
import { cn } from '../../../utils/cn';

interface LeadProcessFlowProps {
  leadId: string;
  currentStatus: LeadStatus;
  lead: Lead;
  teamMembers: TeamMember[];
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}

const STAGES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Converted',
  'Lost',
];

const TERMINAL_STAGES: ReadonlySet<LeadStatus> = new Set(['Converted', 'Lost']);

const LEAD_SOURCES: LeadSource[] = [
  'Website Form', 'Email', 'Chatbot', 'Marketplace', 'Webinar', 'Referral',
  'Service Request', 'Product Demo', 'Tour Request', 'Consultation',
  'Newsletter', 'Whitepaper', 'Waitlist', 'Enquiry', 'DMA', 'Account Signup',
];

const LEAD_PRIORITIES: LeadPriority[] = ['High', 'Medium', 'Low'];

type StageState = 'completed' | 'active' | 'upcoming';

function classifyStage(index: number, activeIndex: number): StageState {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'active';
  return 'upcoming';
}

function getActiveBorderColor(status: LeadStatus): string {
  if (status === 'Converted') return 'border-t-green-500';
  if (status === 'Lost') return 'border-t-red-500';
  return 'border-t-cyan-500';
}

// ── Shared field input styles ────────────────────────────────────────────────
const fieldCls = 'w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400';
const labelCls = 'block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1';

// ── Stage fields panel ───────────────────────────────────────────────────────
interface StagePanelProps {
  status: LeadStatus;
  lead: Lead;
  teamMembers: TeamMember[];
  onUpdate: (updates: Partial<Lead>) => void;
}

const StagePanel = ({ status, lead, teamMembers, onUpdate }: StagePanelProps) => {
  if (status === 'New') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Phone</label>
          <input
            type="text"
            className={fieldCls}
            defaultValue={lead.phone}
            onBlur={(e) => onUpdate({ phone: e.target.value })}
            placeholder="Phone number"
          />
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <input
            type="text"
            className={fieldCls}
            defaultValue={lead.company}
            onBlur={(e) => onUpdate({ company: e.target.value })}
            placeholder="Company name"
          />
        </div>
        <div>
          <label className={labelCls}>Lead Source</label>
          <select
            className={fieldCls}
            defaultValue={lead.source}
            onChange={(e) => onUpdate({ source: e.target.value as LeadSource })}
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select
            className={fieldCls}
            defaultValue={lead.priority ?? ''}
            onChange={(e) => onUpdate({ priority: e.target.value as LeadPriority })}
          >
            <option value="">— Select —</option>
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (status === 'Contacted') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Assignee</label>
          <select
            className={fieldCls}
            defaultValue={lead.assignedTo}
            onChange={(e) => onUpdate({ assignedTo: e.target.value })}
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Follow Up Date</label>
          <input
            type="date"
            className={fieldCls}
            defaultValue={lead.preferredDate ?? ''}
            onBlur={(e) => onUpdate({ preferredDate: e.target.value })}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={lead.notes}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  if (status === 'Qualified') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Estimated Value</label>
          <input
            type="text"
            className={fieldCls}
            defaultValue={lead.budget ?? ''}
            onBlur={(e) => onUpdate({ budget: e.target.value })}
            placeholder="e.g. $10,000"
          />
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select
            className={fieldCls}
            defaultValue={lead.priority ?? ''}
            onChange={(e) => onUpdate({ priority: e.target.value as LeadPriority })}
          >
            <option value="">— Select —</option>
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={lead.notes}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  if (status === 'Proposal Sent') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Close Date</label>
          <input
            type="date"
            className={fieldCls}
            defaultValue={lead.preferredDate ?? ''}
            onBlur={(e) => onUpdate({ preferredDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Assignee</label>
          <select
            className={fieldCls}
            defaultValue={lead.assignedTo}
            onChange={(e) => onUpdate({ assignedTo: e.target.value })}
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={lead.notes}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  if (status === 'Converted') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <label className={labelCls}>Close Date</label>
          <input
            type="date"
            className={fieldCls}
            defaultValue={lead.preferredDate ?? ''}
            onBlur={(e) => onUpdate({ preferredDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={lead.notes}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  // Lost
  return (
    <div>
      <label className={labelCls}>Reason for Loss</label>
      <textarea
        className={cn(fieldCls, 'resize-none h-[58px]')}
        defaultValue={lead.notes}
        onBlur={(e) => onUpdate({ notes: e.target.value })}
        placeholder="Describe reason for loss..."
      />
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export const LeadProcessFlow = ({
  leadId,
  currentStatus,
  lead,
  teamMembers,
  onStatusChange,
  onUpdate,
}: LeadProcessFlowProps) => {
  const [panelOpen, setPanelOpen] = useState(false);

  const activeIndex = STAGES.indexOf(currentStatus);
  const isTerminal = TERMINAL_STAGES.has(currentStatus);
  const activeBorderColor = getActiveBorderColor(currentStatus);

  const handleStageClick = (stage: LeadStatus, isActive: boolean) => {
    if (isActive) {
      setPanelOpen((prev) => !prev);
    } else {
      onStatusChange(leadId, stage);
      setPanelOpen(false);
    }
  };

  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-lg mb-6"
      role="navigation"
      aria-label="Lead pipeline stages"
    >
      {/* Stage bar */}
      <div className="flex items-stretch w-full px-3 py-2">
        {STAGES.map((stage, index) => {
          const state = classifyStage(index, activeIndex);
          const isActive = state === 'active';
          const isCompleted = state === 'completed';
          const showNextStage = isActive && !isTerminal;

          return (
            <div key={stage} className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => handleStageClick(stage, isActive)}
                aria-current={isActive ? 'step' : undefined}
                aria-expanded={isActive ? panelOpen : undefined}
                aria-label={`${stage}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
                className={cn(
                  'flex items-center gap-1.5 w-full px-2 py-2 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 rounded min-w-0',
                  isActive && [
                    'bg-white border border-gray-200 border-t-2 shadow-sm',
                    activeBorderColor,
                    'text-gray-800',
                  ],
                  isCompleted && 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                  !isActive && !isCompleted && 'bg-transparent text-gray-400 hover:text-gray-600',
                )}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-3 h-3 shrink-0 text-gray-400" aria-hidden="true" />
                )}
                <span className="truncate leading-tight">{stage}</span>

                {/* Next Stage — inline right of active pill */}
                {showNextStage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(leadId, STAGES[activeIndex + 1]);
                      setPanelOpen(false);
                    }}
                    className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-white hover:bg-cyan-600 transition-colors whitespace-nowrap"
                    aria-label={`Advance to ${STAGES[activeIndex + 1]}`}
                  >
                    Next
                  </button>
                )}

                {/* Expand/collapse indicator on active stage */}
                {isActive && (
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 shrink-0 text-gray-400 transition-transform duration-150',
                      showNextStage ? '' : 'ml-auto',
                      panelOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>

              {index < STAGES.length - 1 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-gray-300 shrink-0 mx-0.5"
                  aria-hidden="true"
                  data-testid="stage-connector"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage fields panel */}
      {panelOpen && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 rounded-b-lg">
          <StagePanel
            status={currentStatus}
            lead={lead}
            teamMembers={teamMembers}
            onUpdate={(updates) => onUpdate(leadId, updates)}
          />
        </div>
      )}
    </div>
  );
};
