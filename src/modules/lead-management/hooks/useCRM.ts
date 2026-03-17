import { useState, useCallback, useMemo } from 'react';
import { Lead, LeadStatus, FilterState, ViewType } from '../types';
import { initialLeads, teamMembers } from '../data/mockData';

export function useCRM() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
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
      if (lead.score < filters.scoreMin || lead.score > filters.scoreMax) return false;
      if (filters.formType !== 'All' && lead.formType !== filters.formType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.service.toLowerCase().includes(q)
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
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          status: newStatus,
          activities: [
            { id: `a${Date.now()}`, type: 'status_change' as const, description: `Status changed to ${newStatus}`, timestamp: new Date().toISOString(), user: 'You' },
            ...l.activities,
          ],
        };
      })
    );
  }, []);

  const assignLead = useCallback((leadId: string, memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          assignedTo: memberId,
          activities: [
            { id: `a${Date.now()}`, type: 'note' as const, description: `Assigned to ${member?.name || memberId}`, timestamp: new Date().toISOString(), user: 'You' },
            ...l.activities,
          ],
        };
      })
    );
  }, []);

  const addNote = useCallback((leadId: string, note: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          activities: [
            { id: `a${Date.now()}`, type: 'note' as const, description: note, timestamp: new Date().toISOString(), user: 'You' },
            ...l.activities,
          ],
        };
      })
    );
  }, []);

  const addTag = useCallback((leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        if (l.tags.includes(tag)) return l;
        return { ...l, tags: [...l.tags, tag] };
      })
    );
  }, []);

  const removeTag = useCallback((leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return { ...l, tags: l.tags.filter((t) => t !== tag) };
      })
    );
  }, []);

  const addLead = useCallback(
    (lead: Omit<Lead, 'id' | 'activities' | 'createdAt' | 'score'>) => {
      const newLead: Lead = {
        ...lead,
        id: `l${Date.now()}`,
        score: Math.floor(Math.random() * 40) + 30,
        createdAt: new Date().toISOString(),
        activities: [
          { id: `a${Date.now()}`, type: 'note' as const, description: 'Lead created manually', timestamp: new Date().toISOString(), user: 'You' },
        ],
      };
      setLeads((prev) => [newLead, ...prev]);
    },
    []
  );

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id !== leadId ? l : { ...l, ...updates }))
    );
  }, []);

  const deleteLead = useCallback(
    (leadId: string) => {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLeadId === leadId) {
        setSelectedLeadId(null);
        setActiveView(previousView);
      }
    },
    [selectedLeadId, previousView]
  );

  const bulkUpdateStatus = useCallback((ids: string[], status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        return {
          ...l,
          status,
          activities: [
            { id: `a${Date.now()}_${l.id}`, type: 'status_change' as const, description: `Status changed to ${status} (bulk action)`, timestamp: new Date().toISOString(), user: 'You' },
            ...l.activities,
          ],
        };
      })
    );
    setSelectedLeadIds([]);
  }, []);

  const bulkAssign = useCallback((ids: string[], memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    setLeads((prev) =>
      prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        return {
          ...l,
          assignedTo: memberId,
          activities: [
            { id: `a${Date.now()}_${l.id}`, type: 'note' as const, description: `Assigned to ${member?.name || memberId} (bulk action)`, timestamp: new Date().toISOString(), user: 'You' },
            ...l.activities,
          ],
        };
      })
    );
    setSelectedLeadIds([]);
  }, []);

  const bulkAddTag = useCallback((ids: string[], tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        if (l.tags.includes(tag)) return l;
        return { ...l, tags: [...l.tags, tag] };
      })
    );
    setSelectedLeadIds([]);
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
    setSelectedLeadIds([]);
  }, []);

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
