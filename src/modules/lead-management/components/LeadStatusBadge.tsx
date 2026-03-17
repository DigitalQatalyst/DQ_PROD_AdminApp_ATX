import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { LeadStatus } from '../types';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Qualified: 'bg-purple-50 text-purple-700 border-purple-200',
  Contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Proposal Sent': 'bg-orange-50 text-orange-700 border-orange-200',
  Converted: 'bg-green-50 text-green-700 border-green-200',
  Lost: 'bg-red-50 text-red-700 border-red-200',
};

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, className }) => (
  <Badge variant="outline" className={cn('font-medium', statusColors[status], className)}>
    {status}
  </Badge>
);
