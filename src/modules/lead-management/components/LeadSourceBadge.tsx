import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { LeadSource } from '../types';

interface LeadSourceBadgeProps {
  source: LeadSource;
  className?: string;
}

const sourceColors: Partial<Record<LeadSource, string>> = {
  'Website Form': 'bg-blue-50 text-blue-700 border-blue-200',
  Email: 'bg-purple-50 text-purple-700 border-purple-200',
  Chatbot: 'bg-green-50 text-green-700 border-green-200',
  Marketplace: 'bg-orange-50 text-orange-700 border-orange-200',
  Webinar: 'bg-pink-50 text-pink-700 border-pink-200',
  Referral: 'bg-teal-50 text-teal-700 border-teal-200',
  'Service Request': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Product Demo': 'bg-violet-50 text-violet-700 border-violet-200',
  'Tour Request': 'bg-amber-50 text-amber-700 border-amber-200',
  Consultation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Newsletter: 'bg-sky-50 text-sky-700 border-sky-200',
  Whitepaper: 'bg-blue-50 text-blue-700 border-blue-200',
  Waitlist: 'bg-rose-50 text-rose-700 border-rose-200',
  Enquiry: 'bg-gray-50 text-gray-700 border-gray-200',
  DMA: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Account Signup': 'bg-lime-50 text-lime-700 border-lime-200',
};

export const LeadSourceBadge: React.FC<LeadSourceBadgeProps> = ({ source, className }) => (
  <Badge
    variant="outline"
    className={cn('font-medium text-xs', sourceColors[source] ?? 'bg-gray-50 text-gray-700 border-gray-200', className)}
  >
    {source}
  </Badge>
);
