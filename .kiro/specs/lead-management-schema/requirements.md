# Requirements Document

## Introduction

This feature defines the complete Supabase (PostgreSQL) schema for the lead management module. The schema covers lead capture, classification, firm/company association, user assignment, activity history, and notes. It must integrate with the existing multi-tenant `auth_organizations` / `auth_user_profiles` / `auth_users` tables, follow all established naming and structural conventions in this codebase, and be delivered as a single idempotent SQL migration file.

The existing draft migration (`20260325000000_crm_lead_management_schema.sql`) contains several correctness issues that this spec resolves:
- `public.current_user_id()` does not exist in the `public` schema — replaced with `auth.uid()`
- `_crm_is_manager()` / `_crm_is_admin()` rely on `current_setting('app.user_role')` which is unreliable — replaced with a live lookup against `auth_organization_members.roles`
- `_crm_org_id()` reads only JWT claims with no fallback — augmented with a `auth_user_profiles.organization_id` fallback
- `v_crm_leads` joins `auth_users` for `au.name` which is valid (confirmed `auth_users` has a `name` column), but the join chain is simplified

---

## Glossary

- **Migration**: A single idempotent SQL file applied by Supabase CLI to evolve the database schema.
- **CRM_Schema**: The set of tables, functions, triggers, indexes, RLS policies, and views that constitute the lead management module.
- **crm_firms**: Table storing companies/organisations associated with leads.
- **crm_leads**: Core table storing individual lead records.
- **crm_lead_activities**: Append-only audit/history log of actions taken on a lead.
- **crm_lead_notes**: Free-text notes and comments attached to a lead.
- **v_crm_leads**: Convenience view joining leads with firm and assignee display data.
- **Lead_Source**: The channel through which a lead was acquired (e.g. Website Form, Referral, Social Media).
- **Lead_Status**: The current pipeline stage of a lead (New → Contacted → Qualified → Proposal Sent → Converted / Lost).
- **Activity_Type**: The category of an activity log entry (call, email, note, status_change, meeting, task, assignment, tag_change).
- **RLS**: Row Level Security — PostgreSQL policy mechanism enforcing per-row access control.
- **Multi-tenant**: Each row is scoped to an `organization_id` matching `public.auth_organizations(id)`.
- **_crm_org_id()**: Helper function returning the current user's organisation UUID.
- **_crm_is_manager()**: Helper function returning true when the current user holds the `admin` or `approver` role.
- **_crm_is_admin()**: Helper function returning true when the current user holds the `admin` role.
- **service_role**: Supabase privileged role that bypasses RLS.

---

## Requirements

### Requirement 1: Table Conventions

**User Story:** As a backend engineer, I want all CRM tables to follow the project's established conventions, so that the schema is consistent and maintainable alongside existing tables.

#### Acceptance Criteria

1. THE CRM_Schema SHALL place all objects in the `public` schema.
2. THE CRM_Schema SHALL use `snake_case` for all table and column names.
3. THE CRM_Schema SHALL use `gen_random_uuid()` as the default for all UUID primary keys.
4. THE CRM_Schema SHALL include `created_at timestamptz DEFAULT now() NOT NULL` and `updated_at timestamptz DEFAULT now() NOT NULL` on every mutable table.
5. THE CRM_Schema SHALL include a `metadata jsonb DEFAULT '{}'::jsonb` column on every table for flexible extension fields.
6. THE CRM_Schema SHALL use `text` columns with `CHECK` constraints for enum-like fields rather than PostgreSQL `ENUM` types.
7. THE CRM_Schema SHALL use `ON DELETE SET NULL` for foreign keys referencing `auth_organizations` and `auth_user_profiles`.
8. THE CRM_Schema SHALL use `ON DELETE CASCADE` for foreign keys from child tables (`crm_lead_activities`, `crm_lead_notes`) to `crm_leads`.
9. THE CRM_Schema SHALL prefix all table names with `crm_`.
10. THE CRM_Schema SHALL reuse the existing `public.set_updated_at()` trigger function for all `updated_at` triggers.
11. THE CRM_Schema SHALL reuse the existing `public._is_authenticated()` function as the base authentication check.

