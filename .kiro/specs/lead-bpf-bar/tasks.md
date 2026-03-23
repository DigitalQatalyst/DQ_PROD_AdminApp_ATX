# Implementation Plan: Lead BPF Bar

## Overview

Implement a fully-controlled `LeadProcessFlow` component that renders a horizontal Business Process Flow bar in the Lead Detail view. The component visualises pipeline stage progression, supports direct stage navigation by click, and provides a Next Stage button. It is wired into `LeadDetail.tsx` via an error boundary and uses only existing types and Tailwind brand colours.

## Tasks

- [ ] 1. Create LeadProcessFlow component
  - Create `src/modules/lead-management/components/LeadProcessFlow.tsx`
  - Define internal `STAGES` array in order: New → Contacted → Qualified → Proposal Sent → Converted → Lost
  - Define internal `TERMINAL_STAGES` set containing `Converted` and `Lost`
  - Implement `classifyStage(index, activeIndex)` pure function returning `'completed' | 'active' | 'upcoming'`
  - Render six stage `<button>` nodes with Tailwind classes per visual state table in design
  - Render five chevron connectors (`aria-hidden="true"`) between adjacent stage nodes
  - Render "Next Stage" button inside the active stage node when active stage is not terminal
  - Fire `onStatusChange(leadId, stage)` on stage click and on Next Stage click
  - Wrap bar in `overflow-x-auto` container for narrow viewport scrolling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.1 Write property test — Property 1: Stage order invariant
    - **Property 1: For any valid LeadStatus, stage labels render in fixed order: New, Contacted, Qualified, Proposal Sent, Converted, Lost**
    - **Validates: Requirements 1.2**

  - [ ]* 1.2 Write property test — Property 2: Connector count invariant
    - **Property 2: For any valid LeadStatus, exactly 5 connector elements are rendered**
    - **Validates: Requirements 1.3**

  - [ ]* 1.3 Write property test — Property 3: Stage classification partition
    - **Property 3: For any valid LeadStatus, exactly 1 active stage, indexOf(status) completed stages, and 5-indexOf(status) upcoming stages**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 1.4 Write property test — Property 4: Stage click fires correct callback
    - **Property 4: For any valid LeadStatus and any stage index, clicking that stage invokes onStatusChange with leadId and the correct LeadStatus**
    - **Validates: Requirements 3.1**

  - [ ]* 1.5 Write property test — Property 5: Next Stage button presence matches non-terminal status
    - **Property 5: Next Stage button is present iff currentStatus is not Converted or Lost**
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 1.6 Write property test — Property 6: Next Stage button advances to correct successor
    - **Property 6: For any non-terminal LeadStatus, clicking Next Stage invokes onStatusChange with leadId and the immediately following stage**
    - **Validates: Requirements 4.2**

  - [ ]* 1.7 Write unit tests for LeadProcessFlow
    - Renders without crashing for each of the six LeadStatus values
    - Active stage has expected CSS class; completed stages have expected CSS class; upcoming stages have expected CSS class
    - Next Stage button absent when currentStatus is Converted or Lost
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

- [ ] 2. Checkpoint — Ensure LeadProcessFlow tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Integrate LeadProcessFlow into LeadDetail
  - Add import for `LeadProcessFlow` in `LeadDetail.tsx`
  - Add a lightweight error boundary class component (or inline) wrapping `LeadProcessFlow` inside the scrollable body div
  - Insert `<LeadProcessFlow leadId={lead.id} currentStatus={lead.status} onStatusChange={onStatusChange} />` as the first child of the scrollable body div, above the existing content grid
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.1 Write unit tests for LeadDetail integration
    - Error boundary renders fallback when LeadProcessFlow throws
    - LeadDetail passes lead.id, lead.status, and onStatusChange to LeadProcessFlow
    - _Requirements: 6.2, 6.4_

- [ ] 4. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `numRuns: 100` per property
- Unit tests use Jest with `testEnvironment: 'node'` (existing project config)
- The component introduces no new state, no new types, and no new data-fetching
