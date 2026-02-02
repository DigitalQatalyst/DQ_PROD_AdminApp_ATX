import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon, AlertCircleIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadSource, LeadStage } from '../types';
import { Toast } from './ui/Toast';
import { LeadDetailsDrawer } from './LeadDetailsDrawer';
import { AccessDeniedError } from './AccessDeniedError';

const stageOptions: LeadStage[] = ['New', 'Qualifying', 'Qualified', 'Converted', 'Disqualified'];
const sourceOptions: LeadSource[] = ['Login', 'Enquiry', 'Manual'];

export const LeadManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSegment, role, isLoading: authLoading } = useAuth();
  const { data: leads, loading, error, list, update } = useCRUD<Lead>('crm_leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
      } catch (err) {
        console.error('Failed to load leads:', err);
      }
    };

    if (!authLoading && userSegment === 'internal' && role === 'admin') {
      loadLeads();
    }
  }, [authLoading, list, role, userSegment]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (stageFilter !== 'All' && lead.stage !== stageFilter) return false;
      if (sourceFilter !== 'All' && lead.source !== sourceFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const target = [
          lead.contact_name,
          lead.contact_email,
          lead.contact_phone,
          lead.organization_name
        ].filter(Boolean).join(' ').toLowerCase();
        return target.includes(query);
      }
      return true;
    });
  }, [leads, searchQuery, stageFilter, sourceFilter]);

  const handleOpenDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    await update(leadId, updates);
    await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
    return <AccessDeniedError error="generic" message="Lead management is restricted to internal admins." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
          <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load leads</h2>
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
          <h1 className="text-2xl font-semibold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-500">Track and qualify inbound interest from internal channels.</p>
        </div>
        <button
          onClick={() => navigate('/lead-form')}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          New Lead
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search leads"
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <FilterIcon className="w-4 h-4 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              className="w-full text-sm outline-none"
            >
              <option value="All">All stages</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <FilterIcon className="w-4 h-4 text-gray-400" />
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="w-full text-sm outline-none"
            >
              <option value="All">All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredLeads.length} leads
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Stage</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOpenDrawer(lead)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{lead.contact_name || 'Unnamed lead'}</div>
                      <div className="text-xs text-gray-500">{lead.contact_email || lead.contact_phone || 'No contact info'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lead.owner_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(lead.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailsDrawer
        isOpen={isDrawerOpen}
        lead={selectedLead}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleUpdateLead}
        showToast={(message, type) => setToast({ message, type })}
      />

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
