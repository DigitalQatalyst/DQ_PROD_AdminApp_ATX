# Implementation Plan: Opportunity Management

## Overview

Implement the Opportunity Management CRM module following the lead-management architecture pattern. Tasks proceed from the database layer upward through service, hooks, components, pages, and routing — each step building on the previous.

## Tasks

- [x] 1. Create Supabase migration file
  - Create `supabase/migrations/20260401000000_crm_opportunity_management_schema.sql`
  - Define `crm_opportunities` table with all columns per design (id, organization_id, title, stage, deal_value, currency, probability, close_date, lead_id, firm_id, company_name, contact_name, contact_email, contact_phone, description, notes, assigned_to, tags, lost_reason, won_at, lost_at, last_activity_at, metadata, created_at, updated_at)
  - Add CHECK constraint on `stage` limiting to the 6 valid values
  - Add CHECK constraint on `probability` for range 0–100
  - Define `crm_opportunity_activities` table with `opportunity_id` FK
  - Define `crm_opportunity_notes` table with `opportunity_id` FK
  - Add all performance indexes (organization_id, stage, assigned_to, lead_id, firm_id, close_date, created_at DESC, composite org+stage+close_date)
  - Add `set_updated_at` triggers on `crm_opportunities` and `crm_opportunity_notes`
  - Enable RLS and add all policies (select/insert/update/delete) mirroring crm_leads pattern
  - Add GRANT statements for authenticated and service_role
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 2. Define TypeScript types
  - Create `src/modules/opportunity-management/types.ts`
  - Define `OpportunityStage` union type with all 6 stages
  - Define `OpportunityPriority` union type
  - Define `OpportunityViewType` union type
  - Define `Opportunity` interface with all required and optional fields per design
  - Define `OpportunityFilterState` interface
  - Define `OpportunityDashboardStats` interface
  - Re-export `ActivityType`, `Activity`, and `TeamMember` from `../lead-management/types`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 3. Create mock data
  - Create `src/modules/opportunity-management/data/mockData.ts`
  - Define `mockOpportunities` array with 10 entries covering all 6 pipeline stages
  - Include varied deal values (small <$10k to enterprise >$100k), probabilities, and close dates spanning past and future
  - Set `wonAt` on the Closed Won entry and `lostAt` + `lostReason` on the Closed Lost entry
  - Include 2–3 realistic activity entries per opportunity
  - _Requirements: 6.1, 6.2_

  - [ ]* 3.1 Write unit test for mock data coverage
    - Verify `mockOpportunities` contains at least one entry for each of the 6 stages
    - Verify deal value range spans <$10k and >$100k entries
    - _Requirements: 6.1, 6.2_

- [x] 4. Implement stats utility
  - Create `src/modules/opportunity-management/utils/opportunityStats.ts`
  - Implement `computeOpportunityStats(opportunities: Opportunity[]): OpportunityDashboardStats`
    - `openCount`: opportunities not in ['Closed Won', 'Closed Lost']
    - `closedWonCount` / `closedLostCount`: filter by stage
    - `totalPipelineValue`: sum of `dealValue` for open opportunities
    - `weightedPipelineValue`: sum of `dealValue * probability / 100` for open opportunities
    - `avgDealSize`: `totalPipelineValue / openCount` (0 if openCount === 0)
    - `winRate`: `closedWonCount / (closedWonCount + closedLostCount) * 100` (0 if denominator === 0)
  - Implement `computeAvgSalesCycleDays(opportunities: Opportunity[]): number`
    - Filter to opportunities with both `createdAt` and (`wonAt` or `lostAt`)
    - Return arithmetic mean of days; return 0 if no qualifying opportunities
  - _Requirements: 7.4, 7.5, 11.1, 11.3_

  - [ ]* 4.1 Write unit tests for stats utility
    - Test `computeOpportunityStats([])` returns all zeros
    - Test `winRate` with only won, only lost, and mixed closed opportunities
    - Test `weightedPipelineValue` excludes closed opportunities
    - Test `computeAvgSalesCycleDays` with no qualifying opportunities returns 0
    - _Requirements: 7.4, 7.5, 11.2, 11.3_

  - [ ]* 4.2 Write property test for win rate calculation (Property 11)
    - **Property 11: Win rate calculation correctness**
    - **Validates: Requirements 7.4, 11.2**

  - [ ]* 4.3 Write property test for weighted pipeline value (Property 12)
    - **Property 12: Weighted pipeline value computation**
    - **Validates: Requirements 7.5, 9.3**

  - [ ]* 4.4 Write property test for average sales cycle (Property 13)
    - **Property 13: Average sales cycle computation**
    - **Validates: Requirements 11.3**

