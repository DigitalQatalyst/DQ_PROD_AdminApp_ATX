# Design Document — Opportunity Management

## Overview

The Opportunity Management module is a CRM feature that tracks qualified deals from lead conversion through to close. It mirrors the Lead Management module's architecture exactly: a Supabase service layer, a data hook (`useOpportunities`), a UI-state orchestrator hook (`useCRMOpportunity`), page components, shared UI components, and mock data. Opportunity-specific additions are deal value, currency, close date, win probability, and a six-stage pipeline (Qualification → Needs Analysis → Proposal → Negotiation → Closed Won → Closed Lost).

The module lives at `src/modules/opportunity-management/` and is registered in `AppRouter.tsx` at `/opportunity-management`.

## Architecture

```
AppRouter.tsx
  └─ /opportunity-management  →  OpportunityManagement (index.tsx)
       ├─ useCRMOpportunity (hooks/useCRMOpportunity.ts)
       │    └─ useOpportunities (hooks/useOpportunities.ts)
       │         └─ opportunityService (services/opportunityService.ts)
       │              └─ Supabase crm_opportunities / crm_opportunity_activities / crm_opportunity_notes
       │                   (fallback: data/mockData.ts)
       └─ Pages
            ├─ OpportunityDashboard
            ├─ OpportunityList
            ├─ OpportunityPipeline
            ├─ OpportunityDetail
            └─ OpportunityAnalytics
```

Data flow is unidirectional: pages call methods on `useCRMOpportunity`, which delegates mutations to `useOpportunities`, which calls `opportunityService`. Optimistic updates are applied to local React state immediately; on service error the hook calls `refetch()` to restore consistency.

## Components and Interfaces

### Module File Structure

```
src/modules/opportunity-management/
├── index.tsx                          # Module entry point, sidebar nav, view switcher
├── types.ts                           # All TypeScript types for the module
├── data/
│   └── mockData.ts                    # mockOpportunities array (8+ entries), teamMembers re-export
├── services/
│   └── opportunityService.ts          # All Supabase DB calls
├── hooks/
│   ├── useOpportunities.ts            # Data hook — CRUD + optimistic updates
│   └── useCRMOpportunity.ts           # UI orchestrator hook
├── components/
│   ├── OpportunityProcessFlow.tsx     # BPF bar with 6 stages + stage-specific field panels
│   ├── OpportunityCard.tsx            # Kanban card
│   ├── OpportunityStageBadge.tsx      # Coloured stage pill
│   ├── OpportunityPriorityBadge.tsx   # Coloured priority pill
│   ├── OpportunityValueDisplay.tsx    # Formatted currency value
│   ├── OpportunityActivityTimeline.tsx# Activity + notes timeline (reuse LeadActivityTimeline pattern)
│   ├── OpportunityKPICard.tsx         # KPI stat card (reuse LeadKPICard pattern)
│   ├── OpportunityTagManager.tsx      # Tag add/remove (reuse LeadTagManager pattern)
│   └── AddOpportunityModal.tsx        # Create opportunity form modal
└── pages/
    ├── OpportunityDashboard.tsx
    ├── OpportunityList.tsx
    ├── OpportunityPipeline.tsx
    ├── OpportunityDetail.tsx
    └── OpportunityAnalytics.tsx
```

### Component Interfaces

**OpportunityProcessFlow**
```typescript
interface OpportunityProcessFlowProps {
  opportunityId: string;
  currentStage: OpportunityStage;
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onStageChange: (id: string, stage: OpportunityStage) => void;
  onUpdate: (id: string, updates: Partial<Opportunity>) => void;
}
```
Mirrors `LeadProcessFlow` exactly. Six stage pills in order. Active stage has a coloured top border (cyan for open stages, green for Closed Won, red for Closed Lost). Clicking the active stage toggles a field panel below the bar. Clicking a different stage calls `onStageChange`. A "Next" button on the active stage advances to the next stage. Terminal stages (Closed Won, Closed Lost) have no Next button.

Stage-specific field panels:
- **Qualification**: Company Name, Contact Name, Contact Email, Contact Phone
- **Needs Analysis**: Assignee, Description, Tags
- **Proposal**: Deal Value, Currency, Probability, Close Date
- **Negotiation**: Deal Value (editable), Probability (editable), Close Date, Notes
- **Closed Won**: Won At (auto-set), Notes
- **Closed Lost**: Lost Reason (textarea), Notes

**OpportunityCard**
```typescript
interface OpportunityCardProps {
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  onClick: () => void;
  showMoveControls?: boolean;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
}
```
Displays: title (truncated), company name, deal value (via `OpportunityValueDisplay`), probability as a percentage badge, close date (formatted, red if past due), assignee avatar, stage badge, tags (first 2 + overflow count). Move controls (prev/next arrows) shown when `showMoveControls` is true.

**OpportunityStageBadge**
```typescript
interface OpportunityStageBadgeProps { stage: OpportunityStage; size?: 'sm' | 'md' }
```
Color map: Qualification=blue, Needs Analysis=purple, Proposal=yellow, Negotiation=orange, Closed Won=green, Closed Lost=red.

**OpportunityPriorityBadge**
```typescript
interface OpportunityPriorityBadgeProps { priority: OpportunityPriority }
```
Color map: High=red, Medium=yellow, Low=gray.

