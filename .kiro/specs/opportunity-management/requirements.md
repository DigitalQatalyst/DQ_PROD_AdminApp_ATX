# Requirements Document

## Introduction

The Opportunity Management module is a CRM feature that tracks qualified deals from lead conversion through to close. An Opportunity is created when a Lead reaches `Converted` status and represents an active sales engagement with a defined financial value, pipeline stage, expected close date, and probability of winning. The module mirrors the Lead Management module's architecture (hooks, services, mock data, Supabase tables) and adds Opportunity-specific concepts: deal value, currency, close date, win probability, and a dedicated pipeline with stages from Qualification through Closed Won / Closed Lost.

## Glossary

- **Opportunity**: A qualified sales deal actively being worked, created from a converted Lead.
- **Opportunity_Module**: The full opportunity management feature including all views, hooks, and services.
- **Opportunity_Service**: The Supabase data access layer for opportunities (`opportunityService.ts`).
- **useOpportunities**: The data-layer React hook managing Opportunity CRUD and optimistic updates.
- **useCRMOpportunity**: The UI-state orchestrator hook wrapping `useOpportunities`.
- **Pipeline_Stage**: One of the ordered stages an Opportunity moves through: `Qualification`, `Needs Analysis`, `Proposal`, `Negotiation`, `Closed Won`, `Closed Lost`.
- **Deal_Value**: The numeric monetary value of an Opportunity in a specified currency.
- **Win_Rate**: The percentage of Opportunities that reached `Closed Won` out of all closed Opportunities.
- **Weighted_Pipeline**: The sum of each open Opportunity's `deal_value × probability / 100`.
- **Lead**: An existing CRM entity in `crm_leads`; the originating record for an Opportunity.
- **Firm**: An existing CRM entity in `crm_firms`; the company associated with an Opportunity.
- **Activity**: An append-only log entry recording an action taken on an Opportunity.
- **Note**: A freeform comment attached to an Opportunity.
- **RLS**: Row Level Security — Supabase policy controlling data access per authenticated user.
- **Mock_Data**: Static in-memory data used when Supabase is unavailable.

---

## Requirements

### Requirement 1: Opportunity Data Model

**User Story:** As a CRM developer, I want a well-defined Opportunity TypeScript type, so that all module code shares a consistent, type-safe data contract.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL define an `Opportunity` interface in `types.ts` with the following required fields: `id` (string), `title` (string), `stage` (Pipeline_Stage), `dealValue` (number), `currency` (string), `probability` (number 0–100), `closeDate` (string ISO date), `assignedTo` (string), `tags` (string array), `createdAt` (string), `activities` (Activity array).
2. THE Opportunity_Module SHALL define the following optional fields on `Opportunity`: `leadId` (string), `firmId` (string), `companyName` (string), `contactName` (string), `contactEmail` (string), `contactPhone` (string), `description` (string), `notes` (string), `lostReason` (string), `wonAt` (string), `lostAt` (string), `lastActivityAt` (string).
3. THE Opportunity_Module SHALL define `OpportunityStage` as a TypeScript union string type: `'Qualification' | 'Needs Analysis' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'`.
4. THE Opportunity_Module SHALL define `OpportunityPriority` as a TypeScript union string type: `'High' | 'Medium' | 'Low'`.
5. THE Opportunity_Module SHALL define `OpportunityViewType` as a TypeScript union string type covering: `'dashboard' | 'opportunities' | 'pipeline' | 'opportunity-detail' | 'analytics'`.
6. THE Opportunity_Module SHALL define an `OpportunityFilterState` interface with fields: `stage`, `assignedTo`, `search`, `closeDateFrom`, `closeDataTo`, `dealValueMin`, `dealValueMax`.
7. THE Opportunity_Module SHALL define an `OpportunityDashboardStats` interface with fields: `totalOpportunities`, `totalPipelineValue`, `weightedPipelineValue`, `avgDealSize`, `winRate`, `openCount`, `closedWonCount`, `closedLostCount`.

---

### Requirement 2: Supabase Database Schema

**User Story:** As a CRM developer, I want a Supabase schema for opportunities that mirrors the lead management conventions, so that data is stored consistently and securely.

#### Acceptance Criteria