- [x] 5. Implement service layer
  - Create `src/modules/opportunity-management/services/opportunityService.ts`
  - Define `DbOpportunity`, `DbOpportunityActivity`, `DbOpportunityNote` interfaces (snake_case)
  - Implement `dbOpportunityToOpportunity(row, activities?)` mapper (all camelCase field mappings)
  - Implement `getServiceClient()` using same pattern as `leadService.ts` (VITE_USE_MOCK_AUTH check)
  - Implement `fetchOpportunities()` — SELECT ordered by created_at DESC
  - Implement `fetchOpportunityById(id)` — parallel Promise.all for row + activities + notes, merge and sort timeline DESC
  - Implement `createOpportunity(data)` — INSERT with camelCase→snake_case mapping, return mapped row
  - Implement `updateOpportunity(id, updates)` — build snake_case patch from provided camelCase keys
  - Implement `updateOpportunityStage(id, stage)` — update stage, set won_at if Closed Won, set lost_at if Closed Lost
  - Implement `deleteOpportunity(id)` — DELETE by id
  - Implement `logOpportunityActivity(opportunityId, type, description, performedByName?)` — INSERT into crm_opportunity_activities
  - Implement `addOpportunityNote(opportunityId, body, authorName?)` — INSERT into crm_opportunity_notes
  - Implement `deleteOpportunityNote(noteId)` — DELETE from crm_opportunity_notes
  - Throw descriptive error when no Supabase client available
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 5.1 Write unit tests for service layer
    - Test `dbOpportunityToOpportunity` mapper with known input/output
    - Test stage validation in `updateOpportunityStage` rejects invalid values
    - Test probability clamping in `createOpportunity` and `updateOpportunity`
    - Test `createOpportunity` throws when title is empty/whitespace
    - _Requirements: 3.9, 3.10_

  - [ ]* 5.2 Write property test for DbOpportunity mapper (Property 5)
    - **Property 5: DbOpportunity mapper correctness**
    - **Validates: Requirements 3.9**

  - [ ]* 5.3 Write property test for field constraint validation (Property 1)
    - **Property 1: Field constraint validation**
    - **Validates: Requirements 2.4, 2.5**

  - [ ]* 5.4 Write property test for stage transition timestamps (Property 4)
    - **Property 4: Stage transition sets timestamps**
    - **Validates: Requirements 3.5**

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement useOpportunities data hook
  - Create `src/modules/opportunity-management/hooks/useOpportunities.ts`
  - Mirror `useLeads.ts` structure exactly
  - Initialise from `mockOpportunities` when `getSupabaseClient()` returns null; set `usingMock = true`
  - Implement `refetch()` — calls `fetchOpportunities()`, falls back to mock on error
  - Implement `createOpportunity` with optimistic prepend (tmp id), call service, refetch on error
  - Implement `updateOpportunity` with optimistic map-patch, call service, refetch on error
  - Implement `updateOpportunityStage` with optimistic stage patch (including wonAt/lostAt locally), call service, refetch on error
  - Implement `deleteOpportunity` with optimistic filter-remove, call service, refetch on error
  - Implement `logActivity` — append to in-memory activities immediately, call service if not mock
  - Implement `addNote` — append to in-memory activities immediately, call service if not mock
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 7.1 Write property test for optimistic update correctness (Property 6)
    - **Property 6: Optimistic update correctness**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6**

  - [ ]* 7.2 Write property test for CRUD round-trip (Property 2)
    - **Property 2: CRUD round-trip**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.6**

  - [ ]* 7.3 Write property test for activity timeline sort order (Property 3)
    - **Property 3: Activity timeline sort order**
    - **Validates: Requirements 3.2, 10.4**

