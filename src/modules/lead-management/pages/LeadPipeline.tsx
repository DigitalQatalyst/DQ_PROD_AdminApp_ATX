import React from 'react';
import { cn } from '../../../utils/cn';
import { LeadCard } from '../components/LeadCard';
import { Lead, LeadStatus, TeamMember } from '../types';

interface LeadPipelineProps {
  leads: Lead[];
  teamMembers: TeamMember[];
  onLeadClick: (id: string) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

const stages: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Proposal Sent', 'Converted', 'Lost'];

const stageColors: Record<LeadStatus, string> = {
  New: 'bg-blue-50/50 border-blue-100',
  Qualified: 'bg-purple-50/50 border-purple-100',
  Contacted: 'bg-yellow-50/50 border-yellow-100',
  'Proposal Sent': 'bg-orange-50/50 border-orange-100',
  Converted: 'bg-green-50/50 border-green-100',
  Lost: 'bg-red-50/50 border-red-100',
};

const stageHeaderColors: Record<LeadStatus, string> = {
  New: 'border-blue-500 text-blue-700',
  Qualified: 'border-purple-500 text-purple-700',
  Contacted: 'border-yellow-500 text-yellow-700',
  'Proposal Sent': 'border-orange-500 text-orange-700',
  Converted: 'border-green-500 text-green-700',
  Lost: 'border-red-500 text-red-700',
};

export const LeadPipeline: React.FC<LeadPipelineProps> = ({ leads, teamMembers, onLeadClick, onUpdateStatus }) => {
  const getStageLeads = (stage: LeadStatus) => leads.filter((l) => l.status === stage);

  const handleMove = (leadId: string, currentStage: LeadStatus, direction: 'next' | 'prev') => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1) return;
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stages.length) onUpdateStatus(leadId, stages[newIndex]);
  };

  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-4 min-w-max h-full">
        {stages.map((stage) => {
          const stageLeads = getStageLeads(stage);
          const totalValue = stageLeads.length * 15000;
          return (
            <div key={stage} className={cn('flex flex-col w-80 rounded-lg border h-full max-h-full', stageColors[stage])}>
              <div className={cn('p-3 border-t-4 bg-white rounded-t-lg shadow-sm mb-2', stageHeaderColors[stage])}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">{stage}</h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{stageLeads.length}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">${(totalValue / 1000).toFixed(0)}k est. value</div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    teamMembers={teamMembers}
                    onClick={() => onLeadClick(lead.id)}
                    showMoveControls
                    onMovePrev={stage !== 'New' ? () => handleMove(lead.id, stage, 'prev') : undefined}
                    onMoveNext={stage !== 'Lost' ? () => handleMove(lead.id, stage, 'next') : undefined}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No leads
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
