import React from 'react';
import { format } from 'date-fns';
import { Clock, User, Building2 } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ServiceRequest, ServiceRequestPriority } from '../types';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  isSelected: boolean;
  onClick: () => void;
}

const PRIORITY_COLORS: Record<ServiceRequestPriority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-all hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2">
          {request.title}
        </h4>
        <StatusBadge status={request.status.replace('_', ' ')} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${PRIORITY_COLORS[request.priority]}`}>
          {request.priority}
        </span >
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 font-medium uppercase">
          {request.type}
        </span>
        {request.is_automated_trigger && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 font-medium uppercase">
            Automated
          </span>
        )}
      </div>

      <div className="space-y-1">
        {request.account_name && (
          <div className="flex items-center text-[11px] text-gray-500">
            <Building2 className="h-3 w-3 mr-1.5" />
            <span className="truncate">{request.account_name}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-[10px] text-gray-400">
            <Clock className="h-3 w-3 mr-1.5" />
            {format(new Date(request.created_at), 'MMM d, p')}
          </div>
          {request.owner_name && (
            <div className="flex items-center text-[10px] text-gray-400">
              <User className="h-3 w-3 mr-1" />
              {request.owner_name.split(' ')[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
