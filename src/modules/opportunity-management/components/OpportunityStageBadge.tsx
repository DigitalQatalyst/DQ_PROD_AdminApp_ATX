import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { OpportunityStage } from '../types';

interface OpportunityStageBadgeProps {
  stage: OpportunityStage;
  size?: 'sm' | 'md';
  className?: string;
}

const stageColors: Record<OpportunityStage, string> = {
  'Qualification': 'bg-blue-50 text-blue-700 border-blue-200',
  'Needs Analysis': 'bg-purple-50 text-purple-700 border-purple-200',
  'Proposal': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'Closed Won': 'bg-green-50 text-green-700 border-green-200',
  'Closed Lost': 'bg-red-50 text-red-700 border-red-200',
};

export const OpportunityStageBadge: React.FC<OpportunityStageBadgeProps> = ({ stage, size = 'md', className }) => (
  <Badge
    variant="outline"
    className={cn(
      'font-medium',
      size === 'sm' && 'text-[10px] px-1.5 py-0',
      stageColors[stage],
      className,
    )}
  >
    {stage}
  </Badge>
);