**OpportunityValueDisplay**
```typescript
interface OpportunityValueDisplayProps {
  value: number;
  currency?: string;
  compact?: boolean; // true → "$125k", false → "$125,000"
}
```

**AddOpportunityModal**
```typescript
interface AddOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Opportunity, 'id' | 'activities' | 'createdAt'>) => void;
  teamMembers: TeamMember[];
  prefill?: Partial<Opportunity>; // used when converting from a Lead
}
```
Form fields: Title (required), Company Name, Contact Name, Contact Email, Contact Phone, Stage (select, default Qualification), Deal Value (number), Currency (select: USD/AED/EUR/GBP), Probability (0–100 slider), Close Date (date picker), Assigned To (select from teamMembers), Description (textarea), Tags (tag input), Lead ID (hidden, set when converting from lead).

## Data Models

### TypeScript Types (`types.ts`)

```typescript
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

// Re-export ActivityType from lead module (same values used here)
export type { ActivityType, Activity } from '../lead-management/types';

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
  closeDateTo: string;        // ISO date or '' (note: requirements doc has typo "closeDataTo")
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

// ── Team member (re-exported from lead module or defined locally) ─────────────

export type { TeamMember } from '../lead-management/types';
```

### Supabase Migration (`supabase/migrations/20260401000000_crm_opportunity_management_schema.sql`)

