/**
 * useOpportunities
 * Data hook that bridges the Supabase service layer with the CRM UI.
 * Falls back to mock data when Supabase is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import { Opportunity, OpportunityStage, Activity, ActivityType } from '../types';
import { mockOpportunities } from '../data/mockData';
import * as opportunityService from '../services/opportunityService';
import { getSupabaseClient } from '../../../lib/dbClient';

interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  usingMock: boolean;
  refetch: () => Promise<void>;
  createOpportunity: (data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>) => Promise<Opportunity>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<void>;
  updateOpportunityStage: (id: string, stage: OpportunityStage) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  logActivity: (opportunityId: string, type: ActivityType, description: string, performedByName?: string) => Promise<void>;
  addNote: (opportunityId: string, body: string, authorName?: string) => Promise<void>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const isSupabaseAvailable = !!getSupabaseClient();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    isSupabaseAvailable ? [] : mockOpportunities
  );
  const [loading, setLoading] = useState(isSupabaseAvailable);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(!isSupabaseAvailable);

  const refetch = useCallback(async () => {
    if (!isSupabaseAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const data = await opportunityService.fetchOpportunities();
      setOpportunities(data);
      setUsingMock(false);
    } catch (err) {
      console.error('[useOpportunities] fetchOpportunities failed, falling back to mock data:', err);
      setOpportunities(mockOpportunities);
      setUsingMock(true);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [isSupabaseAvailable]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ── Mutations — optimistic update then sync ──────────────────────────────

  const createOpportunity = useCallback(async (
    data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>
  ): Promise<Opportunity> => {
    const optimistic: Opportunity = {
      ...data,
      id: `tmp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      activities: [],
    };
    setOpportunities((prev) => [optimistic, ...prev]);
    if (usingMock) {
      return optimistic;
    }
    try {
      const created = await opportunityService.createOpportunity(data);
      setOpportunities((prev) => prev.map((o) => (o.id === optimistic.id ? created : o)));
      return created;
    } catch (err) {
      console.error('[useOpportunities] createOpportunity failed:', err);
      await refetch();
      throw err;
    }
  }, [usingMock, refetch]);

  const updateOpportunity = useCallback(async (id: string, updates: Partial<Opportunity>) => {
    // Optimistic
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    if (!usingMock) {
      try {
        await opportunityService.updateOpportunity(id, updates);
      } catch (err) {
        console.error('[useOpportunities] updateOpportunity failed:', err);
        await refetch();
      }
    }
  }, [usingMock, refetch]);

  const updateOpportunityStage = useCallback(async (id: string, stage: OpportunityStage) => {
    const now = new Date().toISOString();
    const stagePatch: Partial<Opportunity> = { stage };
    if (stage === 'Closed Won')  stagePatch.wonAt  = now;
    if (stage === 'Closed Lost') stagePatch.lostAt = now;

    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...stagePatch } : o)));
    if (!usingMock) {
      try {
        await opportunityService.updateOpportunityStage(id, stage);
      } catch (err) {
        console.error('[useOpportunities] updateOpportunityStage failed:', err);
        await refetch();
      }
    }
  }, [usingMock, refetch]);

  const deleteOpportunity = useCallback(async (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (!usingMock) {
      try {
        await opportunityService.deleteOpportunity(id);
      } catch (err) {
        console.error('[useOpportunities] deleteOpportunity failed:', err);
        await refetch();
      }
    }
  }, [usingMock, refetch]);

  const logActivity = useCallback(async (
    opportunityId: string,
    type: ActivityType,
    description: string,
    performedByName?: string
  ) => {
    // Append to in-memory activities immediately
    setOpportunities((prev) => prev.map((o) => {
      if (o.id !== opportunityId) return o;
      const newActivity: Activity = {
        id: `a${Date.now()}`,
        type,
        description,
        timestamp: new Date().toISOString(),
        user: performedByName ?? 'You',
      };
      return { ...o, activities: [newActivity, ...o.activities] };
    }));
    if (!usingMock) {
      await opportunityService.logOpportunityActivity(opportunityId, type, description, performedByName);
    }
  }, [usingMock]);

  const addNote = useCallback(async (opportunityId: string, body: string, authorName?: string) => {
    // Append to in-memory activities immediately
    setOpportunities((prev) => prev.map((o) => {
      if (o.id !== opportunityId) return o;
      const newNote: Activity = {
        id: `a${Date.now()}`,
        type: 'note' as const,
        description: body,
        timestamp: new Date().toISOString(),
        user: authorName ?? 'You',
      };
      return { ...o, activities: [newNote, ...o.activities] };
    }));
    if (!usingMock) {
      await opportunityService.addOpportunityNote(opportunityId, body, authorName);
    }
  }, [usingMock]);

  return {
    opportunities,
    loading,
    error,
    usingMock,
    refetch,
    createOpportunity,
    updateOpportunity,
    updateOpportunityStage,
    deleteOpportunity,
    logActivity,
    addNote,
  };
}