---

### Requirement 2: crm_firms Table

**User Story:** As a sales associate, I want to associate leads with companies, so that I can track relationships at the firm level.

#### Acceptance Criteria

1. THE crm_firms table SHALL store a `name text NOT NULL` column for the company name.
2. THE crm_firms table SHALL store an `organization_id uuid` foreign key referencing `public.auth_organizations(id)` for multi-tenant scoping.
3. THE crm_firms table SHALL store optional descriptive columns: `industry text`, `company_size text`, `website text`, `phone text`, `email text`, `address text`, `sector text`.
4. WHEN a `company_size` value is provided, THE crm_firms table SHALL enforce it is one of: `'1-10'`, `'11-50'`, `'51-200'`, `'201-500'`, `'500+'` via a CHECK constraint.
5. THE crm_firms table SHALL have an index on `organization_id` and a separate index on `name`.

---

### Requirement 3: crm_leads Table

**User Story:** As a sales associate, I want a central leads table capturing contact info, source, status, and assignment, so that I can manage the full lead lifecycle.

#### Acceptance Criteria

1. THE crm_leads table SHALL store `full_name text NOT NULL` as the primary contact identifier.
2. THE crm_leads table SHALL store optional contact fields: `email text`, `phone text`, `job_title text`.
3. THE crm_leads table SHALL store `organization_id uuid` referencing `public.auth_organizations(id)` for multi-tenant isolation.
4. THE crm_leads table SHALL store `firm_id uuid` referencing `public.crm_firms(id) ON DELETE SET NULL` and a denormalised `company_name text` for quick display.
5. THE crm_leads table SHALL store `source text NOT NULL DEFAULT 'Manual Entry'` and enforce it is one of: `'Website Form'`, `'Email'`, `'Chatbot'`, `'Marketplace'`, `'Webinar'`, `'Referral'`, `'Service Request'`, `'Product Demo'`, `'Tour Request'`, `'Consultation'`, `'Newsletter'`, `'Whitepaper'`, `'Waitlist'`, `'Enquiry'`, `'DMA'`, `'Account Signup'`, `'Social Media'`, `'Manual Entry'`.
6. THE crm_leads table SHALL store `status text NOT NULL DEFAULT 'New'` and enforce it is one of: `'New'`, `'Contacted'`, `'Qualified'`, `'Proposal Sent'`, `'Converted'`, `'Lost'`.
7. THE crm_leads table SHALL store `priority text DEFAULT 'Medium'` and enforce it is one of: `'High'`, `'Medium'`, `'Low'` or NULL.
8. THE crm_leads table SHALL store `score integer DEFAULT 0` with a CHECK constraint enforcing `score >= 0 AND score <= 100`.
9. THE crm_leads table SHALL store `assigned_to uuid` referencing `public.auth_user_profiles(id) ON DELETE SET NULL`.
10. THE crm_leads table SHALL store `tags text[] DEFAULT '{}'` for label-based filtering.
11. THE crm_leads table SHALL store `converted_at timestamptz` and `last_contacted_at timestamptz` as nullable lifecycle timestamps.
12. THE crm_leads table SHALL have a GIN index on `tags`.
13. THE crm_leads table SHALL have a composite index on `(organization_id, status, created_at DESC)` for pipeline/kanban queries.
14. THE crm_leads table SHALL have individual indexes on `status`, `source`, `assigned_to`, `firm_id`, `created_at DESC`, `score DESC`, and a partial index on `email WHERE email IS NOT NULL`.

---

### Requirement 4: crm_lead_activities Table

**User Story:** As a sales associate, I want every action on a lead to be logged, so that I have a complete audit trail of the lead's history.

#### Acceptance Criteria