```sql
-- =============================================================================
-- CRM Opportunity Management Schema
-- Migration: 20260401000000_crm_opportunity_management_schema.sql
--
-- Tables:
--   crm_opportunities            - Core opportunities table
--   crm_opportunity_activities   - Activity / history log (append-only)
--   crm_opportunity_notes        - Notes & comments
--
-- Conventions: mirrors crm_lead_management_schema.sql exactly.
-- Helper functions _crm_is_authenticated, _crm_org_id, _crm_is_manager,
-- _crm_is_admin already exist — reused here.
-- =============================================================================

SET check_function_bodies = false;

-- Safety: drop if exists from failed previous run
DROP TABLE IF EXISTS public.crm_opportunity_notes       CASCADE;
DROP TABLE IF EXISTS public.crm_opportunity_activities  CASCADE;
DROP TABLE IF EXISTS public.crm_opportunities           CASCADE;

-- ---------------------------------------------------------------------------
-- 1. crm_opportunities
-- ---------------------------------------------------------------------------

CREATE TABLE public.crm_opportunities (
    id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id  uuid        REFERENCES public.auth_organizations(id) ON DELETE SET NULL,
    title            text        NOT NULL,
    stage            text        NOT NULL DEFAULT 'Qualification',
    deal_value       numeric     DEFAULT 0,
    currency         text        DEFAULT 'USD',
    probability      integer     DEFAULT 0,
    close_date       date,
    lead_id          uuid        REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    firm_id          uuid        REFERENCES public.crm_firms(id) ON DELETE SET NULL,
    company_name     text,
    contact_name     text,
    contact_email    text,
    contact_phone    text,
    description      text,
    notes            text,
    assigned_to      uuid        REFERENCES public.auth_user_profiles(id) ON DELETE SET NULL,
    tags             text[]      DEFAULT '{}'::text[],
    lost_reason      text,
    won_at           timestamptz,
    lost_at          timestamptz,
    last_activity_at timestamptz,
    metadata         jsonb       DEFAULT '{}'::jsonb,
    created_at       timestamptz DEFAULT now() NOT NULL,
    updated_at       timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT crm_opportunities_stage_check CHECK (
        stage = ANY (ARRAY[
            'Qualification', 'Needs Analysis', 'Proposal',
            'Negotiation', 'Closed Won', 'Closed Lost'
        ])
    ),
    CONSTRAINT crm_opportunities_probability_check CHECK (
        probability >= 0 AND probability <= 100
    )
);

CREATE INDEX idx_crm_opp_organization_id ON public.crm_opportunities (organization_id);
CREATE INDEX idx_crm_opp_stage           ON public.crm_opportunities (stage);
CREATE INDEX idx_crm_opp_assigned_to     ON public.crm_opportunities (assigned_to);
CREATE INDEX idx_crm_opp_lead_id         ON public.crm_opportunities (lead_id);
CREATE INDEX idx_crm_opp_firm_id         ON public.crm_opportunities (firm_id);
CREATE INDEX idx_crm_opp_close_date      ON public.crm_opportunities (close_date);
CREATE INDEX idx_crm_opp_created_at      ON public.crm_opportunities (created_at DESC);
CREATE INDEX idx_crm_opp_org_stage_close ON public.crm_opportunities (organization_id, stage, close_date);

-- ---------------------------------------------------------------------------
-- 2. crm_opportunity_activities  (append-only)
-- ---------------------------------------------------------------------------

CREATE TABLE public.crm_opportunity_activities (
    id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id    uuid        NOT NULL REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
    activity_type     text        NOT NULL DEFAULT 'note',
    description       text        NOT NULL,
    performed_by      uuid        REFERENCES public.auth_user_profiles(id) ON DELETE SET NULL,
    performed_by_name text,
    metadata          jsonb       DEFAULT '{}'::jsonb,
    occurred_at       timestamptz DEFAULT now() NOT NULL,
    created_at        timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT crm_opp_activities_type_check CHECK (
        activity_type = ANY (ARRAY[
            'call', 'email', 'note', 'status_change',
            'meeting', 'task', 'assignment', 'tag_change'
        ])
    )
);

CREATE INDEX idx_crm_opp_act_opp_id ON public.crm_opportunity_activities (opportunity_id, occurred_at DESC);
CREATE INDEX idx_crm_opp_act_by     ON public.crm_opportunity_activities (performed_by);
CREATE INDEX idx_crm_opp_act_type   ON public.crm_opportunity_activities (activity_type);

-- ---------------------------------------------------------------------------
-- 3. crm_opportunity_notes
-- ---------------------------------------------------------------------------

CREATE TABLE public.crm_opportunity_notes (
    id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id  uuid        NOT NULL REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
    author_id       uuid        REFERENCES public.auth_user_profiles(id) ON DELETE SET NULL,
    author_name     text,
    body            text        NOT NULL,
    is_pinned       boolean     DEFAULT false NOT NULL,
    metadata        jsonb       DEFAULT '{}'::jsonb,
    created_at      timestamptz DEFAULT now() NOT NULL,
    updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_crm_opp_notes_opp_id ON public.crm_opportunity_notes (opportunity_id, created_at DESC);
CREATE INDEX idx_crm_opp_notes_author ON public.crm_opportunity_notes (author_id);
CREATE INDEX idx_crm_opp_notes_pinned ON public.crm_opportunity_notes (opportunity_id, is_pinned) WHERE is_pinned = true;

-- ---------------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_crm_opp_set_updated_at
    BEFORE UPDATE ON public.crm_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_crm_opp_notes_set_updated_at
    BEFORE UPDATE ON public.crm_opportunity_notes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY  (same policy pattern as crm_leads)
-- ---------------------------------------------------------------------------

ALTER TABLE public.crm_opportunities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunity_activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunity_notes       ENABLE ROW LEVEL SECURITY;

-- crm_opportunities
CREATE POLICY "crm_opp_select_authenticated"
    ON public.crm_opportunities FOR SELECT
    USING (
        public._crm_is_authenticated()
        AND (organization_id IS NULL OR organization_id = public._crm_org_id() OR auth.role() = 'service_role')
    );

CREATE POLICY "crm_opp_insert_authenticated"
    ON public.crm_opportunities FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_update_assigned_or_manager"
    ON public.crm_opportunities FOR UPDATE
    USING (
        auth.role() = 'service_role'
        OR (
            public._crm_is_authenticated()
            AND (organization_id IS NULL OR organization_id = public._crm_org_id())
            AND (
                public._crm_is_manager()
                OR assigned_to = (SELECT id FROM public.auth_user_profiles WHERE user_id = auth.uid() LIMIT 1)
            )
        )
    )
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_delete_admin"
    ON public.crm_opportunities FOR DELETE
    USING (
        auth.role() = 'service_role'
        OR (public._crm_is_authenticated() AND public._crm_is_admin()
            AND (organization_id IS NULL OR organization_id = public._crm_org_id()))
    );

-- crm_opportunity_activities
CREATE POLICY "crm_opp_act_select_authenticated"
    ON public.crm_opportunity_activities FOR SELECT
    USING (
        public._crm_is_authenticated()
        AND (auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM public.crm_opportunities o
            WHERE o.id = opportunity_id
              AND (o.organization_id IS NULL OR o.organization_id = public._crm_org_id())
        ))
    );

CREATE POLICY "crm_opp_act_insert_authenticated"
    ON public.crm_opportunity_activities FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_act_update_admin"
    ON public.crm_opportunity_activities FOR UPDATE
    USING (auth.role() = 'service_role' OR (public._crm_is_authenticated() AND public._crm_is_admin()))
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_act_delete_admin"
    ON public.crm_opportunity_activities FOR DELETE
    USING (auth.role() = 'service_role' OR (public._crm_is_authenticated() AND public._crm_is_admin()));

-- crm_opportunity_notes
CREATE POLICY "crm_opp_notes_select_authenticated"
    ON public.crm_opportunity_notes FOR SELECT
    USING (
        public._crm_is_authenticated()
        AND (auth.role() = 'service_role' OR EXISTS (
            SELECT 1 FROM public.crm_opportunities o
            WHERE o.id = opportunity_id
              AND (o.organization_id IS NULL OR o.organization_id = public._crm_org_id())
        ))
    );

CREATE POLICY "crm_opp_notes_insert_authenticated"
    ON public.crm_opportunity_notes FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_notes_update_author_or_manager"
    ON public.crm_opportunity_notes FOR UPDATE
    USING (
        auth.role() = 'service_role'
        OR (public._crm_is_authenticated() AND (
            public._crm_is_manager()
            OR author_id = (SELECT id FROM public.auth_user_profiles WHERE user_id = auth.uid() LIMIT 1)
        ))
    )
    WITH CHECK (auth.role() = 'service_role' OR public._crm_is_authenticated());

CREATE POLICY "crm_opp_notes_delete_author_or_admin"
    ON public.crm_opportunity_notes FOR DELETE
    USING (
        auth.role() = 'service_role'
        OR (public._crm_is_authenticated() AND (
            public._crm_is_admin()
            OR author_id = (SELECT id FROM public.auth_user_profiles WHERE user_id = auth.uid() LIMIT 1)
        ))
    );

-- ---------------------------------------------------------------------------
-- 6. GRANTS
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.crm_opportunities,
    public.crm_opportunity_activities,
    public.crm_opportunity_notes
TO authenticated, service_role;
```

