import { useState, useCallback, useMemo } from 'react';
import { Lead, LeadStatus, FilterState, ViewType } from '../types';
import { teamMembers } from '../data/mockData';
import { useLeads } from './useLeads';

export function useCRM() {
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    usingMock,
    createLead: dbCreateLead,
    updateLead: dbUpdateLead,
    updateLeadStatus: dbUpdateLeadStatus,
    deleteLead: dbDeleteLead,
    logActivity,
    addNote: dbAddNote,
  } = useLeads();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<ViewType>('leads');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({

    status: 'All',
    source: 'All',
    assignedTo: 'All',
    scoreMin: 0,
    scoreMax: 100,
    search: '',
    formType: 'All',
  });

  const navigateToLead = useCallback((leadId: string, fromView: ViewType) => {
    setSelectedLeadId(leadId);
    setPreviousView(fromView);
    setActiveView('lead-detail');
  }, []);

  const navigateBack = useCallback(() => {
    setActiveView(previousView);
    setSelectedLeadId(null);
  }, [previousView]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.status !== 'All' && lead.status !== filters.status) return false;
      if (filters.source !== 'All' && lead.source !== filters.source) return false;
      if (filters.assignedTo !== 'All' && lead.assignedTo !== filters.assignedTo) return false;
      if ((lead.score ?? 0) < filters.scoreMin || (lead.score ?? 0) > filters.scoreMax) return false;
      if (filters.formType !== 'All' && lead.formType !== filters.formType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          (lead.name ?? '').toLowerCase().includes(q) ||
          (lead.company ?? '').toLowerCase().includes(q) ||
          (lead.email ?? '').toLowerCase().includes(q) ||
          (lead.service ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, filters]);

  const getLeadsByStatus = useCallback(
    (status: LeadStatus) => leads.filter((l) => l.status === status),
    [leads]
  );

  const updateLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    dbUpdateLeadStatus(leadId, newStatus);
    logActivity(leadId, 'status_change', `Status changed to ${newStatus}`);
  }, [dbUpdateLeadStatus, logActivity]);

  const assignLead = useCallback((leadId: string, memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    dbUpdateLead(leadId, { assignedTo: memberId });
    logActivity(leadId, 'assignment', `Assigned to ${member?.name || memberId}`);
  }, [dbUpdateLead, logActivity]);

  const addNote = useCallback((leadId: string, note: string) => {
    dbAddNote(leadId, note);
  }, [dbAddNote]);

  const addTag = useCallback((leadId: string, tag: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.tags.includes(tag)) return;
    dbUpdateLead(leadId, { tags: [...lead.tags, tag] });
    logActivity(leadId, 'tag_change', `Tag added: ${tag}`);
  }, [leads, dbUpdateLead, logActivity]);

  const removeTag = useCallback((leadId: string, tag: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    dbUpdateLead(leadId, { tags: lead.tags.filter((t) => t !== tag) });
    logActivity(leadId, 'tag_change', `Tag removed: ${tag}`);
  }, [leads, dbUpdateLead, logActivity]);

  const addLead = useCallback(
    (lead: Omit<Lead, 'id' | 'activities' | 'createdAt' | 'score'>) => {
      dbCreateLead(lead);
    },
    [dbCreateLead]
  );

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    dbUpdateLead(leadId, updates);
  }, [dbUpdateLead]);

  const deleteLead = useCallback(
    (leadId: string) => {
      dbDeleteLead(leadId);
      if (selectedLeadId === leadId) {
        setSelectedLeadId(null);
        setActiveView(previousView);
      }
    },
    [dbDeleteLead, selectedLeadId, previousView]
  );

  const bulkUpdateStatus = useCallback((ids: string[], status: LeadStatus) => {
    ids.forEach((id) => {
      dbUpdateLeadStatus(id, status);
      logActivity(id, 'status_change', `Status changed to ${status} (bulk action)`);
    });
    setSelectedLeadIds([]);
  }, [dbUpdateLeadStatus, logActivity]);

  const bulkAssign = useCallback((ids: string[], memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    ids.forEach((id) => {
      dbUpdateLead(id, { assignedTo: memberId });
      logActivity(id, 'assignment', `Assigned to ${member?.name || memberId} (bulk action)`);
    });
    setSelectedLeadIds([]);
  }, [dbUpdateLead, logActivity]);

  const bulkAddTag = useCallback((ids: string[], tag: string) => {
    ids.forEach((id) => {
      const lead = leads.find((l) => l.id === id);
      if (lead && !lead.tags.includes(tag)) {
        dbUpdateLead(id, { tags: [...lead.tags, tag] });
      }
    });
    setSelectedLeadIds([]);
  }, [leads, dbUpdateLead]);

  const bulkDelete = useCallback((ids: string[]) => {
    ids.forEach((id) => dbDeleteLead(id));
    setSelectedLeadIds([]);
  }, [dbDeleteLead]);

  const toggleLeadSelection = useCallback((id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAllLeads = useCallback((ids: string[]) => {
    setSelectedLeadIds((prev) => (prev.length === ids.length ? [] : ids));
  }, []);

  return {
    leads,
    filteredLeads,
    selectedLead,
    activeView,
    previousView,
    sidebarOpen,
    selectedLeadIds,
    filters,
    teamMembers,
    leadsLoading,
    leadsError,
    usingMock,
    setActiveView,
    setFilters,
    setSidebarOpen,
    navigateToLead,
    navigateBack,
    updateLeadStatus,
    assignLead,
    addNote,
    addTag,
    removeTag,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByStatus,
    bulkUpdateStatus,
    bulkAssign,
    bulkAddTag,
    bulkDelete,
    toggleLeadSelection,
    selectAllLeads,
    setSelectedLeadIds,
  };
}
