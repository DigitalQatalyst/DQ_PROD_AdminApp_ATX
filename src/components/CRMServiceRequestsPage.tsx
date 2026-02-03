import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircleIcon, FilterIcon, SearchIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedError } from './AccessDeniedError';
import { Toast } from './ui/Toast';

const ENABLE_CRM_SERVICE_REQUESTS = true; // TODO: disable after testing

export const CRMServiceRequestsPage: React.FC = () => {
  const { userSegment, role, isLoading: authLoading } = useAuth();
  const { data: requests, loading, error, list } = useCRUD<ServiceRequest>('crm_service_requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
      } catch (err) {
        console.error('Failed to load service requests:', err);
      }
    };

    if (!authLoading && userSegment === 'internal' && role === 'admin' && ENABLE_CRM_SERVICE_REQUESTS) {
      loadRequests();
    }
  }, [authLoading, list, role, userSegment]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== 'All' && request.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const target = [
          request.id,
          request.lead_id,
          request.status,
          request.source
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return target.includes(query);
      }
      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!ENABLE_CRM_SERVICE_REQUESTS) {
    return <AccessDeniedError error="generic" message="CRM Service Requests are disabled until the next release." />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (userSegment !== 'internal' || role !== 'admin') {
    return <AccessDeniedError error="generic" message="Service requests are restricted to internal admins." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
          <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load requests</h2>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || 'You may not have permission to view this page.'}
          </p>
          <button
            onClick={() => list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' })}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">CRM Service Requests</h1>
          <p className="text-sm text-gray-500">Opportunities created from qualified leads.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search requests"
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <FilterIcon className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full text-sm outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredRequests.length} requests
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Request ID</th>
                <th className="text-left px-4 py-3 font-medium">Lead</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{request.id}</td>
                    <td className="px-4 py-3 text-gray-700">{request.lead_id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{request.source || 'Manual'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(request.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