### Service Layer (`services/opportunityService.ts`)

```typescript
// DbOpportunity — snake_case shape returned by Supabase
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

// DbOpportunityActivity — snake_case shape from crm_opportunity_activities
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

// DbOpportunityNote — snake_case shape from crm_opportunity_notes
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
```

**`dbOpportunityToOpportunity(row: DbOpportunity, activities: Activity[] = []): Opportunity`**
Maps all snake_case columns to camelCase Opportunity fields. `deal_value` → `dealValue`, `close_date` → `closeDate`, `assigned_to` → `assignedTo`, etc. Null DB values become `undefined` on optional fields.

**Exported functions:**

| Function | Signature | Implementation notes |
|---|---|---|
| `fetchOpportunities` | `() => Promise<Opportunity[]>` | `SELECT * FROM crm_opportunities ORDER BY created_at DESC`. Maps each row with `dbOpportunityToOpportunity`. |
| `fetchOpportunityById` | `(id: string) => Promise<Opportunity \| null>` | Parallel `Promise.all` for opportunity row, activities, and notes. Merges activities + notes into unified timeline sorted by timestamp DESC. Returns null if row not found. |
| `createOpportunity` | `(data: Omit<Opportunity, 'id' \| 'activities' \| 'createdAt'>) => Promise<Opportunity>` | INSERT with camelCase→snake_case mapping. Returns mapped row via `.select().single()`. |
| `updateOpportunity` | `(id: string, updates: Partial<Opportunity>) => Promise<void>` | Builds snake_case patch object from provided camelCase keys. Issues `UPDATE ... WHERE id = id`. |
| `updateOpportunityStage` | `(id: string, stage: OpportunityStage) => Promise<void>` | Updates `stage`. If `stage === 'Closed Won'` also sets `won_at = now()`. If `stage === 'Closed Lost'` also sets `lost_at = now()`. |
| `deleteOpportunity` | `(id: string) => Promise<void>` | `DELETE FROM crm_opportunities WHERE id = id`. |
| `logOpportunityActivity` | `(opportunityId: string, type: ActivityType, description: string, performedByName?: string) => Promise<void>` | INSERT into `crm_opportunity_activities`. Sets `occurred_at = now()`. |
| `addOpportunityNote` | `(opportunityId: string, body: string, authorName?: string) => Promise<void>` | INSERT into `crm_opportunity_notes`. |
| `deleteOpportunityNote` | `(noteId: string) => Promise<void>` | DELETE from `crm_opportunity_notes WHERE id = noteId`. |

Client resolution: same pattern as `leadService.ts` — `getServiceClient()` checks `VITE_USE_MOCK_AUTH` and uses service-role key if set, otherwise falls back to `getSupabaseClient()`. Throws descriptive error if no client available.

### Data Hook (`hooks/useOpportunities.ts`)

State shape:
```typescript
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
```

Initialisation: if `getSupabaseClient()` returns null, initialise `opportunities` from `mockOpportunities` and set `usingMock = true` without calling `refetch`. Otherwise start with `[]`, `loading = true`, call `refetch()` on mount.

Optimistic update pattern (identical to `useLeads`):
- **create**: prepend optimistic record with `id = 'tmp-' + Date.now()` to state, call service, on error call `refetch()`.
- **update**: `setOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))`, call service, on error call `refetch()`.
- **updateStage**: same as update but only patches `stage` (and `wonAt`/`lostAt` locally).
- **delete**: `setOpportunities(prev => prev.filter(o => o.id !== id))`, call service, on error call `refetch()`.
- **logActivity / addNote**: append to in-memory `activities` array on the matching opportunity immediately; call service if not using mock.

### UI Orchestrator Hook (`hooks/useCRMOpportunity.ts`)

State shape:
```typescript
// Internal state
activeView: OpportunityViewType          // default: 'dashboard'
selectedOpportunityId: string | null     // default: null
previousView: OpportunityViewType        // default: 'opportunities'
sidebarOpen: boolean                     // default: true
filters: OpportunityFilterState          // default: all 'All'/0/''
selectedOpportunityIds: string[]         // default: []
```

`filteredOpportunities` computation (useMemo):
```
opportunities
  .filter(o => filters.stage === 'All' || o.stage === filters.stage)
  .filter(o => filters.assignedTo === 'All' || o.assignedTo === filters.assignedTo)
  .filter(o => !filters.search || [o.title, o.companyName, o.contactName]
                  .some(f => f?.toLowerCase().includes(filters.search.toLowerCase())))
  .filter(o => !filters.closeDateFrom || o.closeDate >= filters.closeDateFrom)
  .filter(o => !filters.closeDateTo   || o.closeDate <= filters.closeDateTo)
  .filter(o => o.dealValue >= filters.dealValueMin)
  .filter(o => filters.dealValueMax === 0 || o.dealValue <= filters.dealValueMax)
```

