import { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { Opportunity, OpportunityStage, TeamMember } from '../types';
import { cn } from '../../../utils/cn';

interface OpportunityProcessFlowProps {
  opportunityId: string;
  currentStage: OpportunityStage;
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onStageChange: (id: string, stage: OpportunityStage) => void;
  onUpdate: (id: string, updates: Partial<Opportunity>) => void;
}

const STAGES: OpportunityStage[] = [
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const TERMINAL_STAGES: ReadonlySet<OpportunityStage> = new Set(['Closed Won', 'Closed Lost']);

type StageState = 'completed' | 'active' | 'upcoming';

function classifyStage(index: number, activeIndex: number): StageState {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'active';
  return 'upcoming';
}

function getActiveBorderColor(stage: OpportunityStage): string {
  if (stage === 'Closed Won') return 'border-t-green-500';
  if (stage === 'Closed Lost') return 'border-t-red-500';
  return 'border-t-cyan-500';
}

// ── Shared field input styles ────────────────────────────────────────────────
const fieldCls = 'w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400';
const labelCls = 'block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1';

// ── Stage fields panel ───────────────────────────────────────────────────────
interface StagePanelProps {
  stage: OpportunityStage;
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onUpdate: (updates: Partial<Opportunity>) => void;
}

const StagePanel = ({ stage, opportunity, teamMembers, onUpdate }: StagePanelProps) => {
  if (stage === 'Qualification') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Company Name</label>
          <input
            type="text"
            className={fieldCls}
            defaultValue={opportunity.companyName ?? ''}
            onBlur={(e) => onUpdate({ companyName: e.target.value })}
            placeholder="Company name"
          />
        </div>
        <div>
          <label className={labelCls}>Contact Name</label>
          <input
            type="text"
            className={fieldCls}
            defaultValue={opportunity.contactName ?? ''}
            onBlur={(e) => onUpdate({ contactName: e.target.value })}
            placeholder="Contact name"
          />
        </div>
        <div>
          <label className={labelCls}>Contact Email</label>
          <input
            type="email"
            className={fieldCls}
            defaultValue={opportunity.contactEmail ?? ''}
            onBlur={(e) => onUpdate({ contactEmail: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className={labelCls}>Contact Phone</label>
          <input
            type="tel"
            className={fieldCls}
            defaultValue={opportunity.contactPhone ?? ''}
            onBlur={(e) => onUpdate({ contactPhone: e.target.value })}
            placeholder="+1 234 567 890"
          />
        </div>
      </div>
    );
  }

  if (stage === 'Needs Analysis') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Assignee</label>
          <select
            className={fieldCls}
            defaultValue={opportunity.assignedTo}
            onChange={(e) => onUpdate({ assignedTo: e.target.value })}
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Description</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={opportunity.description ?? ''}
            onBlur={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add description..."
          />
        </div>
        <div>
          <label className={labelCls}>Tags</label>
          <input
            type="text"
            className={fieldCls}
            placeholder="Add tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) {
                  onUpdate({ tags: [...(opportunity.tags ?? []), val] });
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (stage === 'Proposal') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Deal Value</label>
          <input
            type="number"
            className={fieldCls}
            defaultValue={opportunity.dealValue}
            onBlur={(e) => onUpdate({ dealValue: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <select
            className={fieldCls}
            defaultValue={opportunity.currency}
            onChange={(e) => onUpdate({ currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="AED">AED</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Probability (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className={fieldCls}
            defaultValue={opportunity.probability}
            onBlur={(e) => onUpdate({ probability: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelCls}>Close Date</label>
          <input
            type="date"
            className={fieldCls}
            defaultValue={opportunity.closeDate ?? ''}
            onBlur={(e) => onUpdate({ closeDate: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (stage === 'Negotiation') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Deal Value</label>
          <input
            type="number"
            className={fieldCls}
            defaultValue={opportunity.dealValue}
            onBlur={(e) => onUpdate({ dealValue: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelCls}>Probability (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className={fieldCls}
            defaultValue={opportunity.probability}
            onBlur={(e) => onUpdate({ probability: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelCls}>Close Date</label>
          <input
            type="date"
            className={fieldCls}
            defaultValue={opportunity.closeDate ?? ''}
            onBlur={(e) => onUpdate({ closeDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={opportunity.notes ?? ''}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  if (stage === 'Closed Won') {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <label className={labelCls}>Won At</label>
          <input
            type="text"
            className={cn(fieldCls, 'bg-gray-50 text-gray-500 cursor-not-allowed')}
            value={opportunity.wonAt ? new Date(opportunity.wonAt).toLocaleString() : 'Auto-set on close'}
            readOnly
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={cn(fieldCls, 'resize-none h-[58px]')}
            defaultValue={opportunity.notes ?? ''}
            onBlur={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>
      </div>
    );
  }

  // Closed Lost
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <label className={labelCls}>Lost Reason</label>
        <textarea
          className={cn(fieldCls, 'resize-none h-[58px]')}
          defaultValue={opportunity.lostReason ?? ''}
          onBlur={(e) => onUpdate({ lostReason: e.target.value })}
          placeholder="Describe reason for loss..."
        />
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          className={cn(fieldCls, 'resize-none h-[58px]')}
          defaultValue={opportunity.notes ?? ''}
          onBlur={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Add notes..."
        />
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export const OpportunityProcessFlow = ({
  opportunityId,
  currentStage,
  opportunity,
  teamMembers,
  onStageChange,
  onUpdate,
}: OpportunityProcessFlowProps) => {
  const [panelOpen, setPanelOpen] = useState(false);

  const activeIndex = STAGES.indexOf(currentStage);
  const isTerminal = TERMINAL_STAGES.has(currentStage);
  const activeBorderColor = getActiveBorderColor(currentStage);

  const handleStageClick = (stage: OpportunityStage, isActive: boolean) => {
    if (isActive) {
      setPanelOpen((prev) => !prev);
    } else {
      onStageChange(opportunityId, stage);
      setPanelOpen(false);
    }
  };

  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-lg mb-6"
      role="navigation"
      aria-label="Opportunity pipeline stages"
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
                      onStageChange(opportunityId, STAGES[activeIndex + 1]);
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
            stage={currentStage}
            opportunity={opportunity}
            teamMembers={teamMembers}
            onUpdate={(updates) => onUpdate(opportunityId, updates)}
          />
        </div>
      )}
    </div>
  );
};