- [x] 8. Implement useCRMOpportunity orchestrator hook
  - Create `src/modules/opportunity-management/hooks/useCRMOpportunity.ts`
  - Wrap `useOpportunities` and expose all its data/loading state
  - Manage `activeView`, `selectedOpportunityId`, `previousView`, `sidebarOpen`, `filters`, `selectedOpportunityIds`
  - Implement `filteredOpportunities` useMemo with all 7 filter criteria (stage, assignedTo, search, closeDateFrom, closeDateTo, dealValueMin, dealValueMax)
  - Implement `navigateToOpportunity(id, fromView)` and `navigateBack()`
  - Implement `updateOpportunityStage(id, stage)` — calls data hook + logs status_change activity
  - Implement `assignOpportunity(id, memberId)` — calls updateOpportunity + logs assignment activity
  - Implement `addOpportunity(data)`, `updateOpportunity(id, updates)`, `deleteOpportunity(id)` (navigates back if deleted opp was selected)
  - Implement `getOpportunitiesByStage(stage)` as useCallback
  - Implement `bulkUpdateStage(ids, stage)`, `bulkAssign(ids, memberId)`, `bulkDelete(ids)` — each clears `selectedOpportunityIds`
  - Implement `toggleOpportunitySelection(id)` and `selectAllOpportunities(ids)`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 8.1 Write property test for filter composition correctness (Property 7)
    - **Property 7: Filter composition correctness**
    - **Validates: Requirements 5.3, 8.2, 8.3**

  - [ ]* 8.2 Write property test for stage/assignment activity logging (Property 8)
    - **Property 8: Stage/assignment activity logging**
    - **Validates: Requirements 5.5, 5.6**

  - [ ]* 8.3 Write property test for bulk operations clear selection (Property 9)
    - **Property 9: Bulk operations clear selection**
    - **Validates: Requirements 5.7, 8.5**

  - [ ]* 8.4 Write property test for getOpportunitiesByStage correctness (Property 10)
    - **Property 10: getOpportunitiesByStage correctness**
    - **Validates: Requirements 5.8, 9.1**

  - [ ]* 8.5 Write unit tests for useCRMOpportunity hook
    - Test `filteredOpportunities` updates when `setFilters` is called (React Testing Library)
    - Test `navigateToOpportunity` sets activeView to 'opportunity-detail'
    - Test `navigateBack` restores previousView
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement shared UI components
  - [x] 10.1 Create OpportunityStageBadge component
    - Create `src/modules/opportunity-management/components/OpportunityStageBadge.tsx`
    - Color map: Qualification=blue, Needs Analysis=purple, Proposal=yellow, Negotiation=orange, Closed Won=green, Closed Lost=red
    - Support `size` prop ('sm' | 'md')
    - _Requirements: 9.1, 10.1_

  - [x] 10.2 Create OpportunityPriorityBadge component
    - Create `src/modules/opportunity-management/components/OpportunityPriorityBadge.tsx`
    - Color map: High=red, Medium=yellow, Low=gray
    - _Requirements: 10.1_

  - [x] 10.3 Create OpportunityValueDisplay component
    - Create `src/modules/opportunity-management/components/OpportunityValueDisplay.tsx`
    - Compact mode: "$125k"; full mode: "$125,000"
    - Accept `value`, `currency`, `compact` props
    - _Requirements: 8.1, 10.1_

  - [x] 10.4 Create OpportunityCard component
    - Create `src/modules/opportunity-management/components/OpportunityCard.tsx`
    - Display: title (truncated), company name, deal value (OpportunityValueDisplay), probability badge, close date (red if past due), assignee avatar, stage badge, first 2 tags + overflow count
    - Support `showMoveControls`, `onMovePrev`, `onMoveNext` props for pipeline prev/next arrows
    - _Requirements: 9.1, 9.4_

  - [x] 10.5 Create OpportunityProcessFlow component
    - Create `src/modules/opportunity-management/components/OpportunityProcessFlow.tsx`
    - Mirror `LeadProcessFlow` pattern with 6 stages
    - Active stage: coloured top border (cyan for open, green for Closed Won, red for Closed Lost)
    - Clicking active stage toggles stage-specific field panel below bar
    - Clicking different stage calls `onStageChange`
    - "Next" button advances to next stage; terminal stages (Closed Won, Closed Lost) have no Next button
    - Stage-specific field panels per design (Qualification, Needs Analysis, Proposal, Negotiation, Closed Won, Closed Lost)
    - _Requirements: 10.2, 10.3_

  - [x] 10.6 Create OpportunityActivityTimeline component
    - Create `src/modules/opportunity-management/components/OpportunityActivityTimeline.tsx`
    - Render reverse-chronological list of activities and notes
    - Note input (textarea + submit button) at top
    - Mirror `LeadActivityTimeline` pattern
    - _Requirements: 10.4, 10.5_

  - [x] 10.7 Create OpportunityKPICard component
    - Create `src/modules/opportunity-management/components/OpportunityKPICard.tsx`
    - Mirror `LeadKPICard` pattern
    - Accept `title`, `value`, `icon`, `trend` props
    - _Requirements: 7.1_

  - [x] 10.8 Create OpportunityTagManager component
    - Create `src/modules/opportunity-management/components/OpportunityTagManager.tsx`
    - Mirror `LeadTagManager` pattern — add/remove tags inline
    - _Requirements: 10.1, 10.6_

  - [x] 10.9 Create AddOpportunityModal component
    - Create `src/modules/opportunity-management/components/AddOpportunityModal.tsx`
    - Form fields: Title (required), Company Name, Contact Name, Contact Email, Contact Phone, Stage (select, default Qualification), Deal Value (number), Currency (select: USD/AED/EUR/GBP), Probability (0–100 slider), Close Date (date picker), Assigned To (select from teamMembers), Description (textarea), Tags (tag input), Lead ID (hidden)
    - Support `prefill` prop for lead-to-opportunity conversion
    - _Requirements: 12.3, 13.1_