Exposed methods:

| Method | Behaviour |
|---|---|
| `navigateToOpportunity(id, fromView)` | Sets `selectedOpportunityId = id`, `previousView = fromView`, `activeView = 'opportunity-detail'` |
| `navigateBack()` | Sets `activeView = previousView`, `selectedOpportunityId = null` |
| `updateOpportunityStage(id, stage)` | Calls `dbUpdateOpportunityStage(id, stage)` then `logActivity(id, 'status_change', 'Stage changed to ' + stage)` |
| `assignOpportunity(id, memberId)` | Calls `dbUpdateOpportunity(id, { assignedTo: memberId })` then `logActivity(id, 'assignment', 'Assigned to ' + memberName)` |
| `addOpportunity(data)` | Calls `dbCreateOpportunity(data)` |
| `updateOpportunity(id, updates)` | Calls `dbUpdateOpportunity(id, updates)` |
| `deleteOpportunity(id)` | Calls `dbDeleteOpportunity(id)`, navigates back if deleted opp was selected |
| `getOpportunitiesByStage(stage)` | Returns `opportunities.filter(o => o.stage === stage)` (useCallback) |
| `bulkUpdateStage(ids, stage)` | Calls `updateOpportunityStage` for each id, then `setSelectedOpportunityIds([])` |
| `bulkAssign(ids, memberId)` | Calls `assignOpportunity` for each id, then `setSelectedOpportunityIds([])` |
| `bulkDelete(ids)` | Calls `deleteOpportunity` for each id, then `setSelectedOpportunityIds([])` |
| `toggleOpportunitySelection(id)` | Adds/removes id from `selectedOpportunityIds` |
| `selectAllOpportunities(ids)` | Toggles all-selected / none-selected |

### Mock Data (`data/mockData.ts`)

`mockOpportunities` array — 10 entries covering all 6 stages:

| id | title | stage | dealValue | probability | closeDate | assignedTo |
|---|---|---|---|---|---|---|
| op1 | DCO Assessment — TechCorp UAE | Qualification | 8500 | 20 | 2025-09-30 | tm1 |
| op2 | AI Strategy Roadmap — Global Finance | Qualification | 45000 | 30 | 2025-10-15 | tm2 |
| op3 | DTMI Licensing — GovTech Saudi | Needs Analysis | 120000 | 45 | 2025-09-15 | tm1 |
| op4 | Digital Transformation — Emaar Group | Needs Analysis | 250000 | 50 | 2025-11-01 | tm4 |
| op5 | Cloud Migration — Mashreq Bank | Proposal | 75000 | 65 | 2025-08-31 | tm2 |
| op6 | Data Analytics Platform — ADNOC | Proposal | 180000 | 70 | 2025-09-01 | tm5 |
| op7 | AI Strategy — Etisalat | Negotiation | 95000 | 80 | 2025-08-15 | tm1 |
| op8 | DCO Assessment — Dubai Airports | Negotiation | 32000 | 85 | 2025-08-20 | tm3 |
| op9 | DTMI Licensing — Saudi Aramco | Closed Won | 310000 | 100 | 2025-07-01 | tm1 |
| op10 | Cloud Migration — Noon.com | Closed Lost | 55000 | 0 | 2025-06-30 | tm4 |

Each entry includes a `activities` array with 2–3 realistic activity entries. `wonAt` is set on op9, `lostAt` and `lostReason` are set on op10.

## Page Designs

### OpportunityDashboard

Layout: full-width page with a top row of 4 KPI cards, then a two-column chart row below.

**KPI Cards** (using `OpportunityKPICard`):
1. Total Open Opportunities — `openCount` — icon: Target
2. Total Pipeline Value — `totalPipelineValue` formatted as currency — icon: DollarSign
3. Weighted Pipeline — `weightedPipelineValue` formatted as currency — icon: TrendingUp
4. Win Rate — `winRate.toFixed(1) + '%'` — icon: Trophy

**Charts** (using Recharts, same library as `LeadDashboard`):
- Left (60% width): `BarChart` — X axis = stage name, two bars per stage: opportunity count (left bar, indigo) and total deal value in $k (right bar, cyan). Data source: `getOpportunitiesByStage(stage)` for each of the 6 stages.
- Right (40% width): `PieChart` — two segments: Closed Won count (green) and Closed Lost count (red). Shows "No closed opportunities" zero-state when both counts are 0.

Stats computation (pure functions, exported from a `utils/opportunityStats.ts` file):
```typescript
export function computeOpportunityStats(opportunities: Opportunity[]): OpportunityDashboardStats
```
- `openCount` = opportunities where stage not in ['Closed Won', 'Closed Lost']
- `closedWonCount` = opportunities where stage === 'Closed Won'
- `closedLostCount` = opportunities where stage === 'Closed Lost'
- `totalPipelineValue` = sum of `dealValue` for open opportunities
- `weightedPipelineValue` = sum of `dealValue * probability / 100` for open opportunities
- `avgDealSize` = `totalPipelineValue / openCount` (0 if openCount === 0)
- `winRate` = `closedWonCount / (closedWonCount + closedLostCount) * 100` (0 if denominator === 0)

### OpportunityList

Layout: filter bar at top, bulk action bar (shown when `selectedOpportunityIds.length > 0`), scrollable table below.

