/**
 * Lead Service
 * All Supabase DB calls for the lead management module.
 * Tables: crm_leads, crm_firms, crm_lead_activities, crm_lead_notes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../../lib/dbClient';
import type { Lead, Activity, LeadStatus, LeadSource, LeadPriority } from '../types';

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

interface DbLead {
  id: string;
  organization_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  firm_id: string | null;
  company_name: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority | null;
  score: number;
  service: string | null;
  form_type: string | null;
  assigned_to: string | null;
  tags: string[];
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  converted_at: string | null;
  last_contacted_at: string | null;
}

interface DbActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  performed_by: string | null;
  performed_by_name: string | null;
  occurred_at: string;
  created_at: string;
}

interface DbNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Mappers — DB row → app Lead type
// ---------------------------------------------------------------------------

function dbLeadToLead(row: DbLead, activities: Activity[] = []): Lead {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    company: row.company_name ?? '',
    source: row.source,
    service: (row.service ?? 'DCO Assessment') as Lead['service'],
    status: row.status,
    score: row.score ?? 0,
    assignedTo: row.assigned_to ?? '',
    tags: row.tags ?? [],
    createdAt: row.created_at,
    notes: row.notes ?? '',
    activities,
    priority: row.priority ?? undefined,
    formType: (row.form_type ?? undefined) as Lead['formType'],
    jobTitle: row.job_title ?? undefined,
    // Extended metadata fields
    budget: (row.metadata?.budget as string) ?? undefined,
    projectTimeline: (row.metadata?.project_timeline as string) ?? undefined,
    preferredDate: (row.metadata?.preferred_date as string) ?? undefined,
    preferredTime: (row.metadata?.preferred_time as string) ?? undefined,
    message: (row.metadata?.message as string) ?? undefined,
  };
}

function dbActivityToActivity(row: DbActivity): Activity {
  return {
    id: row.id,
    type: row.activity_type as Activity['type'],
    description: row.description,
    timestamp: row.occurred_at,
    user: row.performed_by_name ?? 'System',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient() {
  return getServiceClient();
}

// ---------------------------------------------------------------------------
// Leads CRUD
// ---------------------------------------------------------------------------

export async function fetchLeads(): Promise<Lead[]> {
  const sb = getClient();
  const { data, error } = await sb
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbLead[]).map((row) => dbLeadToLead(row));
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const sb = getClient();

  const [leadRes, activitiesRes, notesRes] = await Promise.all([
    sb.from('crm_leads').select('*').eq('id', id).single(),
    sb.from('crm_lead_activities').select('*').eq('lead_id', id).order('occurred_at', { ascending: false }),
    sb.from('crm_lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
  ]);

  if (leadRes.error || !leadRes.data) return null;

  const activities: Activity[] = [
    ...((activitiesRes.data as DbActivity[]) ?? []).map(dbActivityToActivity),
    ...((notesRes.data as DbNote[]) ?? []).map((n) => ({
      id: n.id,
      type: 'note' as const,
      description: n.body,
      timestamp: n.created_at,
      user: n.author_name ?? 'Unknown',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return dbLeadToLead(leadRes.data as DbLead, activities);
}

export async function createLead(
  lead: Omit<Lead, 'id' | 'activities' | 'createdAt' | 'score'>
): Promise<Lead> {
  const sb = getClient();
  const { data, error } = await sb
    .from('crm_leads')
    .insert({
      full_name: lead.name,
      email: lead.email || null,
      phone: lead.phone || null,
      job_title: lead.jobTitle || null,
      company_name: lead.company || null,
      source: lead.source,
      status: lead.status ?? 'New',
      priority: lead.priority ?? 'Medium',
      service: lead.service || null,
      form_type: lead.formType || null,
      assigned_to: lead.assignedTo || null,
      tags: lead.tags ?? [],
      notes: lead.notes || null,
      metadata: {
        budget: lead.budget,
        project_timeline: lead.projectTimeline,
        preferred_date: lead.preferredDate,
        preferred_time: lead.preferredTime,
        message: lead.message,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return dbLeadToLead(data as DbLead);
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  const sb = getClient();
  const patch: Partial<DbLead> & { metadata?: Record<string, unknown> } = {};

  if (updates.name !== undefined)       patch.full_name    = updates.name;
  if (updates.email !== undefined)      patch.email        = updates.email;
  if (updates.phone !== undefined)      patch.phone        = updates.phone;
  if (updates.company !== undefined)    patch.company_name = updates.company;
  if (updates.status !== undefined)     patch.status       = updates.status;
  if (updates.source !== undefined)     patch.source       = updates.source;
  if (updates.priority !== undefined)   patch.priority     = updates.priority ?? null;
  if (updates.assignedTo !== undefined) patch.assigned_to  = updates.assignedTo || null;
  if (updates.tags !== undefined)       patch.tags         = updates.tags;
  if (updates.notes !== undefined)      patch.notes        = updates.notes;
  if (updates.jobTitle !== undefined)   patch.job_title    = updates.jobTitle;

  const { error } = await sb.from('crm_leads').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const sb = getClient();
  const patch: Partial<DbLead> = { status };
  if (status === 'Converted') patch.converted_at = new Date().toISOString();
  if (status === 'Contacted') patch.last_contacted_at = new Date().toISOString();

  const { error } = await sb.from('crm_leads').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteLead(id: string): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_leads').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function logActivity(
  leadId: string,
  type: Activity['type'],
  description: string,
  performedByName?: string
): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_lead_activities').insert({
    lead_id: leadId,
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

export async function addNote(
  leadId: string,
  body: string,
  authorName?: string
): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_lead_notes').insert({
    lead_id: leadId,
    body,
    author_name: authorName ?? null,
  });
  if (error) throw error;
}

export async function deleteNote(noteId: string): Promise<void> {
  const sb = getClient();
  const { error } = await sb.from('crm_lead_notes').delete().eq('id', noteId);
  if (error) throw error;
}
