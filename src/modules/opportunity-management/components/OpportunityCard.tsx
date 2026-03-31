import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import Button from '../../../components/ui/ButtonComponent';
import { Badge } from '../../../components/ui/Badge';
import { OpportunityStageBadge } from './OpportunityStageBadge';
import { OpportunityValueDisplay } from './OpportunityValueDisplay';
import { Opportunity, TeamMember } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onClick: () => void;
  showMoveControls?: boolean;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  teamMembers,
  onClick,
  showMoveControls,
  onMovePrev,
  onMoveNext,
}) => {
  const assignedMember = teamMembers.find((m) => m.id === opportunity.assignedTo);
  const isPastDue = opportunity.closeDate && new Date(opportunity.closeDate) < new Date();

  const probabilityColor =
    opportunity.probability >= 70
      ? 'bg-green-100 text-green-700'
      : opportunity.probability >= 40
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const visibleTags = opportunity.tags.slice(0, 2);
  const overflowCount = opportunity.tags.length - 2;

  return (
    <div
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Title + value */}
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-gray-900 truncate flex-1 min-w-0 mr-2">{opportunity.title}</h4>
        <span className="text-sm font-semibold text-gray-700 shrink-0">
          <OpportunityValueDisplay value={opportunity.dealValue} currency={opportunity.currency} compact />
        </span>
      </div>

      {/* Company */}
      {opportunity.companyName && (
        <p className="text-sm text-gray-500 truncate mb-2">{opportunity.companyName}</p>
      )}

      {/* Probability + close date */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', probabilityColor)}>
          {opportunity.probability}%
        </span>
        {opportunity.closeDate && (
          <span className={cn('text-xs', isPastDue ? 'text-red-600 font-medium' : 'text-gray-500')}>
            {new Date(opportunity.closeDate).toLocaleDateString()}
            {isPastDue && ' ⚠'}
          </span>
        )}
      </div>

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600">
              {tag}
            </Badge>
          ))}
          {overflowCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-500">
              +{overflowCount}
            </Badge>
          )}
        </div>
      )}

      {/* Footer: assignee + stage */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className={cn('text-[10px] text-white', assignedMember?.color ?? 'bg-gray-400')}>
              {assignedMember?.initials ?? 'UN'}
            </AvatarFallback>
          </Avatar>
        </div>
        <OpportunityStageBadge stage={opportunity.stage} size="sm" />
      </div>

      {/* Move controls */}
      {showMoveControls && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {onMovePrev && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md pointer-events-auto bg-white hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); onMovePrev(); }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          {onMoveNext && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md pointer-events-auto bg-white hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); onMoveNext(); }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