**Filter bar fields**: Search text input, Stage select, Assigned To select, Close Date From/To date inputs, Deal Value Min/Max number inputs. "Clear Filters" button resets all to defaults.

**Table columns**:
| Column | Source | Notes |
|---|---|---|
| Checkbox | selection | Drives bulk actions |
| Title | `opportunity.title` | Clickable → navigateToOpportunity |
| Company | `opportunity.companyName` | |
| Stage | `OpportunityStageBadge` | |
| Deal Value | `OpportunityValueDisplay` | Right-aligned |
| Probability | `probability + '%'` | Coloured: ≥70 green, ≥40 yellow, <40 red |
| Close Date | formatted date | Red text if past due |
| Assigned To | Avatar + name | |
| Tags | First 2 tags + overflow badge | |

**Bulk action bar**: appears above table when ≥1 row selected. Actions: "Update Stage" (dropdown), "Assign To" (dropdown), "Delete" (with confirm dialog). Shows count of selected items.

### OpportunityPipeline

Layout: horizontal scrollable kanban board. One column per stage in order: Qualification → Needs Analysis → Proposal → Negotiation → Closed Won → Closed Lost.

**Column header**: stage name (uppercase, small), opportunity count badge, total deal value for that stage (formatted compact, e.g. "$125k"). Color scheme mirrors `LeadPipeline` — Qualification=blue, Needs Analysis=purple, Proposal=yellow, Negotiation=orange, Closed Won=green, Closed Lost=red.

**Column body**: scrollable list of `OpportunityCard` components. Empty state: dashed border placeholder "No opportunities".

**Move controls**: each card has prev/next arrow buttons (same as `LeadCard`). Clicking calls `updateOpportunityStage`. No drag-and-drop in v1 (noted as future enhancement).

**Column width**: `w-80` (320px), same as `LeadPipeline`.

### OpportunityDetail

Layout: two-column (left 2/3, right 1/3), with `OpportunityProcessFlow` bar spanning full width at the top.

**Top**: Back button, opportunity title (h1), `OpportunityStageBadge`, `OpportunityPriorityBadge` (if set), mock data indicator banner (if `usingMock`).

**Process flow bar**: `OpportunityProcessFlow` component spanning full width below the header.

**Left column**:
- Deal info card: Deal Value (inline editable), Currency (select), Probability (slider 0–100), Close Date (date picker)
- Company & contact card: Company Name, Contact Name, Contact Email, Contact Phone (all inline editable)
- Description card: textarea (inline editable)
- Tags card: `OpportunityTagManager`
- Source lead link: "View Source Lead →" link shown when `opportunity.leadId` is set

**Right column**:
- Assignee card: avatar, name, "Reassign" button
- Activity timeline: `OpportunityActivityTimeline` — reverse chronological list of all activities and notes. Note input at top of timeline (textarea + submit button).
- Notes section: pinned notes shown first

**Inline editing pattern**: fields show a pencil icon on hover; clicking switches to an input/select; blur or Enter saves via `updateOpportunity`.

### OpportunityAnalytics

Layout: full-width page with metric cards row at top, then two chart rows.

**Metric cards** (4 cards):
1. Avg Deal Size — `avgDealSize` formatted as currency
2. Win Rate — `winRate.toFixed(1) + '%'`
3. Avg Sales Cycle — computed from closed opportunities (days from `createdAt` to `wonAt ?? lostAt`)
4. Total Closed Value — sum of `dealValue` for Closed Won opportunities

**Chart row 1**:
- Left: `BarChart` — pipeline value by stage (open stages only). X=stage, Y=total deal value.
- Right: `PieChart` — win/loss by count. Zero-state message when no closed opportunities.

**Chart row 2**:
- Full width: `BarChart` — monthly close forecast. X=month (next 6 months), Y=sum of `dealValue` for opportunities with `closeDate` in that month. Groups by Closed Won (actual) vs open (forecast).

**Avg sales cycle computation**:
```typescript
export function computeAvgSalesCycleDays(opportunities: Opportunity[]): number {
  const closed = opportunities.filter(o =>
    o.createdAt && (o.wonAt || o.lostAt)
  );
  if (closed.length === 0) return 0;
  const totalDays = closed.reduce((sum, o) => {
    const end = new Date(o.wonAt ?? o.lostAt!).getTime();
    const start = new Date(o.createdAt).getTime();
    return sum + (end - start) / (1000 * 60 * 60 * 24);
  }, 0);
  return Math.round(totalDays / closed.length);
}
```

### Module Entry Point (`index.tsx`)

Sidebar nav items:
```typescript
const navItems: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: <LayoutDashboard /> },
  { id: 'opportunities', label: 'All Deals',      icon: <Briefcase /> },
  { id: 'pipeline',      label: 'Pipeline',       icon: <GitBranch /> },
  { id: 'analytics',     label: 'Analytics',      icon: <BarChart2 /> },
];
```

View switcher (`renderView`):
- `loading` → loading spinner
- `activeView === 'opportunity-detail' && selectedOpportunity` → `<OpportunityDetail />`
- `'dashboard'` → `<OpportunityDashboard />`
- `'opportunities'` → `<OpportunityList />`
- `'pipeline'` → `<OpportunityPipeline />`
- `'analytics'` → `<OpportunityAnalytics />`

