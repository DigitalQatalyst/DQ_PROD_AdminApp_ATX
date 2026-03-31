/**
 * useLeads
 * Data hook that bridges the Supabase service layer with the CRM UI.
 * Falls back to mock data when Supabase is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, Activity } from '../types';
import { initialLeads } from '../data/mockData';
import * as leadService from '../services/leadService';
import { getSupabaseClient } from '../../../lib/dbClient';

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  usingMock: boolean;
  refetch: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'activities' | 'createdAt' | 'score'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  logActivity: (leadId: string, type: Activity['type'], description: string, performedByName?: string) => Promise<void>;
  addNote: (leadId: string, body: string, authorName?: string) => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const isSupabaseAvailable = !!getSupabaseClient();

  const [leads, setLeads] = useState<Lead[]>(isSupabaseAvailable ? [] : initialLeads);
  const [loading, setLoading] = useState(isSupabaseAvailable);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(!isSupabaseAvailable);

  const refetch = useCallback(async () => {
    if (!isSupabaseAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.fetchLeads();
      setLeads(data);
      setUsingMock(false);
    } catch (err) {
      console.error('[useLeads] fetchLeads failed, falling back to mock data:', err);
      setLeads(initialLeads);
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

  const createLead = useCallback(async (
    lead: Omit<Lead, 'id' | 'activities' | 'createdAt' | 'score'>
  ): Promise<Lead> => {
    if (usingMock) {
      const newLead: Lead = {
        ...lead,
        id: `l${Date.now()}`,
        score: Math.floor(Math.random() * 40) + 30,
        createdAt: new Date().toISOString(),
        activities: [{ id: `a${Date.now()}`, type: 'note', description: 'Lead created', timestamp: new Date().toISOString(), user: 'You' }],
      };
      setLeads((prev) => [newLead, ...prev]);
      return newLead;
    }
    const created = await leadService.createLead(lead);
    setLeads((prev) => [created, ...prev]);
    return created;
  }, [usingMock]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    // Optimistic
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    if (!usingMock) {
      try {
        await leadService.updateLead(id, updates);
      } catch (err) {
        console.error('[useLeads] updateLead failed:', err);
        await refetch(); // revert on failure
      }
    }
  }, [usingMock, refetch]);

  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (!usingMock) {
      try {
        await leadService.updateLeadStatus(id, status);
        await leadService.logActivity(id, 'status_change', `Status changed to ${status}`);
      } catch (err) {
        console.error('[useLeads] updateLeadStatus failed:', err);
        await refetch();
      }
    }
  }, [usingMock, refetch]);

  const deleteLead = useCallback(async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (!usingMock) {
      try {
        await leadService.deleteLead(id);
      } catch (err) {
        console.error('[useLeads] deleteLead failed:', err);
        await refetch();
      }
    }
  }, [usingMock, refetch]);

  const logActivity = useCallback(async (
    leadId: string,
    type: Activity['type'],
    description: string,
    performedByName?: string
  ) => {
    if (!usingMock) {
      await leadService.logActivity(leadId, type, description, performedByName);
    }
    // Optimistic: append to in-memory lead activities
    setLeads((prev) => prev.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        activities: [
          { id: `a${Date.now()}`, type, description, timestamp: new Date().toISOString(), user: performedByName ?? 'You' },
          ...l.activities,
        ],
      };
    }));
  }, [usingMock]);

  const addNote = useCallback(async (leadId: string, body: string, authorName?: string) => {
    if (!usingMock) {
      await leadService.addNote(leadId, body, authorName);
    }
    setLeads((prev) => prev.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        activities: [
          { id: `a${Date.now()}`, type: 'note' as const, description: body, timestamp: new Date().toISOString(), user: authorName ?? 'You' },
          ...l.activities,
        ],
      };
    }));
  }, [usingMock]);

  return {
    leads,
    loading,
    error,
    usingMock,
    refetch,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    logActivity,
    addNote,
  };
}
