/**
 * Opportunity Service
 * All Supabase DB calls for the opportunity management module.
 * Tables: crm_opportunities, crm_opportunity_activities, crm_opportunity_notes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../../lib/dbClient';
import type { Opportunity, Activity, OpportunityStage } from '../types';
import type { ActivityType } from '../types';

// ---------------------------------------------------------------------------
// Dedicated service-role client for mock-auth / dev mode
// Created once at module load so we don't spin up a new client per call.
// ---------------------------------------------------------------------------
let _serviceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

  if (useMockAuth && serviceRoleKey && supabaseUrl) {
    if (!_serviceClient) {
      _serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return _serviceClient;
  }

  const shared = getSupabaseClient();
  if (!shared) throw new Error('Supabase client not available');
  return shared;
}

// ---------------------------------------------------------------------------
// DB row shapes (snake_case from Supabase)
// ---------------------------------------------------------------------------

interface DbOpportunity {
  id: string;
  organization_id: string | null;
  title: string;
  stage: OpportunityStage;
  deal_value: number;
  currency: string;
  probability: number;
  close_date: string | null;
  lead_id: string | null;
  firm_id: string | null;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
  notes: string | null;
  assigned_to: string | null;
  tags: string[];
  lost_reason: string | null;
  won_at: string | null;
  lost_at: string | null;
  last_activity_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface DbOpportunityActivity {
  id: string;
  opportunity_id: string;
  activity_type: string;
  description: string;
  performed_by: string | null;
  performed_by_name: string | null;
  occurred_at: string;
  created_at: string;
}

interface DbOpportunityNote {
  id: string;
  opportunity_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Mappers — DB row → app Opportunity type
// ---------------------------------------------------------------------------

function dbActivityToActivity(row: DbOpportunityActivity): Activity {
  return {
    id: row.id,
    type: row.activity_type as Activity['type'],
    description: row.description,
    timestamp: row.occurred_at,
    user: row.performed_by_name ?? 'System',
  };
}

function dbOpportunityToOpportunity(row: DbOpportunity, activities: Activity[] = []): Opportunity {
  return {
    id: row.id,
    title: row.title,
    stage: row.stage,
    dealValue: row.deal_value,
    currency: row.currency,
    probability: row.probability,
    closeDate: row.close_date ?? '',
    assignedTo: row.assigned_to ?? '',
    tags: row.tags ?? [],
    createdAt: row.created_at,
    activities,
    leadId: row.lead_id ?? undefined,
    firmId: row.firm_id ?? undefined,
    companyName: row.company_name ?? undefined,
    contactName: row.contact_name ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    description: row.description ?? undefined,
    notes: row.notes ?? undefined,
    lostReason: row.lost_reason ?? undefined,
    wonAt: row.won_at ?? undefined,
    lostAt: row.lost_at ?? undefined,
    lastActivityAt: row.last_activity_at ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient() {
  return getServiceClient();
}

// ---------------------------------------------------------------------------
// Opportunities CRUD
// ---------------------------------------------------------------------------

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const sb = getClient();
  const { data, error } = await sb
    .from('crm_opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbOpportunity[]).map((row) => dbOpportunityToOpportunity(row));
}

export async function fetchOpportunityById(id: string): Promise<Opportunity | null> {
  const sb = getClient();

  const [oppRes, activitiesRes, notesRes] = await Promise.all([
    sb.from('crm_opportunities').select('*').eq('id', id).single(),
    sb.from('crm_opportunity_activities').select('*').eq('opportunity_id', id).order('occurred_at', { ascending: false }),
    sb.from('crm_opportunity_notes').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
  ]);

  if (oppRes.error || !oppRes.data) return null;

  const activities: Activity[] = [
    ...((activitiesRes.data as DbOpportunityActivity[]) ?? []).map(dbActivityToActivity),
    ...((notesRes.data as DbOpportunityNote[]) ?? []).map((n) => ({
      id: n.id,
      type: 'note' as const,
      description: n.body,
      timestamp: n.created_at,
      user: n.author_name ?? 'Unknown',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return dbOpportunityToOpportunity(oppRes.data as DbOpportunity, activities);
}

export async function createOpportunity(
  data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>
): Promise<Opportunity> {
  if (!data.title || !data.title.trim()) {
    throw new Error('title is required');
  }

  const sb = getClient();
  const clampedProbability = Math.max(0, Math.min(100, data.probability));

  const { data: row, error } = await sb
    .from('crm_opportunities')
    .insert({
      title: data.title.trim(),
      stage: data.stage ?? 'Qualification',
      deal_value: data.dealValue ?? 0,
      currency: data.currency ?? 'USD',
      probability: clampedProbability,
      close_date: data.closeDate || null,
      lead_id: data.leadId ?? null,
      firm_id: data.firmId ?? null,
      company_name: data.companyName ?? null,
      contact_name: data.contactName ?? null,
      contact_email: data.contactEmail ?? null,
      contact_phone: data.contactPhone ?? null,
      description: data.description ?? null,
      notes: data.notes ?? null,
      assigned_to: data.assignedTo || null,
      tags: data.tags ?? [],
      lost_reason: data.lostReason ?? null,
      won_at: data.wonAt ?? null,
      lost_at: data.lostAt ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return dbOpportunityToOpportunity(row as DbOpportunity);
}

export async function updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<void> {
  const sb = getClient();
  const patch: Partial<DbOpportunity> = {};

  if (updates.title !== undefined)        patch.title         = updates.title;
  if (updates.stage !== undefined)        patch.stage         = updates.stage;
  if (updates.dealValue !== undefined)    patch.deal_value    = updates.dealValue;
  if (updates.currency !== undefined)     patch.currency      = updates.currency;
  if (updates.probability !== undefined)  patch.probability   = updates.probability;
  if (updates.closeDate !== undefined)    patch.close_date    = updates.closeDate || null;
  if (updates.leadId !== undefined)       patch.lead_id       = updates.leadId ?? null;
  if (updates.firmId !== undefined)       patch.firm_id       = updates.firmId ?? null;
  if (updates.companyName !== undefined)  patch.company_name  = updates.companyName ?? null;
  if (updates.contactName !== undefined)  patch.contact_name  = updates.contactName ?? null;
  if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail ?? null;
  if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone ?? null;
  if (updates.description !== undefined)  patch.description   = updates.description ?? null;
  if (updates.notes !== undefined)        patch.notes         = updates.notes ?? null;
  if (updates.assignedTo !== undefined)   patch.assigned_to   = updates.assignedTo || null;
  if (updates.tags !== undefined)         patch.tags          = updates.tags;
  if (updates.lostReason !== undefined)   patch.lost_reason   = updates.lostReason ?? null;
  if (updates.wonAt !== undefined)        patch.won_at        = updates.wonAt ?? null;
  if (updates.lostAt !== undefined)       patch.lost_at       = updates.lostAt ?? null;

  const { error } = await sb.from('crm_opportunities').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateOpportunityStage(id: string, stage: OpportunityStage): Promise<void> {
  const sb = getClient();
  const patch: Partial<DbOpportunity> = { stage };

  if (stage === 'Closed Won')  patch.won_at  = new Date().toISOString();
  if (stage === 'Closed Lost') patch.lost_at = new Date().toISOString();

  const { error } = await sb.from('crm_opportunities').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_opportunities').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function logOpportunityActivity(
  opportunityId: string,
  type: ActivityType,
  description: string,
  performedByName?: string
): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_opportunity_activities').insert({
    opportunity_id: opportunityId,
    activity_type: type,
    description,
    performed_by_name: performedByName ?? null,
    occurred_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function addOpportunityNote(
  opportunityId: string,
  body: string,
  authorName?: string
): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_opportunity_notes').insert({
    opportunity_id: opportunityId,
    body,
    author_name: authorName ?? null,
  });
  if (error) throw error;
}

export async function deleteOpportunityNote(noteId: string): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_opportunity_notes').delete().eq('id', noteId);
  if (error) throw error;
}
