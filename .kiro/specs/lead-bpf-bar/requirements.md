# Requirements Document

## Introduction

This feature adds a Business Process Flow (BPF) bar to the Lead Detail view in the lead management module, modelled after the Dynamics 365 BPF bar. The bar renders as a horizontal stage indicator at the top of the Lead Detail view, above all existing lead content. It visualises the lead's progression through the sales pipeline, allows users to jump to any stage by clicking it, and provides a Next Stage button to advance the lead forward. All stage transitions are routed through the existing `useCRM` hook — the component is fully controlled and introduces no new state or types.

## Glossary

- **BPF_Bar**: The Business Process Flow bar component (`LeadProcessFlow`) rendered at the top of the Lead Detail view.
- **Stage**: A single step in the lead pipeline, corresponding to one value of the `LeadStatus` type.
- **Active_Stage**: The stage whose label matches the lead's current `LeadStatus` value.
- **Completed_Stage**: Any stage that precedes the Active_Stage in the ordered stage sequence.
- **Upcoming_Stage**: Any stage that follows the Active_Stage in the ordered stage sequence.
- **Terminal_Stage**: A stage from which no forward progression is possible (`Converted` or `Lost`).
- **LeadStatus**: The existing union type defined in `types.ts`: `'New' | 'Qualified' | 'Contacted' | 'Proposal Sent' | 'Converted' | 'Lost'`.
- **LeadProcessFlow**: The new React component created at `src/modules/lead-management/components/LeadProcessFlow.tsx`.
- **onStatusChange**: The callback prop `(leadId: string, status: LeadStatus) => void` passed to `LeadProcessFlow`, sourced from `useCRM.updateLeadStatus`.

---

## Requirements

### Requirement 1: BPF Bar Layout and Placement

**User Story:** As a sales representative, I want to see the lead's pipeline stage at a glance when I open a lead, so that I can immediately understand where the lead stands without scrolling.

#### Acceptance Criteria

1. THE `LeadProcessFlow` SHALL render as a full-width horizontal bar positioned above all other content in the Lead Detail view.
2. THE `LeadProcessFlow` SHALL display all six pipeline stages in the following fixed order: `New` → `Contacted` → `Qualified` → `Proposal Sent` → `Converted` → `Lost`.
3. THE `LeadProcessFlow` SHALL display a visible connector line or chevron between each adjacent pair of stages.
4. THE `LeadProcessFlow` SHALL be styled exclusively with Tailwind CSS utility classes — no additional CSS libraries or inline style objects SHALL be introduced.
5. THE `LeadProcessFlow` SHALL use only brand colours already defined in `tailwind.config.js` (e.g. `primary`, `secondary`, `accent`, `muted`, `indigo-*`, `orange-*`, `gray-*`).

---

### Requirement 2: Stage Visual States

**User Story:** As a sales representative, I want completed, active, and upcoming stages to look visually different, so that I can instantly identify where the lead is in the pipeline.

#### Acceptance Criteria

1. WHEN the `LeadProcessFlow` receives a `currentStatus` prop, THE `LeadProcessFlow` SHALL apply a visually distinct "active" style (e.g. filled background, bold label) to the stage whose value matches `currentStatus`.
2. WHEN the `LeadProcessFlow` receives a `currentStatus` prop, THE `LeadProcessFlow` SHALL apply a "completed" style (e.g. muted filled background, check indicator) to every stage that precedes the Active_Stage in the ordered sequence.
3. WHEN the `LeadProcessFlow` receives a `currentStatus` prop, THE `LeadProcessFlow` SHALL apply an "upcoming" style (e.g. outlined or greyed-out) to every stage that follows the Active_Stage in the ordered sequence.
4. FOR ALL valid `LeadStatus` values passed as `currentStatus`, THE `LeadProcessFlow` SHALL render exactly one Active_Stage, zero or more Completed_Stages, and zero or more Upcoming_Stages such that the total count equals six.

---

### Requirement 3: Stage Navigation by Click

**User Story:** As a sales representative, I want to click any stage to move the lead to that stage, so that I can quickly update the pipeline status without using a separate dropdown.

#### Acceptance Criteria

1. WHEN a user clicks a stage node in the `LeadProcessFlow`, THE `LeadProcessFlow` SHALL invoke the `onStatusChange` callback with the `leadId` and the `LeadStatus` value that corresponds to the clicked stage.
2. THE `LeadProcessFlow` SHALL NOT maintain internal state for the lead's status — all status changes SHALL be communicated exclusively via the `onStatusChange` callback.
3. WHEN the `onStatusChange` callback is invoked, THE `LeadProcessFlow` SHALL reflect the updated status on the next render driven by the updated `currentStatus` prop.

---

### Requirement 4: Next Stage Button

**User Story:** As a sales representative, I want a Next Stage button on the active stage, so that I can advance the lead forward with a single click without having to identify the next stage manually.

#### Acceptance Criteria

1. WHEN the Active_Stage is not a Terminal_Stage, THE `LeadProcessFlow` SHALL render a "Next Stage" button associated with the Active_Stage.
2. WHEN a user clicks the "Next Stage" button, THE `LeadProcessFlow` SHALL invoke `onStatusChange` with the `leadId` and the `LeadStatus` value immediately following the Active_Stage in the ordered sequence.
3. WHEN the Active_Stage is a Terminal_Stage (`Converted` or `Lost`), THE `LeadProcessFlow` SHALL NOT render the "Next Stage" button.

---

### Requirement 5: Controlled Component Contract

**User Story:** As a developer integrating the BPF bar, I want the component to be fully controlled via props, so that the lead status remains the single source of truth in the `useCRM` hook.

#### Acceptance Criteria

1. THE `LeadProcessFlow` SHALL accept a `currentStatus` prop of type `LeadStatus` (imported from `../types`) and a `leadId` prop of type `string`.
2. THE `LeadProcessFlow` SHALL accept an `onStatusChange` prop of type `(leadId: string, status: LeadStatus) => void`.
3. THE `LeadProcessFlow` SHALL NOT declare any React state that holds or shadows the lead's `LeadStatus`.
4. THE `LeadProcessFlow` SHALL use the `LeadStatus` type imported from the existing `types.ts` file — no new type aliases or enums for pipeline stages SHALL be introduced.

---

### Requirement 6: Integration into Lead Detail View

**User Story:** As a developer, I want the BPF bar wired into `LeadDetail.tsx`, so that it is visible whenever a lead detail view is opened.

#### Acceptance Criteria

1. WHEN the Lead Detail view renders, THE `LeadDetail` SHALL render the `LeadProcessFlow` component as the first child element inside the scrollable body area, above all other lead content sections.
2. THE `LeadDetail` SHALL pass `lead.id` as `leadId`, `lead.status` as `currentStatus`, and `onStatusChange` as the `onStatusChange` prop to `LeadProcessFlow`.
3. THE `LeadDetail` SHALL source the `onStatusChange` handler from the `useCRM` hook's `updateLeadStatus` function — no new state or handlers SHALL be introduced in `LeadDetail` for this purpose.
4. IF the `LeadProcessFlow` component throws a render error, THEN THE `LeadDetail` SHALL continue to render the rest of the lead detail content unaffected (error boundary or graceful fallback is recommended).