1. THE crm_lead_activities table SHALL store `lead_id uuid NOT NULL` referencing `public.crm_leads(id) ON DELETE CASCADE`.
2. THE crm_lead_activities table SHALL store `activity_type text NOT NULL DEFAULT 'note'` and enforce it is one of: `'call'`, `'email'`, `'note'`, `'status_change'`, `'meeting'`, `'task'`, `'assignment'`, `'tag_change'`.
3. THE crm_lead_activities table SHALL store `description text NOT NULL` describing the activity.
4. THE crm_lead_activities table SHALL store `performed_by uuid` referencing `public.auth_user_profiles(id) ON DELETE SET NULL` and a denormalised `performed_by_name text`.
5. THE crm_lead_activities table SHALL store `occurred_at timestamptz DEFAULT now() NOT NULL` as the event timestamp (distinct from `created_at`).
6. THE crm_lead_activities table SHALL NOT include an `updated_at` column or update trigger, as activity records are append-only.
7. THE crm_lead_activities table SHALL have a composite index on `(lead_id, occurred_at DESC)` and individual indexes on `performed_by` and `activity_type`.

---

### Requirement 5: crm_lead_notes Table

**User Story:** As a sales associate, I want to attach free-text notes to leads, so that I can record context and observations.

#### Acceptance Criteria

1. THE crm_lead_notes table SHALL store `lead_id uuid NOT NULL` referencing `public.crm_leads(id) ON DELETE CASCADE`.
2. THE crm_lead_notes table SHALL store `author_id uuid` referencing `public.auth_user_profiles(id) ON DELETE SET NULL` and a denormalised `author_name text`.
3. THE crm_lead_notes table SHALL store `body text NOT NULL` as the note content.
4. THE crm_lead_notes table SHALL store `is_pinned boolean DEFAULT false NOT NULL` to allow important notes to be surfaced.
5. THE crm_lead_notes table SHALL have a composite index on `(lead_id, created_at DESC)`, an index on `author_id`, and a partial index on `(lead_id, is_pinned) WHERE is_pinned = true`.

---

### Requirement 6: Helper Functions

**User Story:** As a database engineer, I want reliable helper functions for RLS policies, so that access control logic is centralised and correct.

#### Acceptance Criteria

1. THE _crm_org_id() function SHALL return the current user's `organization_id` by first attempting to read it from JWT claims (`request.jwt.claim.organization_id` then `jwt.claims.organization_id`), and WHEN both claims are absent or empty, THE _crm_org_id() function SHALL fall back to querying `public.auth_user_profiles.organization_id WHERE user_id = auth.uid()`.
2. THE _crm_is_manager() function SHALL return true WHEN the current user has `'admin'` or `'approver'` in their `roles` array in `public.auth_organization_members`, scoped to the current organisation via `_crm_org_id()`.
3. THE _crm_is_admin() function SHALL return true WHEN the current user has `'admin'` in their `roles` array in `public.auth_organization_members`, scoped to the current organisation via `_crm_org_id()`.
4. THE _crm_is_authenticated() function SHALL delegate to `public._is_authenticated()`.
5. IF `auth.uid()` returns NULL, THEN THE _crm_is_manager() function SHALL return false.
6. IF `auth.uid()` returns NULL, THEN THE _crm_is_admin() function SHALL return false.

---

### Requirement 7: Row Level Security Policies

**User Story:** As a security engineer, I want RLS policies on all CRM tables, so that users can only access data belonging to their organisation and role.

#### Acceptance Criteria

