import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { Flame, AlertTriangle, Minus } from 'lucide-react';
import { LeadPriority } from '../types';

interface LeadPriorityBadgeProps {
  priority: LeadPriority;
  className?: string;
}

const config: Record<LeadPriority, { color: string; Icon: React.FC<{ className?: string }> }> = {
  High: { color: 'bg-red-100 text-red-800 border-red-200', Icon: Flame },
  Medium: { color: 'bg-amber-100 text-amber-800 border-amber-200', Icon: AlertTriangle },
  Low: { color: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Minus },
};

export const LeadPriorityBadge: React.FC<LeadPriorityBadgeProps> = ({ priority, className }) => {
  const { color, Icon } = config[priority];
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 pl-1.5 pr-2.5 py-0.5 font-medium border', color, className)}
    >
      <Icon className="w-3.5 h-3.5" />
      {priority} Priority
    </Badge>
  );
};