Active nav highlight: when `activeView === 'opportunity-detail'`, highlight `previousView` nav item (same pattern as lead module).

"Add Opportunity" button in sidebar header opens `<AddOpportunityModal />`.

### Routing (`AppRouter.tsx` change)

Add the following route after the `/lead-management` route:

```tsx
import OpportunityManagementModule from "./modules/opportunity-management";

<Route
  path="/opportunity-management"
  element={
    <ProtectedRoute
      requiredRoles={["admin", "approver", "editor", "viewer"]}
      requiredSegments={["internal", "partner"]}
    >
      <AppShell>
        <OpportunityManagementModule />
      </AppShell>
    </ProtectedRoute>
  }
/>
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Field constraint validation

*For any* string value passed as an opportunity stage, only values in `['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']` should be accepted; all other strings should be rejected. Similarly, *for any* integer passed as probability, only values in the range [0, 100] should be accepted.

**Validates: Requirements 2.4, 2.5**

### Property 2: CRUD round-trip

*For any* valid opportunity data object, creating an opportunity and then fetching it by id should return an opportunity whose fields match the created data. Updating a field and then fetching should reflect the update. Deleting and then fetching should return null.

**Validates: Requirements 3.1, 3.3, 3.4, 3.6**

### Property 3: Activity timeline sort order

*For any* opportunity with a non-empty set of activities and notes, the merged timeline returned by `fetchOpportunityById` should be sorted in descending order by timestamp (most recent first).

**Validates: Requirements 3.2, 10.4**

### Property 4: Stage transition sets timestamps

*For any* opportunity, calling `updateOpportunityStage` with `'Closed Won'` should result in `won_at` being set to a non-null timestamp, and `lost_at` remaining null. Calling it with `'Closed Lost'` should result in `lost_at` being set and `won_at` remaining null. Calling it with any open stage should leave both `won_at` and `lost_at` unchanged.

**Validates: Requirements 3.5**

### Property 5: DbOpportunity mapper correctness

*For any* `DbOpportunity` row, `dbOpportunityToOpportunity(row)` should produce an `Opportunity` where every camelCase field corresponds exactly to its snake_case source column: `deal_value` → `dealValue`, `close_date` → `closeDate`, `assigned_to` → `assignedTo`, `company_name` → `companyName`, `contact_name` → `contactName`, `contact_email` → `contactEmail`, `contact_phone` → `contactPhone`, `lost_reason` → `lostReason`, `won_at` → `wonAt`, `lost_at` → `lostAt`.

**Validates: Requirements 3.9**

### Property 6: Optimistic update correctness

*For any* opportunity in local state, after calling `createOpportunity`, `updateOpportunity`, `updateOpportunityStage`, or `deleteOpportunity`, the local `opportunities` array should immediately reflect the change before the service call resolves. Specifically: create prepends the new item, update patches the matching item, delete removes the matching item.

**Validates: Requirements 4.3, 4.4, 4.5, 4.6**

### Property 7: Filter composition correctness

*For any* `OpportunityFilterState` and any array of opportunities, `filteredOpportunities` should contain exactly those opportunities that satisfy ALL active filter criteria simultaneously. An opportunity must pass every non-default filter to appear in the result. No opportunity that fails any single active filter criterion should appear in the result.

**Validates: Requirements 5.3, 8.2, 8.3**

### Property 8: Stage/assignment activity logging

*For any* opportunity, calling `updateOpportunityStage(id, stage)` should result in a `status_change` activity being logged with a description containing the new stage name. Calling `assignOpportunity(id, memberId)` should result in an `assignment` activity being logged with a description containing the assignee's name.

**Validates: Requirements 5.5, 5.6**

### Property 9: Bulk operations clear selection

*For any* non-empty `selectedOpportunityIds` array, after calling `bulkUpdateStage`, `bulkAssign`, or `bulkDelete`, `selectedOpportunityIds` should be empty.

**Validates: Requirements 5.7, 8.5**

### Property 10: getOpportunitiesByStage correctness

*For any* `OpportunityStage` value, `getOpportunitiesByStage(stage)` should return exactly those opportunities whose `stage` field equals the given stage — no more, no less.

**Validates: Requirements 5.8, 9.1**

### Property 11: Win rate calculation correctness

*For any* array of opportunities, `computeOpportunityStats(opportunities).winRate` should equal `closedWonCount / (closedWonCount + closedLostCount) * 100` when at least one closed opportunity exists, and exactly `0` when no closed opportunities exist (i.e., `closedWonCount + closedLostCount === 0`).

**Validates: Requirements 7.4, 11.2 (edge case)**

### Property 12: Weighted pipeline value computation

*For any* array of opportunities, `computeOpportunityStats(opportunities).weightedPipelineValue` should equal the sum of `dealValue * probability / 100` for all opportunities where `stage` is not `'Closed Won'` and not `'Closed Lost'`. Closed opportunities must not contribute to the weighted pipeline.

**Validates: Requirements 7.5, 9.3**

### Property 13: Average sales cycle computation

*For any* array of opportunities, `computeAvgSalesCycleDays(opportunities)` should equal the arithmetic mean of `(wonAt ?? lostAt) - createdAt` in days, computed only over opportunities where both `createdAt` and at least one of `wonAt` or `lostAt` are present. Opportunities missing either timestamp must be excluded. Returns `0` when no qualifying opportunities exist.

**Validates: Requirements 11.3**

### Property 14: Lead-to-opportunity field pre-population

*For any* `Lead` record, constructing an opportunity from it should produce an opportunity where `title` contains the lead's company or name, `companyName === lead.company`, `contactName === lead.name`, `contactEmail === lead.email`, `contactPhone === lead.phone`, `assignedTo === lead.assignedTo`, and `leadId === lead.id`.

**Validates: Requirements 12.3**

## Error Handling

**Service layer errors**: All service functions throw on Supabase error. `useOpportunities` catches these in a try/catch, logs to console, sets `error` state, and falls back to `mockOpportunities` (setting `usingMock = true`). On mutation failure, `refetch()` is called to restore consistent state.

**Optimistic update rollback**: If a service mutation throws after an optimistic state update, `refetch()` is called to pull the true server state, effectively reverting the optimistic change.

**Stage constraint violations**: The `updateOpportunityStage` function validates the stage value against the `OpportunityStage` union before calling Supabase. Invalid values throw a descriptive `Error('Invalid stage: ...')` before any network call.

**Probability out of range**: `createOpportunity` and `updateOpportunity` clamp `probability` to [0, 100] before sending to Supabase: `Math.max(0, Math.min(100, probability))`.

**Missing required fields**: `createOpportunity` throws `Error('title is required')` if `data.title` is empty or whitespace-only.

**No closed opportunities (win rate)**: `computeOpportunityStats` returns `winRate: 0` when `closedWonCount + closedLostCount === 0`. The `OpportunityAnalytics` page renders a "No closed opportunities yet" zero-state message in the win/loss chart area instead of an empty or broken chart.

**Lead ID not found**: When `opportunity.leadId` is set but the lead no longer exists (deleted with `ON DELETE SET NULL`), the "View Source Lead" link is not rendered (the `leadId` field will be `null` after the DB cascade).

**Mock data indicator**: When `usingMock === true`, a yellow banner is rendered at the top of the module: "Using mock data — Supabase unavailable". This is consistent with the lead management module pattern.

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests verify specific examples, integration points, and edge cases.
- Property tests verify universal correctness across many generated inputs.

### Property-Based Testing

**Library**: `fast-check` (already used in the project — see `tests/lead-bpf-bar/`).

**Configuration**: Each property test runs a minimum of 100 iterations (`fc.assert(fc.property(...), { numRuns: 100 })`).

**Tag format**: Each property test file includes a comment at the top:
```
// Feature: opportunity-management, Property N: <property_text>
```

**Property test files** (one file per property or logical group):

| File | Properties covered |
|---|---|
| `tests/opportunity-management/prop.fieldConstraints.test.ts` | P1 |
| `tests/opportunity-management/prop.crudRoundTrip.test.ts` | P2 |
| `tests/opportunity-management/prop.timelineSort.test.ts` | P3 |
| `tests/opportunity-management/prop.stageTransition.test.ts` | P4 |
| `tests/opportunity-management/prop.mapper.test.ts` | P5 |
| `tests/opportunity-management/prop.optimisticUpdate.test.ts` | P6 |
| `tests/opportunity-management/prop.filterComposition.test.ts` | P7 |
| `tests/opportunity-management/prop.activityLogging.test.ts` | P8 |
| `tests/opportunity-management/prop.bulkOps.test.ts` | P9 |
| `tests/opportunity-management/prop.getByStage.test.ts` | P10 |
| `tests/opportunity-management/prop.winRate.test.ts` | P11 |
| `tests/opportunity-management/prop.weightedPipeline.test.ts` | P12 |
| `tests/opportunity-management/prop.salesCycle.test.ts` | P13 |
| `tests/opportunity-management/prop.leadConversion.test.ts` | P14 |

**Generators**: Each test file defines `fc.record(...)` arbitraries for `Opportunity`, `OpportunityStage`, `OpportunityFilterState`, etc. The stage arbitrary uses `fc.constantFrom(...STAGES)` to generate only valid stage values. The probability arbitrary uses `fc.integer({ min: 0, max: 100 })`.

### Unit Tests

Unit tests focus on:
- Specific examples: creating an opportunity with known data and asserting exact field values.
- Edge cases: empty `opportunities` array for stats computation, `probability = 0`, `probability = 100`, `dealValue = 0`.
- Integration: `useCRMOpportunity` hook rendering with React Testing Library — verify `filteredOpportunities` updates when `setFilters` is called.
- Mock data: verify `mockOpportunities` contains at least one entry for each of the 6 stages (example test for Requirement 6.1).
- Zero-state: `computeOpportunityStats([])` returns all zeros.

**Unit test files**:
- `tests/opportunity-management/unit.stats.test.ts` — `computeOpportunityStats`, `computeAvgSalesCycleDays`
- `tests/opportunity-management/unit.mockData.test.ts` — all 6 stages represented
- `tests/opportunity-management/unit.service.test.ts` — mapper, stage validation, probability clamping
- `tests/opportunity-management/unit.hooks.test.ts` — hook integration with React Testing Library
