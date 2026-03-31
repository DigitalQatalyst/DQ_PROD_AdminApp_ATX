import React from 'react';
import { cn } from '../../../utils/cn';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityValueDisplay } from '../components/OpportunityValueDisplay';
import { Opportunity, OpportunityStage, TeamMember } from '../types';

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
  teamMembers: TeamMember[];
  onOpportunityClick: (id: string) => void;
  onUpdateStage: (id: string, stage: OpportunityStage) => void;
}

const stages: OpportunityStage[] = [
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const stageColors: Record<OpportunityStage, string> = {
  Qualification: 'bg-blue-50/50 border-blue-100',
  'Needs Analysis': 'bg-purple-50/50 border-purple-100',
  Proposal: 'bg-yellow-50/50 border-yellow-100',
  Negotiation: 'bg-orange-50/50 border-orange-100',
  'Closed Won': 'bg-green-50/50 border-green-100',
  'Closed Lost': 'bg-red-50/50 border-red-100',
};

const stageHeaderColors: Record<OpportunityStage, string> = {
  Qualification: 'border-blue-500 text-blue-700',
  'Needs Analysis': 'border-purple-500 text-purple-700',
  Proposal: 'border-yellow-500 text-yellow-700',
  Negotiation: 'border-orange-500 text-orange-700',
  'Closed Won': 'border-green-500 text-green-700',
  'Closed Lost': 'border-red-500 text-red-700',
};

export const OpportunityPipeline: React.FC<OpportunityPipelineProps> = ({
  opportunities,
  teamMembers,
  onOpportunityClick,
  onUpdateStage,
}) => {
  const getStageOpportunities = (stage: OpportunityStage) =>
    opportunities.filter((o) => o.stage === stage);

  const handleMove = (
    opportunityId: string,
    currentStage: OpportunityStage,
    direction: 'next' | 'prev'
  ) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1) return;
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stages.length) {
      onUpdateStage(opportunityId, stages[newIndex]);
    }
  };

  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-4 min-w-max h-full">
        {stages.map((stage, stageIndex) => {
          const stageOpportunities = getStageOpportunities(stage);
          const totalValue = stageOpportunities.reduce((sum, o) => sum + o.dealValue, 0);
          const currency = stageOpportunities[0]?.currency ?? 'USD';
          const isFirst = stageIndex === 0;
          const isLast = stageIndex === stages.length - 1;

          return (
            <div
              key={stage}
              className={cn('flex flex-col w-80 rounded-lg border h-full max-h-full', stageColors[stage])}
            >
              <div
                className={cn(
                  'p-3 border-t-4 bg-white rounded-t-lg shadow-sm mb-2',
                  stageHeaderColors[stage]
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">{stage}</h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {stageOpportunities.length}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  <OpportunityValueDisplay value={totalValue} currency={currency} compact /> total value
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    teamMembers={teamMembers}
                    onClick={() => onOpportunityClick(opportunity.id)}
                    showMoveControls
                    onMovePrev={
                      !isFirst ? () => handleMove(opportunity.id, stage, 'prev') : undefined
                    }
                    onMoveNext={
                      !isLast ? () => handleMove(opportunity.id, stage, 'next') : undefined
                    }
                  />
                ))}
                {stageOpportunities.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No opportunities
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
