import type { Activity } from '../lead-management/types';

// ── Re-exports from lead module ───────────────────────────────────────────────

export type { ActivityType, Activity } from '../lead-management/types';
export type { TeamMember } from '../lead-management/types';

// ── Enums / union types ──────────────────────────────────────────────────────

export type OpportunityStage =
  | 'Qualification'
  | 'Needs Analysis'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export type OpportunityPriority = 'High' | 'Medium' | 'Low';

export type OpportunityViewType =
  | 'dashboard'
  | 'opportunities'
  | 'pipeline'
  | 'opportunity-detail'
  | 'analytics';

// ── Core entity ──────────────────────────────────────────────────────────────

export interface Opportunity {
  // Required fields
  id: string;
  title: string;
  stage: OpportunityStage;
  dealValue: number;
  currency: string;           // ISO 4217, e.g. 'USD', 'AED'
  probability: number;        // 0–100
  closeDate: string;          // ISO date string YYYY-MM-DD
  assignedTo: string;         // auth_user_profiles.id
  tags: string[];
  createdAt: string;          // ISO timestamptz
  activities: Activity[];

  // Optional fields
  leadId?: string;            // crm_leads.id — source lead
  firmId?: string;            // crm_firms.id
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  notes?: string;
  priority?: OpportunityPriority;
  lostReason?: string;
  wonAt?: string;             // ISO timestamptz — set when stage → Closed Won
  lostAt?: string;            // ISO timestamptz — set when stage → Closed Lost
  lastActivityAt?: string;    // ISO timestamptz
}

// ── Filter state ─────────────────────────────────────────────────────────────

export interface OpportunityFilterState {
  stage: OpportunityStage | 'All';
  assignedTo: string;         // 'All' or team member id
  search: string;             // matches title, companyName, contactName
  closeDateFrom: string;      // ISO date or ''
  closeDateTo: string;        // ISO date or ''
  dealValueMin: number;
  dealValueMax: number;
}

// ── Dashboard stats ──────────────────────────────────────────────────────────

export interface OpportunityDashboardStats {
  totalOpportunities: number;
  totalPipelineValue: number;     // sum of dealValue for all open opportunities
  weightedPipelineValue: number;  // sum of dealValue * probability / 100 for open opps
  avgDealSize: number;
  winRate: number;                // closedWonCount / (closedWonCount + closedLostCount) * 100
  openCount: number;
  closedWonCount: number;
  closedLostCount: number;
}
