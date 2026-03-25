import React from 'react';
import { Search, Plus } from 'lucide-react';
import { ServiceRequestCard } from './ServiceRequestCard';
import { ServiceRequest, ServiceRequestFilters } from '../types';

const LocalSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface ServiceRequestListProps {
  requests: ServiceRequest[];
  loading: boolean;
  filters: ServiceRequestFilters;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFiltersChange: (filters: ServiceRequestFilters) => void;
  onNew: () => void;
}

export const ServiceRequestList: React.FC<ServiceRequestListProps> = ({
  requests,
  loading,
  filters,
  selectedId,
  onSelect,
  onFiltersChange,
  onNew,
}) => {
  const filteredRequests = React.useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = !filters.search || 
        r.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        (r.description?.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesStatus = filters.status === 'all' || r.status === filters.status;
      const matchesType = filters.type === 'all' || r.type === filters.type;
      const matchesPriority = filters.priority === 'all' || r.priority === filters.priority;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [requests, filters]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Search & Actions */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Requests</h3>
          <button 
            onClick={onNew}
            className="p-1 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
            title="New Request"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Search title, desc..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
            <select 
                className="text-[10px] border rounded px-1.5 py-1 outline-none bg-gray-50 border-gray-200"
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
            >
                <option value="all">Status: All</option>
                <option value="raised">Raised</option>
                <option value="triaged">Triaged</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
            </select>
            <select 
                className="text-[10px] border rounded px-1.5 py-1 outline-none bg-gray-50 border-gray-200"
                value={filters.priority}
                onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as any })}
            >
                <option value="all">Priority: All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LocalSpinner className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map(request => (
            <ServiceRequestCard
              key={request.id}
              request={request}
              isSelected={selectedId === request.id}
              onClick={() => onSelect(request.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-xs text-gray-500 italic">No requests found</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-gray-50 text-[10px] text-gray-400 text-center uppercase tracking-widest font-semibold">
        {filteredRequests.length} Records
      </div>
    </div>
  );
};
