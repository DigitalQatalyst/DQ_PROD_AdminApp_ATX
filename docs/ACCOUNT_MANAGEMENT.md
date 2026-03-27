# Account Management Feature

## Overview

The Account Management module is a CRM workspace for managing organizational accounts. It follows the **LVE (List | View | Edit)** workspace pattern — a reusable three-pane layout used across CRM modules in this platform.

---

## Architecture

### Frontend

| File | Role |
|------|------|
| `src/pages/accounts.tsx` | Main page — state management, data fetching, UI composition |
| `src/api/accounts/accountService.ts` | HTTP client for the accounts REST API |
| `src/components/layout/LVEWorkspaceLayout.tsx` | Reusable LVE layout shell (no module-specific logic) |

### Backend

| File | Role |
|------|------|
| `api/routes/accounts.ts` | Express router — GET, POST, PUT endpoints |
| `api/auth/utils/supabaseClient.ts` | Supabase service role client (shared across routes) |
| `api/server.ts` | Mounts accounts router at `/api/accounts` |

### Database

| Item | Detail |
|------|--------|
| Table | `public.crm_accounts` |
| Migration | `supabase/migrations/20260311000000_crm_accounts.sql` |
| Primary key | `uuid` (auto-generated via `gen_random_uuid()`) |
| Timestamps | `created_at`, `updated_at` (auto-managed via trigger) |

---

## Data Model

```sql
crm_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  industry        text,
  website         text,
  phone           text,
  address         text,
  country         text,
  owner_name      text,
  lifecycle_stage text DEFAULT 'Prospect',  -- see enum below
  account_tier    text,
  tags            text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()  -- auto-updated via trigger
)
```

### Lifecycle Stages

`Prospect` → `Active Customer` → `Key Account` → `At Risk` → `Inactive` → `Closed`

---

## API Endpoints

Base URL: `http://localhost:3001/api/accounts`

### GET /api/accounts
Returns all accounts ordered by `created_at` descending.

**Response**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "industry": "Technology",
      "lifecycleStage": "Active Customer",
      "ownerName": "Jane Smith",
      "country": "UAE",
      "createdAt": "2026-03-18T10:00:00Z",
      "updatedAt": "2026-03-18T10:00:00Z"
    }
  ]
}
```

### POST /api/accounts
Creates a new account. `name` is required.

**Request body**
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "phone": "+971...",
  "address": "Dubai, UAE",
  "country": "UAE",
  "ownerName": "Jane Smith",
  "lifecycleStage": "Prospect",
  "accountTier": "Strategic"
}
```

**Response** — `201 Created` with the created account object.

### PUT /api/accounts/:id
Updates an existing account by ID. All fields are optional.

**Response** — `200 OK` with the updated account object. Returns `404` if not found.

---

## Environment Variables

### Frontend (`/.env`)
```env
VITE_APP_API_URL=http://localhost:3001
```

### Backend (`/api/.env`)
```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
PORT=3001
FRONTEND_URL=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

---

## Running Locally

Two processes need to run simultaneously:

**Terminal 1 — Frontend**
```bash
npm run dev
# runs on http://localhost:3000
```

**Terminal 2 — API Server**
```bash
cd api
npm run dev
# runs on http://localhost:3001
```

### Database Setup

If the `crm_accounts` table doesn't exist yet, run the migration in your Supabase dashboard (SQL Editor):

```
supabase/migrations/20260311000000_crm_accounts.sql
```

---

## UI Layout

The page uses the `LVEWorkspaceLayout` component with three active panes:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Enterprise Admin > Accounts tab                    │
├──────────────────┬──────────────────────────┬───────────────┤
│  Account Queue   │  Create / Edit Account   │  Context Pane │
│  (list + filter) │  (form workspace)        │  (at-a-glance)│
│                  │                          │               │
│  Search bar      │  Name, Industry,         │  Stage        │
│  Stage filter    │  Website, Phone,         │  Owner        │
│  Account table   │  Country, Address,       │               │
│                  │  Owner, Stage, Tier      │               │
└──────────────────┴──────────────────────────┴───────────────┘
```

### Key Interactions

- Clicking an account in the queue opens it in the work pane for editing
- "+ New Account" button opens a blank form
- Tabs track open account workspaces and can be closed individually
- Duplicate name detection warns before saving
- Save handles both create and update based on whether an account is selected

---

## Known Limitations / Future Work

- No delete functionality yet
- No pagination (all accounts loaded at once)
- `tags` field exists in DB but not exposed in the UI
- Context pane is static — future: linked contacts, open deals, activity timeline
- No auth guard on the accounts API endpoints (marked as MVP, swap to `verifyInternalToken` when ready)
