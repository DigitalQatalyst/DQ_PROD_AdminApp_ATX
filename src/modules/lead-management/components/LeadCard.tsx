import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { LeadScoreBadge } from './LeadScoreBadge';
import { Lead, TeamMember } from '../types';

interface LeadCardProps {
  lead: Lead;
  teamMembers: TeamMember[];
  onClick: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  showMoveControls?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, teamMembers, onClick, onMovePrev, onMoveNext, showMoveControls }) => {
  const assignedMember = teamMembers.find((m) => m.id === lead.assignedTo);
  return (
    <div
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{lead.name}</h4>
          <p className="text-sm text-gray-500 truncate">{lead.company}</p>
        </div>
        <LeadScoreBadge score={lead.score} />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {lead.service}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className={cn('text-[10px] text-white', assignedMember?.color ?? 'bg-gray-400')}>
              {assignedMember?.initials ?? 'UN'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {showMoveControls && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {onMovePrev && (
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md pointer-events-auto bg-white hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); onMovePrev(); }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          {onMoveNext && (
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md pointer-events-auto bg-white hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); onMoveNext(); }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