- [x] 11. Implement pages
  - [x] 11.1 Create OpportunityDashboard page
    - Create `src/modules/opportunity-management/pages/OpportunityDashboard.tsx`
    - Render 4 KPI cards using `OpportunityKPICard` (Total Open, Total Pipeline Value, Weighted Pipeline, Win Rate)
    - Render BarChart (stage × count + value) using Recharts — same library as LeadDashboard
    - Render PieChart (Closed Won vs Closed Lost) with zero-state "No closed opportunities" message
    - Use `computeOpportunityStats` for all metrics
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.2 Create OpportunityList page
    - Create `src/modules/opportunity-management/pages/OpportunityList.tsx`
    - Render filter bar: search input, stage select, assigned to select, close date from/to, deal value min/max, "Clear Filters" button
    - Render bulk action bar (shown when selectedOpportunityIds.length > 0) with Update Stage, Assign To, Delete actions
    - Render table with columns: checkbox, title (clickable), company, stage badge, deal value, probability (coloured), close date (red if past due), assigned to, tags
    - Wire row click to `navigateToOpportunity`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.3 Create OpportunityPipeline page
    - Create `src/modules/opportunity-management/pages/OpportunityPipeline.tsx`
    - Render horizontal scrollable Kanban board with 6 columns in stage order
    - Column header: stage name, opportunity count badge, total deal value (compact format)
    - Column body: scrollable list of `OpportunityCard` with move controls; empty state dashed placeholder
    - Column color scheme: Qualification=blue, Needs Analysis=purple, Proposal=yellow, Negotiation=orange, Closed Won=green, Closed Lost=red
    - Wire card click to `navigateToOpportunity`; wire move controls to `updateOpportunityStage`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 11.4 Create OpportunityDetail page
    - Create `src/modules/opportunity-management/pages/OpportunityDetail.tsx`
    - Render header: back button, title, OpportunityStageBadge, OpportunityPriorityBadge, mock data banner
    - Render `OpportunityProcessFlow` spanning full width
    - Render two-column layout (left 2/3, right 1/3)
    - Left: deal info card (inline editable: dealValue, currency, probability, closeDate), company/contact card (inline editable), description card, tags card, "View Source Lead" link when leadId is set
    - Right: assignee card with Reassign button, `OpportunityActivityTimeline`, pinned notes
    - Inline editing: pencil icon on hover, input on click, save on blur/Enter via `updateOpportunity`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1_

  - [x] 11.5 Create OpportunityAnalytics page
    - Create `src/modules/opportunity-management/pages/OpportunityAnalytics.tsx`
    - Render 4 metric cards: Avg Deal Size, Win Rate, Avg Sales Cycle (days), Total Closed Value
    - Render BarChart: pipeline value by stage (open stages only)
    - Render PieChart: win/loss by count with zero-state message when no closed opportunities
    - Render full-width BarChart: monthly close forecast (next 6 months, Closed Won actual vs open forecast)
    - Use `computeOpportunityStats` and `computeAvgSalesCycleDays`
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 12. Implement module entry point
  - Create `src/modules/opportunity-management/index.tsx`
  - Define sidebar nav items: Dashboard, All Deals (Briefcase icon), Pipeline, Analytics
  - Implement collapsible sidebar (same pattern as lead-management index.tsx)
  - Implement `renderView()` switch: loading spinner, opportunity-detail, dashboard, opportunities, pipeline, analytics
  - Highlight `previousView` nav item when `activeView === 'opportunity-detail'`
  - Render "Add Opportunity" button in sidebar header opening `AddOpportunityModal`
  - Show mock data banner when `usingMock === true`
  - Export default `OpportunityManagement` component
  - _Requirements: 6.3, 13.1, 13.2, 13.3_

- [x] 13. Register route in AppRouter.tsx
  - Import `OpportunityManagementModule` from `./modules/opportunity-management`
  - Add `/opportunity-management` route after the `/lead-management` route
  - Wrap in `ProtectedRoute` with `requiredRoles={["admin", "approver", "editor", "viewer"]}` and `requiredSegments={["internal", "partner"]}`
  - Wrap in `AppShell` component (same pattern as lead-management route)
  - _Requirements: 13.2_

- [ ] 14. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

  - [ ]* 14.1 Write property test for lead-to-opportunity field pre-population (Property 14)
    - **Property 14: Lead-to-opportunity field pre-population**
    - **Validates: Requirements 12.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (already in the project — see `tests/lead-bpf-bar/`)
- Each property test file should include the tag comment: `// Feature: opportunity-management, Property N: <property_text>`
- Unit tests live in `tests/opportunity-management/unit.*.test.ts`; property tests in `tests/opportunity-management/prop.*.test.ts`
- All components mirror their lead-management counterparts — refer to `src/modules/lead-management/` for patterns