1. THE Opportunity_Service SHALL use a `crm_opportunities` table with columns: `id` (UUID PK), `organization_id` (UUID FK → `auth_organizations`), `title` (text NOT NULL), `stage` (text NOT NULL DEFAULT `'Qualification'`), `deal_value` (numeric DEFAULT 0), `currency` (text DEFAULT `'USD'`), `probability` (integer 0–100 DEFAULT 0), `close_date` (date), `lead_id` (UUID FK → `crm_leads` ON DELETE SET NULL), `firm_id` (UUID FK → `crm_firms` ON DELETE SET NULL), `company_name` (text), `contact_name` (text), `contact_email` (text), `contact_phone` (text), `description` (text), `notes` (text), `assigned_to` (UUID FK → `auth_user_profiles` ON DELETE SET NULL), `tags` (text[] DEFAULT `{}`), `lost_reason` (text), `won_at` (timestamptz), `lost_at` (timestamptz), `last_activity_at` (timestamptz), `metadata` (jsonb DEFAULT `{}`), `created_at` (timestamptz DEFAULT now()), `updated_at` (timestamptz DEFAULT now()).
2. THE Opportunity_Service SHALL use a `crm_opportunity_activities` table mirroring `crm_lead_activities` with `opportunity_id` FK replacing `lead_id`.
3. THE Opportunity_Service SHALL use a `crm_opportunity_notes` table mirroring `crm_lead_notes` with `opportunity_id` FK replacing `lead_id`.
4. THE Opportunity_Service SHALL enforce a CHECK constraint on `stage` limiting values to: `'Qualification'`, `'Needs Analysis'`, `'Proposal'`, `'Negotiation'`, `'Closed Won'`, `'Closed Lost'`.
5. THE Opportunity_Service SHALL enforce a CHECK constraint on `probability` limiting values to the range 0–100.
6. THE Opportunity_Service SHALL enable RLS on `crm_opportunities`, `crm_opportunity_activities`, and `crm_opportunity_notes` following the same policy pattern as `crm_leads`.
7. THE Opportunity_Service SHALL create a `set_updated_at` trigger on `crm_opportunities` and `crm_opportunity_notes` reusing `public.set_updated_at()`.
8. THE Opportunity_Service SHALL create performance indexes on `crm_opportunities` for: `organization_id`, `stage`, `assigned_to`, `lead_id`, `firm_id`, `close_date`, `created_at DESC`, and a composite `(organization_id, stage, close_date)`.

---

### Requirement 3: Data Service Layer

**User Story:** As a CRM developer, I want a typed service file for Opportunity Supabase operations, so that all DB access is centralised and consistent with the lead service pattern.

#### Acceptance Criteria

1. THE Opportunity_Service SHALL export a `fetchOpportunities()` function that queries `crm_opportunities` ordered by `created_at DESC` and returns `Opportunity[]`.
2. THE Opportunity_Service SHALL export a `fetchOpportunityById(id)` function that fetches the opportunity row, its activities, and its notes in parallel, merges them into a unified activity timeline sorted by timestamp descending, and returns `Opportunity | null`.
3. THE Opportunity_Service SHALL export a `createOpportunity(data)` function that inserts a new row into `crm_opportunities` and returns the created `Opportunity`.
4. THE Opportunity_Service SHALL export an `updateOpportunity(id, updates)` function that maps `Opportunity` partial fields to snake_case DB columns and issues a Supabase `update`.
5. THE Opportunity_Service SHALL export an `updateOpportunityStage(id, stage)` function that updates the `stage` column and sets `won_at` when stage is `'Closed Won'`, sets `lost_at` when stage is `'Closed Lost'`.
6. THE Opportunity_Service SHALL export a `deleteOpportunity(id)` function that deletes the row from `crm_opportunities`.
7. THE Opportunity_Service SHALL export a `logOpportunityActivity(opportunityId, type, description, performedByName?)` function that inserts into `crm_opportunity_activities`.
8. THE Opportunity_Service SHALL export `addOpportunityNote(opportunityId, body, authorName?)` and `deleteOpportunityNote(noteId)` functions.
9. THE Opportunity_Service SHALL define a `DbOpportunity` interface (snake_case) and a `dbOpportunityToOpportunity(row, activities?)` mapper function.
10. IF the Supabase client is unavailable, THEN THE Opportunity_Service SHALL throw a descriptive error that `useOpportunities` catches and falls back to Mock_Data.

---

### Requirement 4: Data Hook — useOpportunities

**User Story:** As a CRM developer, I want a `useOpportunities` React hook that manages Opportunity data with optimistic updates, so that the UI remains responsive while Supabase operations complete.

#### Acceptance Criteria

