import { useState, useCallback, useMemo } from 'react';
import {
  Opportunity,
  OpportunityStage,
  OpportunityViewType,
  OpportunityFilterState,
} from '../types';
import { teamMembers } from '../../lead-management/data/mockData';
import { useOpportunities } from './useOpportunities';

export function useCRMOpportunity() {
  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
    usingMock,
    createOpportunity: dbCreateOpportunity,
    updateOpportunity: dbUpdateOpportunity,
    updateOpportunityStage: dbUpdateOpportunityStage,
    deleteOpportunity: dbDeleteOpportunity,
    logActivity,
    addNote,
  } = useOpportunities();

  const [activeView, setActiveView] = useState<OpportunityViewType>('dashboard');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<OpportunityViewType>('opportunities');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<OpportunityFilterState>({
    stage: 'All',
    assignedTo: 'All',
    search: '',
    closeDateFrom: '',
    closeDateTo: '',
    dealValueMin: 0,
    dealValueMax: 0,
  });

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      if (filters.stage !== 'All' && o.stage !== filters.stage) return false;
      if (filters.assignedTo !== 'All' && o.assignedTo !== filters.assignedTo) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = [o.title, o.companyName, o.contactName].some(
          (f) => f?.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (filters.closeDateFrom && o.closeDate < filters.closeDateFrom) return false;
      if (filters.closeDateTo && o.closeDate > filters.closeDateTo) return false;
      if (o.dealValue < filters.dealValueMin) return false;
      if (filters.dealValueMax > 0 && o.dealValue > filters.dealValueMax) return false;
      return true;
    });
  }, [opportunities, filters]);

  const selectedOpportunity = useMemo(
    () => opportunities.find((o) => o.id === selectedOpportunityId) || null,
    [opportunities, selectedOpportunityId]
  );

  const navigateToOpportunity = useCallback((id: string, fromView: OpportunityViewType) => {
    setSelectedOpportunityId(id);
    setPreviousView(fromView);
    setActiveView('opportunity-detail');
  }, []);

  const navigateBack = useCallback(() => {
    setActiveView(previousView);
    setSelectedOpportunityId(null);
  }, [previousView]);

  const updateOpportunityStage = useCallback(
    (id: string, stage: OpportunityStage) => {
      dbUpdateOpportunityStage(id, stage);
      logActivity(id, 'status_change', `Stage changed to ${stage}`);
    },
    [dbUpdateOpportunityStage, logActivity]
  );

  const assignOpportunity = useCallback(
    (id: string, memberId: string) => {
      const member = teamMembers.find((m) => m.id === memberId);
      dbUpdateOpportunity(id, { assignedTo: memberId });
      logActivity(id, 'assignment', `Assigned to ${member?.name || memberId}`);
    },
    [dbUpdateOpportunity, logActivity]
  );

  const addOpportunity = useCallback(
    (data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>) => {
      dbCreateOpportunity(data);
    },
    [dbCreateOpportunity]
  );

  const updateOpportunity = useCallback(
    (id: string, updates: Partial<Opportunity>) => {
      dbUpdateOpportunity(id, updates);
    },
    [dbUpdateOpportunity]
  );

  const deleteOpportunity = useCallback(
    (id: string) => {
      dbDeleteOpportunity(id);
      if (selectedOpportunityId === id) {
        setSelectedOpportunityId(null);
        setActiveView(previousView);
      }
    },
    [dbDeleteOpportunity, selectedOpportunityId, previousView]
  );

  const getOpportunitiesByStage = useCallback(
    (stage: OpportunityStage) => opportunities.filter((o) => o.stage === stage),
    [opportunities]
  );

  const bulkUpdateStage = useCallback(
    (ids: string[], stage: OpportunityStage) => {
      ids.forEach((id) => updateOpportunityStage(id, stage));
      setSelectedOpportunityIds([]);
    },
    [updateOpportunityStage]
  );

  const bulkAssign = useCallback(
    (ids: string[], memberId: string) => {
      ids.forEach((id) => assignOpportunity(id, memberId));
      setSelectedOpportunityIds([]);
    },
    [assignOpportunity]
  );

  const bulkDelete = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => deleteOpportunity(id));
      setSelectedOpportunityIds([]);
    },
    [deleteOpportunity]
  );

  const toggleOpportunitySelection = useCallback((id: string) => {
    setSelectedOpportunityIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAllOpportunities = useCallback((ids: string[]) => {
    setSelectedOpportunityIds((prev) => (prev.length === ids.length ? [] : ids));
  }, []);

  return {
    opportunities,
    filteredOpportunities,
    selectedOpportunity,
    activeView,
    previousView,
    sidebarOpen,
    selectedOpportunityIds,
    filters,
    teamMembers,
    opportunitiesLoading,
    opportunitiesError,
    usingMock,
    setActiveView,
    setFilters,
    setSidebarOpen,
    navigateToOpportunity,
    navigateBack,
    updateOpportunityStage,
    assignOpportunity,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunitiesByStage,
    bulkUpdateStage,
    bulkAssign,
    bulkDelete,
    toggleOpportunitySelection,
    selectAllOpportunities,
    setSelectedOpportunityIds,
    addNote,
  };
}
