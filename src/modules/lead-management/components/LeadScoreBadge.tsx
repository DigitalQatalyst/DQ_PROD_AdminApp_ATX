import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';

interface LeadScoreBadgeProps {
  score: number;
  className?: string;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score, className }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let label = 'Cold';
  if (score >= 80) { colorClass = 'bg-green-100 text-green-800'; label = 'Hot'; }
  else if (score >= 50) { colorClass = 'bg-amber-100 text-amber-800'; label = 'Warm'; }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge className={cn('rounded-full px-2.5 py-0.5 font-medium border-0', colorClass)}>
        {score}
      </Badge>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
};