1. THE useOpportunities hook SHALL expose: `opportunities` (Opportunity[]), `loading` (boolean), `error` (string | null), `usingMock` (boolean).
2. THE useOpportunities hook SHALL load opportunities on mount by calling `fetchOpportunities()` and fall back to Mock_Data when the service throws.
3. WHEN `createOpportunity` is called, THE useOpportunities hook SHALL optimistically prepend the new opportunity to local state, call the service, and call `refetch()` on error to restore consistent state.
4. WHEN `updateOpportunity` is called, THE useOpportunities hook SHALL optimistically apply the update to local state, call the service, and call `refetch()` on error.
5. WHEN `updateOpportunityStage` is called, THE useOpportunities hook SHALL optimistically update the stage in local state, call the service, and call `refetch()` on error.
6. WHEN `deleteOpportunity` is called, THE useOpportunities hook SHALL optimistically remove the opportunity from local state, call the service, and call `refetch()` on error.
7. THE useOpportunities hook SHALL expose `logActivity` and `addNote` functions that call the corresponding service functions.

---

### Requirement 5: UI State Hook — useCRMOpportunity

**User Story:** As a CRM developer, I want a `useCRMOpportunity` orchestrator hook that wraps `useOpportunities` with UI state, so that views have a single source of truth for navigation, filtering, and selection.

#### Acceptance Criteria

1. THE useCRMOpportunity hook SHALL wrap `useOpportunities` and expose all its data and loading state.
2. THE useCRMOpportunity hook SHALL manage `activeView` (OpportunityViewType), `selectedOpportunityId` (string | null), `previousView`, `sidebarOpen`, `filters` (OpportunityFilterState), and `selectedOpportunityIds` (string[]).
3. THE useCRMOpportunity hook SHALL expose `filteredOpportunities` computed from `opportunities` filtered by `filters.stage`, `filters.assignedTo`, `filters.search`, `filters.closeDateFrom`, `filters.closeDataTo`, `filters.dealValueMin`, `filters.dealValueMax`.
4. THE useCRMOpportunity hook SHALL expose `navigateToOpportunity(id, fromView)` and `navigateBack()` functions that update `activeView` and `selectedOpportunityId`.
5. THE useCRMOpportunity hook SHALL expose `updateOpportunityStage(id, stage)` that calls the data hook and logs a `status_change` activity.
6. THE useCRMOpportunity hook SHALL expose `assignOpportunity(id, memberId)` that calls `updateOpportunity` and logs an `assignment` activity.
7. THE useCRMOpportunity hook SHALL expose bulk operations: `bulkUpdateStage`, `bulkAssign`, `bulkDelete` — each clearing `selectedOpportunityIds` on completion.
8. THE useCRMOpportunity hook SHALL expose `getOpportunitiesByStage(stage)` returning filtered opportunities for Kanban use.

---

### Requirement 6: Mock Data

**User Story:** As a CRM developer, I want realistic mock opportunity data, so that the module renders correctly when Supabase is unavailable during development.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL provide a `mockOpportunities` array in `data/mockData.ts` containing at least 8 Opportunity objects spread across all 6 pipeline stages.
2. THE Opportunity_Module SHALL include mock opportunities with varied `dealValue` (ranging from small deals under $10,000 to enterprise deals over $100,000), `probability` values, and `closeDate` values spanning past and future dates.
3. WHEN `usingMock` is true, THE Opportunity_Module SHALL display a visible indicator in the UI informing the user that mock data is active.

---

### Requirement 7: Dashboard View

**User Story:** As a sales manager, I want a dashboard with KPI cards and charts for my opportunity pipeline, so that I can assess pipeline health at a glance.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL render a Dashboard view displaying four KPI cards: total open opportunities count, total pipeline value (sum of all open deal values), weighted pipeline value, and win rate percentage.
2. WHEN the Dashboard view is active, THE Opportunity_Module SHALL display a bar or column chart showing opportunity count and total value grouped by Pipeline_Stage.
3. WHEN the Dashboard view is active, THE Opportunity_Module SHALL display a chart showing win/loss ratio for closed opportunities.
4. THE Opportunity_Module SHALL compute `winRate` as `closedWonCount / (closedWonCount + closedLostCount) × 100`, returning 0 when no closed opportunities exist.
5. THE Opportunity_Module SHALL compute `weightedPipelineValue` as the sum of `dealValue × probability / 100` for all open (non-closed) opportunities.

---

### Requirement 8: All Opportunities List View