1. THE CRM_Schema SHALL enable RLS on `crm_firms`, `crm_leads`, `crm_lead_activities`, and `crm_lead_notes`.
2. WHEN a user is authenticated, THE crm_firms table SHALL allow SELECT for rows where `organization_id` matches `_crm_org_id()` or `organization_id IS NULL`.
3. WHEN a user is authenticated AND `_crm_is_manager()` is true, THE crm_firms table SHALL allow INSERT and UPDATE.
4. WHEN a user is authenticated AND `_crm_is_admin()` is true, THE crm_firms table SHALL allow DELETE for rows in the user's organisation.
5. WHEN a user is authenticated, THE crm_leads table SHALL allow SELECT for rows where `organization_id` matches `_crm_org_id()` or `organization_id IS NULL`.
6. WHEN a user is authenticated, THE crm_leads table SHALL allow INSERT.
7. WHEN a user is authenticated AND (`_crm_is_manager()` is true OR `assigned_to` matches the current user's profile id), THE crm_leads table SHALL allow UPDATE for rows in the user's organisation.
8. WHEN a user is authenticated AND `_crm_is_admin()` is true, THE crm_leads table SHALL allow DELETE for rows in the user's organisation.
9. WHEN a user is authenticated, THE crm_lead_activities table SHALL allow SELECT for activities whose parent lead belongs to the user's organisation.
10. WHEN a user is authenticated, THE crm_lead_activities table SHALL allow INSERT.
11. WHEN a user is authenticated AND `_crm_is_admin()` is true, THE crm_lead_activities table SHALL allow UPDATE and DELETE (activities are otherwise append-only).
12. WHEN a user is authenticated, THE crm_lead_notes table SHALL allow SELECT for notes whose parent lead belongs to the user's organisation.
13. WHEN a user is authenticated, THE crm_lead_notes table SHALL allow INSERT.
14. WHEN a user is authenticated AND (`_crm_is_manager()` is true OR `author_id` matches the current user's profile id), THE crm_lead_notes table SHALL allow UPDATE.
15. WHEN a user is authenticated AND (`_crm_is_admin()` is true OR `author_id` matches the current user's profile id), THE crm_lead_notes table SHALL allow DELETE.
16. WHERE `auth.role() = 'service_role'`, THE CRM_Schema SHALL bypass all RLS restrictions.

---

### Requirement 8: Grants

**User Story:** As a database engineer, I want correct privilege grants, so that the `authenticated` role can use CRM tables and `anon` is denied access.

#### Acceptance Criteria

1. THE CRM_Schema SHALL grant `SELECT, INSERT, UPDATE, DELETE` on all four CRM tables to the `authenticated` and `service_role` roles.
2. THE CRM_Schema SHALL NOT grant any table-level privileges to the `anon` role.
3. THE CRM_Schema SHALL grant `EXECUTE` on all CRM helper functions to `authenticated` and `service_role`.

---

### Requirement 9: Convenience View

**User Story:** As a frontend developer, I want a denormalised view of leads with firm and assignee names, so that I can build list and detail UIs without complex joins.

#### Acceptance Criteria

1. THE v_crm_leads view SHALL join `crm_leads` with `crm_firms` (LEFT JOIN on `firm_id`) to expose `industry` and `company_size`.
2. THE v_crm_leads view SHALL expose `COALESCE(f.name, l.company_name) AS company_name` to handle leads without a linked firm.
3. THE v_crm_leads view SHALL join `auth_user_profiles` (LEFT JOIN on `assigned_to`) and then `auth_users` (LEFT JOIN on `user_id`) to expose `au.name AS assigned_to_name`.
4. THE v_crm_leads view SHALL be granted SELECT to `authenticated` and `service_role`.

---

### Requirement 10: Migration Idempotency and Safety

**User Story:** As a DevOps engineer, I want the migration to be safely re-runnable, so that failed or repeated deployments do not leave the database in a broken state.

#### Acceptance Criteria

1. THE Migration SHALL use `DROP ... IF EXISTS ... CASCADE` statements before creating all tables, views, and functions.
2. THE Migration SHALL use `CREATE OR REPLACE` for all functions, triggers, and views.
3. THE Migration SHALL set `check_function_bodies = false` at the top to allow forward references during creation.
4. WHEN the migration is applied to a database where the CRM objects already exist, THE Migration SHALL complete without error.