**User Story:** As a sales associate, I want a filterable table of all opportunities, so that I can find and manage specific deals quickly.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL render an Opportunities list view displaying a table with columns: title, company, stage, deal value, probability, close date, assigned to, and tags.
2. WHEN a filter is applied, THE Opportunity_Module SHALL update the displayed list to show only opportunities matching all active filter criteria simultaneously.
3. THE Opportunity_Module SHALL support filtering by: stage, assigned user, search text (matching title, company name, contact name), close date range, and deal value range.
4. WHEN a row is clicked, THE Opportunity_Module SHALL navigate to the Opportunity Detail view for that opportunity.
5. THE Opportunity_Module SHALL support multi-select with bulk actions: bulk stage update, bulk assign, bulk delete.

---

### Requirement 9: Pipeline Kanban View

**User Story:** As a sales associate, I want a Kanban board grouped by pipeline stage, so that I can visually manage deal progression.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL render a Pipeline view as a Kanban board with one column per Pipeline_Stage in the order: Qualification → Needs Analysis → Proposal → Negotiation → Closed Won → Closed Lost.
2. WHEN an opportunity card is dragged from one column to another, THE Opportunity_Module SHALL call `updateOpportunityStage` with the new stage and log a `status_change` activity.
3. THE Opportunity_Module SHALL display on each Kanban column header: the stage name, opportunity count, and total deal value for that stage.
4. WHEN a Kanban card is clicked, THE Opportunity_Module SHALL navigate to the Opportunity Detail view.

---

### Requirement 10: Opportunity Detail View

**User Story:** As a sales associate, I want a full detail view for an opportunity, so that I can review all information, update fields, and track activity history.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL render an Opportunity Detail view displaying: title, stage (as a process flow bar), deal value, currency, probability, close date, assigned user, company, contact info, description, tags, and notes.
2. THE Opportunity_Module SHALL render a process flow bar showing all Pipeline_Stage values with the current stage highlighted, mirroring the LeadProcessFlow component pattern.
3. WHEN a stage in the process flow bar is clicked, THE Opportunity_Module SHALL call `updateOpportunityStage` with the selected stage.
4. THE Opportunity_Module SHALL render an activity timeline showing all activities and notes for the opportunity in reverse chronological order.
5. WHEN a note is submitted in the detail view, THE Opportunity_Module SHALL call `addNote` and prepend the note to the activity timeline.
6. THE Opportunity_Module SHALL allow inline editing of `dealValue`, `probability`, `closeDate`, `assignedTo`, `description`, and `tags` from the detail view.

---

### Requirement 11: Analytics View

**User Story:** As a sales manager, I want an analytics view with win/loss analysis and pipeline forecasting, so that I can make data-driven decisions.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL render an Analytics view with: win/loss breakdown by count and value, pipeline value by stage, average deal size, average sales cycle length (days from `createdAt` to `wonAt` or `lostAt`), and a monthly close forecast chart.
2. WHEN no closed opportunities exist, THE Opportunity_Module SHALL display a zero-state message in the win/loss section rather than rendering an empty or broken chart.
3. THE Opportunity_Module SHALL compute average sales cycle length only from opportunities where both `createdAt` and (`wonAt` or `lostAt`) are present.

---

### Requirement 12: Lead-to-Opportunity Conversion Link

**User Story:** As a sales associate, I want opportunities to link back to their originating lead, so that I can trace the full customer journey.

#### Acceptance Criteria

1. WHEN an Opportunity has a `leadId`, THE Opportunity_Module SHALL display a "View Source Lead" link in the Opportunity Detail view.
2. THE Opportunity_Service SHALL store `lead_id` as a nullable FK to `crm_leads` with `ON DELETE SET NULL`, so that deleting a lead does not delete its associated opportunities.
3. WHEN creating an Opportunity from a converted Lead, THE Opportunity_Module SHALL pre-populate `title`, `companyName`, `contactName`, `contactEmail`, `contactPhone`, and `assignedTo` from the Lead record.

---

### Requirement 13: Module Entry Point and Routing

**User Story:** As a developer, I want the Opportunity module registered in the app router, so that it is accessible at a dedicated route.

#### Acceptance Criteria

1. THE Opportunity_Module SHALL export a default `OpportunityManagement` page component from `src/modules/opportunity-management/index.tsx`.
2. THE Opportunity_Module SHALL be registered in `AppRouter.tsx` at the path `/opportunity-management` wrapped in the `AppShell` component, following the same pattern as the lead management route.
3. THE Opportunity_Module SHALL render the correct view component based on `activeView` from `useCRMOpportunity`.
