# Complete LVE Workspace Module Guide

## Table of Contents

1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Adding Module to Sidebar](#adding-module-to-sidebar)
5. [Module Configuration Reference](#module-configuration-reference)
6. [Props Reference](#props-reference)
7. [Advanced Patterns](#advanced-patterns)
8. [Built-In Pagination](#built-in-pagination)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete process of creating a new LVE workspace module, from initial setup through to production deployment. You'll learn how to:

- Define your module configuration
- Add your module to the sidebar navigation
- Connect to API endpoints
- Handle CRUD operations
- Customize the UI with runtime state
- Test your module

**Time to Complete:** 30-45 minutes for a basic module

**Prerequisites:**

- Basic TypeScript/React knowledge
- Understanding of REST APIs
- Familiarity with React Query (optional but recommended)

---

## Module Architecture

### The Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  Page Component (ContactsPage.tsx)             │
│  - Fetches data from API                       │
│  - Manages loading/error states                │
│  - Passes data to LVEWorkspace                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Module Config (contactsModule)                 │
│  - Defines structure and behavior               │
```

│ - Configures panes, columns, actions │
│ - No business logic │
└─────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────┐
│ LVEWorkspace Component │
│ - Renders three-pane layout │
│ - Handles routing and tabs │
│ - Manages search and filtering │
│ - Orchestrates CRUD operations │
└─────────────────────────────────────────────────┘

````

### Key Concepts

- **Controlled Records**: Your API is the source of truth; the workspace displays what you pass
- **Runtime State**: Dynamic UI states (loading, errors) separate from static config
- **Module Config**: Declarative configuration that defines structure without logic
- **API-First**: All data operations go through your API handlers

---

## Step-by-Step Implementation

### Step 1: Define Your Record Type

Create a TypeScript interface for your data model.

```typescript
// src/types/myrecord.ts (example: products, tasks, tickets, etc.)
export interface MyRecord {
  id: string;
  name: string;
  // Add your domain-specific fields
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}
```

**Real-World Example (Products):**
```typescript
// src/types/products.ts
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  status: "active" | "discontinued";
  created_at: string;
  updated_at: string;
}
````

### Step 2: Create API Hooks

Set up React Query hooks for data fetching and mutations.

```typescript
// src/hooks/useMyRecords.ts (example: useProducts, useTasks, useTickets)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MyRecord } from "../types/myrecord";

const API_BASE = "/api/myrecords"; // Your API endpoint

export function useMyRecordsQuery() {
  return useQuery({
    queryKey: ["myrecords"],
    queryFn: async () => {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error("Failed to load records");
      }
      return response.json() as Promise<MyRecord[]>;
    },
  });
}
```

export function useCreateContact() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: async (values: Partial<Contact>) => {
const response = await fetch(API_BASE, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(values),
});
if (!response.ok) {
throw new Error("Failed to create contact");
}
return response.json() as Promise<Contact>;
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["contacts"] });
},
});
}

export function useUpdateContact() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: async ({ id, values }: { id: string; values: Partial<Contact> }) => {
const response = await fetch(`${API_BASE}/${id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(values),
});
if (!response.ok) {
throw new Error("Failed to update contact");
}
return response.json() as Promise<Contact>;
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["contacts"] });
},
});
}

export function useDeleteContact() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: async (id: string) => {
const response = await fetch(`${API_BASE}/${id}`, {
method: "DELETE",
});
if (!response.ok) {
throw new Error("Failed to delete contact");
}
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ["contacts"] });
},
});
}

````

### Step 3: Create Module Configuration

Define your module's structure and behavior.

```typescript
// src/modules/mymodule/myModule.ts
import { LVEWorkspaceModuleConfig } from "@/components/layout/workspace";
import { MyRecord } from "@/types/myrecord";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";

export const myModule: LVEWorkspaceModuleConfig<MyRecord> = {
  // Module Metadata
  metadata: {
    id: "mymodule",           // Unique ID (lowercase, no spaces)
    label: "My Module",       // Display name
    singularLabel: "Record",  // Singular form
    pluralLabel: "Records",   // Plural form
    route: "/mymodule",       // Base route
    icon: FileText,           // Lucide icon
    moduleType: "record",     // "record" | "workflow" | "parent-workspace"
  },

  // Sidebar Menu Configuration
  menu: {
    order: 10,                // Lower = higher in sidebar
    visible: true,            // Show in sidebar
    requiredSegments: [],     // Optional: restrict by user segment
  },

  // Routing Configuration
  routes: {
    base: "/mymodule",
    record: (recordId) => `/mymodule/${recordId}`,
  },
````

// List Pane Configuration (Left Panel)
listPane: {
records: [], // Initial records (will be overridden by controlled records)
getRecordId: (record) => record.id,
getRecordLabel: (record) => record.name,
searchPlaceholder: "Search contacts...",

    // Define columns for the list view
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        searchable: true,
        render: (record) => record.name,
      },
      {
        id: "email",
        label: "Email",
        slot: "secondary",
        searchable: true,
        render: (record) => record.email,
      },
      {
        id: "company",
        label: "Company",
        slot: "tertiary",
        searchable: true,
        render: (record) => record.company,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        render: (record) => (
          <span
            className={
              record.status === "active"
                ? "text-green-600"
                : record.status === "inactive"
                ? "text-gray-400"
                : "text-yellow-600"
            }
          >
            {record.status}
          </span>
        ),
      },
    ],

    // List Actions (appears at top of list pane)
    listActions: [
      {
        id: "create",
        label: "New Contact",
        icon: Plus,
        intent: "create",
        variant: "primary",
      },
    ],

},

// Work Window Configuration (Center Panel)
workWindow: {
title: "Contact Details",

    // Define sections for the detail view
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        columns: 2,
        fields: [
          {
            id: "name",
            label: "Name",
            render: () => record.name,
          },
          {
            id: "email",
            label: "Email",
            render: () => (
              <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">
                {record.email}
              </a>
            ),
          },
          {
            id: "phone",
            label: "Phone",
            render: () => record.phone || "—",
          },
          {
            id: "company",
            label: "Company",
            render: () => record.company || "—",
          },
        ],
      },
      {
        id: "metadata",
        title: "Metadata",
        columns: 2,
        fields: [
          {
            id: "created",
            label: "Created",
            render: () => new Date(record.created_at).toLocaleDateString(),
          },
          {
            id: "updated",
            label: "Last Updated",
            render: () => new Date(record.updated_at).toLocaleDateString(),
          },
        ],
      },
    ],

    // Record Actions (appears in work window header)
    recordActions: [
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        intent: "edit",
        variant: "default",
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        intent: "delete",
        variant: "outline",
      },
    ],

},

// Pop Pane Configuration (Right Panel)
popPane: {
title: "Context",
collapsible: true,

    // Define context sections
    getSections: (record) => [
      {
        id: "status",
        title: "Status",
        items: [
          {
            id: "status",
            label: "Status",
            render: () => (
              <span className="capitalize">{record.status}</span>
            ),
          },
        ],
      },
      {
        id: "contact-info",
        title: "Contact Information",
        items: [
          {
            id: "email",
            label: "Email",
            icon: Mail,
            render: () => record.email,
          },
          {
            id: "phone",
            label: "Phone",
            icon: Phone,
            render: () => record.phone || "Not provided",
          },
        ],
      },
    ],

    // Quick Actions (appears in pop pane)
    quickActions: [
      {
        id: "send-email",
        label: "Send Email",
        icon: Mail,
        onClick: (context) => {
          window.location.href = `mailto:${context.selectedRecord?.email}`;
        },
      },
    ],

},

// CRUD Configuration
crud: {
create: {
title: "Create Contact",
description: "Add a new contact to your CRM",
submitLabel: "Create Contact",
fields: [
{
id: "name",
name: "name",
label: "Name",
type: "text",
required: true,
placeholder: "John Doe",
},
{
id: "email",
name: "email",
label: "Email",
type: "email",
required: true,
placeholder: "john@example.com",
},
{
id: "phone",
name: "phone",
label: "Phone",
type: "tel",
placeholder: "+1 (555) 123-4567",
},
{
id: "company",
name: "company",
label: "Company",
type: "text",
placeholder: "Acme Corp",
},
{
id: "status",
name: "status",
label: "Status",
type: "select",
required: true,
options: [
{ value: "active", label: "Active" },
{ value: "inactive", label: "Inactive" },
{ value: "pending", label: "Pending" },
],
},
],
createRecord: (values) => ({
id: `temp-${Date.now()}`,
name: values.name,
email: values.email,
phone: values.phone || "",
company: values.company || "",
status: values.status as "active" | "inactive" | "pending",
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
}),
},
edit: {
title: "Edit Contact",
submitLabel: "Save Changes",
fields: [
{
id: "name",
name: "name",
label: "Name",
type: "text",
required: true,
getValue: (record) => record.name,
},
{
id: "email",
name: "email",
label: "Email",
type: "email",
required: true,
getValue: (record) => record.email,
},
{
id: "phone",
name: "phone",
label: "Phone",
type: "tel",
getValue: (record) => record.phone,
},
{
id: "company",
name: "company",
label: "Company",
type: "text",
getValue: (record) => record.company,
},
{
id: "status",
name: "status",
label: "Status",
type: "select",
required: true,
getValue: (record) => record.status,
options: [
{ value: "active", label: "Active" },
{ value: "inactive", label: "Inactive" },
{ value: "pending", label: "Pending" },
],
},
],
updateRecord: (record, values) => ({
...record,
...values,
updated_at: new Date().toISOString(),
}),
},
delete: {
title: (record) => `Delete ${record.name}?`,
description: "This action cannot be undone. The contact will be permanently removed.",
confirmLabel: "Delete Contact",
},
},
};

````

### Step 4: Create Page Component

Connect your module to the API and render the workspace.

```typescript
// src/pages/ContactsPage.tsx
import { LVEWorkspace } from "@/components/layout/workspace";
import { contactsModule } from "@/modules/contacts/contactsModule";
import {
  useContactsQuery,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/useContacts";

export function ContactsPage() {
  // Fetch data
  const { data, isLoading, error } = useContactsQuery();

  // Mutations
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}
      state={{
        listPane: {
          isLoading,
          errorMessage: error ? "Failed to load contacts" : undefined,
          emptyTitle: !isLoading && !error ? "No contacts yet" : undefined,
          emptyDescription: !isLoading && !error ? "Create your first contact to get started" : undefined,
        },
      }}
      onCreateRecord={async ({ values }) => {
        const newContact = await createMutation.mutateAsync(values);
        return newContact;
      }}
      onUpdateRecord={async ({ recordId, values }) => {
        const updated = await updateMutation.mutateAsync({
          id: recordId,
          values,
        });
        return updated;
      }}
      onDeleteRecord={async ({ recordId }) => {
        await deleteMutation.mutateAsync(recordId);
      }}
      persistLocalRecords={false}
    />
  );
}
````

### Step 5: Add Routes

Register your module's routes in your router configuration.

```typescript
// src/App.tsx or src/router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactsPage } from "./pages/ContactsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Base route - shows list view */}
        <Route path="/contacts" element={<ContactsPage />} />

        {/* Record route - shows specific contact */}
        <Route path="/contacts/:recordId" element={<ContactsPage />} />

        {/* Other routes... */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Adding Module to Sidebar

### Method 1: Module Registry (Recommended)

Add your module to the central registry for automatic sidebar inclusion.

```typescript
// src/components/layout/workspace/moduleRegistry.tsx
import { contactsModule } from "@/modules/contacts/contactsModule";
import { leadsModule } from "@/modules/leads/leadsModule";
import { accountsModule } from "@/modules/accounts/accountsModule";

/**
 * Get all LVE modules available for a specific user segment
 */
export function getLveModulesForSegment(segment: string) {
  const modules = [
    contactsModule, // ← Add your module here
    leadsModule,
    accountsModule,
    // Add more modules...
  ];

  // Filter by required segments
  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
}
```

### Method 2: Direct Sidebar Integration

If you have a custom sidebar component, integrate directly.

```typescript
// src/components/Sidebar.tsx
import { useAuth } from "@/context/AuthContext";
import { getLveModulesForSegment } from "@/components/layout/workspace/moduleRegistry";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { userSegment } = useAuth();
  const location = useLocation();

  // Get modules for current user
  const modules = getLveModulesForSegment(userSegment || "default");

  // Sort by menu order
  const sortedModules = modules
    .filter((m) => m.menu.visible)
    .sort((a, b) => a.menu.order - b.menu.order);

  return (
    <nav className="sidebar">
      {sortedModules.map((module) => {
        const Icon = module.metadata.icon;
        const isActive = location.pathname.startsWith(module.metadata.route);

        return (
          <Link
            key={module.metadata.id}
            to={module.routes.base}
            className={`sidebar-item ${isActive ? "active" : ""}`}
          >
            <Icon className="w-5 h-5" />
            <span>{module.metadata.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### Sidebar Configuration Options

Control sidebar visibility and ordering through the `menu` config:

```typescript
menu: {
  order: 10,                          // Lower numbers appear first
  visible: true,                      // Show/hide in sidebar
  requiredSegments: ["crm", "sales"], // Optional: restrict by user segment
}
```

**Common Order Values:**

- 10: Primary modules (Contacts, Accounts)
- 20: Secondary modules (Leads, Opportunities)
- 30: Support modules (Tasks, Notes)
- 40: Admin modules (Settings, Users)

---

## Module Configuration Reference

### Metadata

```typescript
metadata: {
  id: string; // Unique identifier (lowercase, no spaces)
  label: string; // Display name in sidebar
  singularLabel: string; // "Contact"
  pluralLabel: string; // "Contacts"
  route: string; // Base route path
  icon: LucideIcon; // Icon component
  moduleType: "record" | "workflow" | "parent-workspace";
}
```

### Module Types

**1. Record Module** (Standard CRUD)

```typescript
moduleType: "record";
```

- Standard list/detail view
- Full CRUD operations
- Most common type

**2. Workflow Module** (Lifecycle Management)

```typescript
moduleType: "workflow";
```

- Includes lifecycle actions (e.g., stage transitions)
- Use for processes with stages (Leads, Opportunities)
- Adds `lifecycleActions` to work window

**3. Parent-Workspace Module** (Nested Workspaces)

```typescript
moduleType: "parent-workspace";
```

- Supports inner tabs for nested content
- Use for hierarchical data (Accounts with Contacts)
- Adds `innerTabs` configuration

### List Pane Configuration

```typescript
listPane: {
  records: TRecord[];                    // Initial records
  getRecordId: (record) => string;       // Extract record ID
  getRecordLabel: (record) => string;    // Extract display label
  searchPlaceholder?: string;            // Search input placeholder

  columns: Array<{
    id: string;
    label: string;
    slot: "primary" | "secondary" | "tertiary" | "badge" | "meta";
    searchable?: boolean;                // Include in search
    render: (record) => React.ReactNode;
  }>;

  listActions?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    intent?: "create" | "edit" | "delete";
    variant?: "primary" | "default" | "outline";
    onClick?: (context) => void;
    disabled?: boolean;
  }>;

  // Runtime state (passed via props)
  isLoading?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
```

### Work Window Configuration

```typescript
workWindow: {
  title: string;

  getSections: (record) => Array<{
    id: string;
    title: string;
    columns?: 1 | 2 | 3;                 // Field layout columns
    fields: Array<{
      id: string;
      label: string;
      render: () => React.ReactNode;
    }>;
  }>;

  recordActions?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    intent?: "create" | "edit" | "delete";
    variant?: "primary" | "default" | "outline";
    onClick?: (context) => void;
    disabled?: boolean;
  }>;

  // For workflow modules
  lifecycleActions?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: (context) => void;
  }>;

  // For parent-workspace modules
  innerTabs?: Array<{
    id: string;
    label: string;
    render: (record) => React.ReactNode;
  }>;

  // Runtime state (passed via props)
  isLoading?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
```

### Pop Pane Configuration

```typescript
popPane: {
  title: string;
  collapsible?: boolean;                 // Allow collapse/expand

  getSections: (record) => Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      label: string;
      icon?: LucideIcon;
      render: () => React.ReactNode;
    }>;
  }>;

  quickActions?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: (context) => void;
    disabled?: boolean;
  }>;

  // Runtime state (passed via props)
  isLoading?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
```

### CRUD Configuration

```typescript
crud?: {
  create?: {
    title: string;
    description?: string;
    submitLabel?: string;
    fields: Array<{
      id: string;
      name: string;
      label: string;
      type: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";
      required?: boolean;
      placeholder?: string;
      options?: Array<{ value: string; label: string }>;  // For select
    }>;
    createRecord: (values: Record<string, any>) => TRecord;
  };

  edit?: {
    title: string;
    submitLabel?: string;
    fields: Array<{
      id: string;
      name: string;
      label: string;
      type: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";
      required?: boolean;
      getValue: (record: TRecord) => any;
      options?: Array<{ value: string; label: string }>;
    }>;
    updateRecord: (record: TRecord, values: Record<string, any>) => TRecord;
  };

  delete?: {
    title: string | ((record: TRecord) => string);
    description?: string;
    confirmLabel?: string;
  };
}
```

---

## Props Reference

### LVEWorkspace Props

```typescript
<LVEWorkspace
  module={moduleConfig}
  records={data}
  state={runtimeState}
  persistLocalRecords={false}
  onCreateRecord={createHandler}
  onUpdateRecord={updateHandler}
  onDeleteRecord={deleteHandler}
/>
```

### Prop Details

#### `module` (required)

- Type: `LVEWorkspaceModuleConfig<TRecord>`
- The module configuration object
- Defines structure and behavior

#### `records` (optional)

- Type: `TRecord[]`
- Controlled records from your API
- When provided, becomes the source of truth
- Workspace displays exactly what you pass

#### `state` (optional)

- Type: `LVEWorkspaceRuntimeState`
- Dynamic UI state for loading, errors, empty states
- Separate from static module config
- Can be different for each pane

```typescript
state={{
  listPane: {
    isLoading: boolean;
    errorMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  },
  workWindow: {
    isLoading: boolean;
    errorMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  },
  popPane: {
    isLoading: boolean;
    errorMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  },
}}
```

#### `persistLocalRecords` (optional)

- Type: `boolean`
- Default: `false` when `records` provided, `true` otherwise
- Controls localStorage persistence
- Set to `false` for API-backed modules (recommended)
- Set to `true` only for demos/prototypes

#### `onCreateRecord` (optional)

- Type: `(context: LVECreateRecordHandlerContext<TRecord>) => Promise<TRecord>`
- Called when user submits create form
- Must return the created record
- Errors are caught and displayed

```typescript
onCreateRecord={async ({ moduleId, values, records }) => {
  const newRecord = await api.createContact(values);
  return newRecord;
}}
```

#### `onUpdateRecord` (optional)

- Type: `(context: LVEUpdateRecordHandlerContext<TRecord>) => Promise<TRecord>`
- Called when user submits edit form
- Must return the updated record

```typescript
onUpdateRecord={async ({ moduleId, recordId, record, values, records }) => {
  const updated = await api.updateContact(recordId, values);
  return updated;
}}
```

#### `onDeleteRecord` (optional)

- Type: `(context: LVEDeleteRecordHandlerContext<TRecord>) => Promise<void>`
- Called when user confirms deletion
- Returns void (no return value needed)

```typescript
onDeleteRecord={async ({ moduleId, recordId, record, records }) => {
  await api.deleteContact(recordId);
}}
```

---

## Advanced Patterns

### Pattern 1: Custom Pane Renderers

Override default pane implementations for specialized UI.

```typescript
// In module config
export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... other config

  listPaneOverride: (props) => {
    return (
      <div className="custom-list">
        <h2>Custom List View</h2>
        {props.filteredRecords.map((record) => (
          <div
            key={props.module.listPane.getRecordId(record)}
            onClick={() => props.onSelectRecord(record)}
          >
            {props.module.listPane.getRecordLabel(record)}
          </div>
        ))}
      </div>
    );
  },
};
```

**Override Props Available:**

```typescript
{
  module: LVEWorkspaceModuleConfig<TRecord>;
  filteredRecords: TRecord[];
  selectedRecord: TRecord | null;
  searchQuery: string;
  onSelectRecord: (record: TRecord) => void;
}
```

### Pattern 2: Conditional Actions

Show/hide actions based on record state.

```typescript
workWindow: {
  recordActions: [
    {
      id: "approve",
      label: "Approve",
      icon: Check,
      onClick: (context) => handleApprove(context.selectedRecord),
      // Only show for pending records
      disabled: (context) => context.selectedRecord?.status !== "pending",
    },
  ],
}
```

### Pattern 3: Optimistic Updates

Update UI immediately while API call is in progress.

```typescript
export function ContactsPage() {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateContact();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}
      onUpdateRecord={async ({ recordId, values }) => {
        // Optimistically update cache
        queryClient.setQueryData(["contacts"], (old: Contact[]) =>
          old.map((c) => (c.id === recordId ? { ...c, ...values } : c))
        );

        try {
          const updated = await updateMutation.mutateAsync({
            id: recordId,
            values,
          });
          return updated;
        } catch (error) {
          // Revert on error
          queryClient.invalidateQueries({ queryKey: ["contacts"] });
          throw error;
        }
      }}
    />
  );
}
```

### Pattern 4: Multi-Step Forms

Handle complex create/edit flows.

```typescript
crud: {
  create: {
    title: "Create Contact",
    fields: [
      // Step 1: Basic Info
      {
        id: "name",
        name: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      // Step 2: Contact Details
      {
        id: "email",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      // Step 3: Additional Info
      {
        id: "notes",
        name: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
    createRecord: async (values) => {
      // Validate across steps
      if (!values.name || !values.email) {
        throw new Error("Name and email are required");
      }

      return {
        id: `temp-${Date.now()}`,
        ...values,
      };
    },
  },
}
```

### Pattern 5: Dependent Fields

Fields that change based on other field values.

```typescript
// Use custom form component with listPaneOverride or workPaneOverride
listPaneOverride: (props) => {
  const [country, setCountry] = useState("");
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (country) {
      fetchStates(country).then(setStates);
    }
  }, [country]);

  return (
    <CustomForm
      countryField={
        <select onChange={(e) => setCountry(e.target.value)}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      }
      stateField={
        <select disabled={!country}>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      }
    />
  );
};
```

### Pattern 6: Bulk Operations

Handle multiple records at once.

```typescript
listPane: {
  listActions: [
    {
      id: "bulk-delete",
      label: "Delete Selected",
      icon: Trash2,
      onClick: async (context) => {
        const selectedIds = getSelectedRecordIds(); // Your selection logic
        await Promise.all(
          selectedIds.map((id) => api.deleteContact(id))
        );
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
      },
    },
  ],
}
```

### Pattern 7: Real-Time Updates

Subscribe to real-time data changes.

```typescript
export function ContactsPage() {
  const { data, isLoading } = useContactsQuery();

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel("contacts")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "contacts",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <LVEWorkspace module={contactsModule} records={data ?? []} />;
}
```

---

## Built-In Pagination

The LVE Workspace Shell includes automatic client-side pagination that displays 20 records per page. This feature works automatically for all modules without any configuration required.

### How Pagination Works

**Automatic Behavior:**

- Displays 20 records per page by default
- Shows pagination controls when more than 20 records exist
- Hides pagination controls when 20 or fewer records
- Automatically resets to page 1 when search query changes
- Automatically resets to page 1 when switching modules

**UI Components:**

- Record count display (e.g., "Showing 1-20 of 150")
- Previous/Next navigation buttons
- Page indicator (e.g., "1 / 8")
- Disabled states for first/last pages

### No Configuration Required

Pagination works automatically for all modules:

```typescript
export function ContactsPage() {
  const { data, isLoading } = useContactsQuery();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}  // Pass all records - pagination handled automatically
      state={{
        listPane: { isLoading },
      }}
      persistLocalRecords={false}
    />
  );
}
```

### Testing Pagination

To test pagination in your module:

1. **Generate Sample Data**: Use the sample data generator to create 50+ records

```typescript
// src/components/layout/workspace/sampleDataGenerator.ts
import { generateContactRecords } from "./sampleDataGenerator";

// Generate 50 sample contacts
const sampleContacts = generateContactRecords(50);
```

2. **Verify Pagination Appears**: Navigate to your module and confirm:
   - Only 20 records display on page 1
   - Pagination controls appear at bottom of list pane
   - Previous button is disabled on page 1
   - Next button navigates to page 2

3. **Test Search Reset**: Enter a search query and verify page resets to 1

4. **Test Module Switching**: Switch between modules and verify page resets to 1

### Performance Considerations

**Current Implementation (Client-Side):**

- All records loaded into memory
- Pagination happens in the browser
- Instant page switching
- Best for datasets under 1,000 records

**When to Consider Server-Side Pagination:**

- Datasets with 10,000+ records
- Slow initial load times
- Memory constraints on client devices

### Server-Side Pagination (Future Enhancement)

For very large datasets, implement server-side pagination:

```typescript
export function ContactsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // API returns paginated results
  const { data, isLoading } = useContactsQuery({ page, limit });

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data?.records ?? []}
      state={{
        listPane: {
          isLoading,
          // Future: Add pagination metadata
          // totalRecords: data?.total,
          // currentPage: page,
          // onPageChange: setPage,
        },
      }}
      persistLocalRecords={false}
    />
  );
}
```

**Note**: Server-side pagination requires additional props and API changes. The current implementation handles client-side pagination automatically.

### Customizing Page Size

To change the number of records per page (global change):

```typescript
// src/components/layout/workspace/LVEWorkspace.tsx
const RECORDS_PER_PAGE = 50; // Change from 20 to 50
```

**Note**: This is a global setting affecting all modules. Per-module page size configuration is not currently supported.

### Custom Pagination UI

If you need custom pagination behavior, use `listPaneOverride`:

```typescript
export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... other config

  listPaneOverride: (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 25; // Custom page size

    const paginatedRecords = useMemo(() => {
      const start = (currentPage - 1) * recordsPerPage;
      return props.filteredRecords.slice(start, start + recordsPerPage);
    }, [props.filteredRecords, currentPage, recordsPerPage]);

    return (
      <div className="custom-list-with-pagination">
        {/* Your custom list UI */}
        {paginatedRecords.map((record) => (
          <div key={props.module.listPane.getRecordId(record)}>
            {props.module.listPane.getRecordLabel(record)}
          </div>
        ))}

        {/* Your custom pagination controls */}
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
          <span>Page {currentPage}</span>
          <button onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    );
  },
};
```

### Pagination with Filtering

Pagination works seamlessly with search and filtering:

```typescript
// Pagination automatically applies to filtered results
export function ContactsPage() {
  const { data } = useContactsQuery();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}
      // Search filters records first, then pagination applies
      // Page automatically resets to 1 when search changes
    />
  );
}
```

### Pagination Best Practices

1. **Load All Records**: For client-side pagination, load all records upfront
2. **Show Loading States**: Display loading indicator while fetching data
3. **Handle Empty States**: Show appropriate message when no records exist
4. **Test with Real Data**: Test with 50+ records to verify pagination works
5. **Consider Performance**: For 1000+ records, consider server-side pagination

### Pagination Troubleshooting

**Issue: Pagination not appearing**

Possible causes:

- Less than 21 records in dataset
- List pane is in loading state
- List pane has an error state

Solution:

```typescript
// Ensure you have enough records
console.log("Total records:", data?.length); // Should be > 20

// Check loading/error states
state={{
  listPane: {
    isLoading: false,  // Pagination hidden during loading
    errorMessage: undefined,  // Pagination hidden on error
  },
}}
```

**Issue: Page doesn't reset on search**

This is handled automatically by the workspace. If it's not working:

- Check that you're using the default list pane (not overridden)
- Verify you haven't disabled the search functionality

**Issue: Performance problems with large datasets**

Solutions:

1. Implement server-side pagination
2. Use virtual scrolling for very long lists
3. Add debouncing to search (already included)
4. Consider lazy loading images/heavy content

### Related Documentation

- [PAGINATION.md](./PAGINATION.md) - Detailed pagination documentation
- [Performance Guide](./PERFORMANCE.md) - Optimization strategies
- [API Reference](./README.md) - Complete API documentation

---

## Troubleshooting

### Issue: Module not appearing in sidebar

**Possible Causes:**

1. Module not added to `getLveModulesForSegment()`
2. `menu.visible` is `false`
3. User segment doesn't match `requiredSegments`

**Solution:**

```typescript
// Check module registry
export function getLveModulesForSegment(segment: string) {
  const modules = [
    contactsModule, // ← Ensure your module is here
  ];

  return modules.filter(
    (m) =>
      m.menu.visible && // ← Check this
      (!m.menu.requiredSegments || m.menu.requiredSegments.includes(segment)),
  );
}
```

### Issue: Records not displaying

**Possible Causes:**

1. API returning empty array
2. `getRecordId` or `getRecordLabel` returning undefined
3. Records prop not passed correctly

**Solution:**

```typescript
// Add debugging
export function ContactsPage() {
  const { data, isLoading, error } = useContactsQuery();

  console.log("Records:", data); // ← Debug output
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []} // ← Ensure data is passed
      state={{
        listPane: {
          isLoading,
          errorMessage: error?.message,
        },
      }}
    />
  );
}
```

### Issue: CRUD operations not working

**Possible Causes:**

1. Handler not provided
2. Handler throwing unhandled error
3. API endpoint not configured

**Solution:**

```typescript
onCreateRecord={async ({ values }) => {
  try {
    console.log("Creating with values:", values); // ← Debug
    const result = await createMutation.mutateAsync(values);
    console.log("Created:", result); // ← Debug
    return result;
  } catch (error) {
    console.error("Create failed:", error); // ← Debug
    throw error; // Re-throw to show error in modal
  }
}}
```

### Issue: Search not working

**Possible Causes:**

1. Columns not marked as `searchable: true`
2. Search returning undefined values

**Solution:**

```typescript
columns: [
  {
    id: "name",
    label: "Name",
    slot: "primary",
    searchable: true, // ← Must be true
    render: (record) => record.name || "", // ← Handle undefined
  },
];
```

### Issue: Tabs not persisting on refresh

**Possible Causes:**

1. Routes not configured correctly
2. Session storage cleared
3. Module ID changed

**Solution:**

```typescript
// Ensure routes match exactly
routes: {
  base: "/contacts",
  record: (recordId) => `/contacts/${recordId}`, // ← Must match route config
}

// In router
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />
```

### Issue: TypeScript errors

**Common Errors:**

```typescript
// Error: Type 'string' is not assignable to type 'TRecord'
// Solution: Ensure generic type is correct
export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  //                                                    ^^^^^^^ Must match your type
  // ...
};

// Error: Property 'id' does not exist on type 'TRecord'
// Solution: Add type assertion or use getRecordId
const recordId = module.listPane.getRecordId(record); // ✓ Correct
const recordId = record.id; // ✗ May fail if TRecord doesn't have 'id'
```

### Issue: Performance problems with large datasets

**Solutions:**

1. **Implement pagination:**

```typescript
export function ContactsPage() {
  const [page, setPage] = useState(1);
  const { data } = useContactsQuery({ page, limit: 50 });

  return <LVEWorkspace module={contactsModule} records={data ?? []} />;
}
```

2. **Use virtual scrolling:**

```typescript
listPaneOverride: (props) => (
  <VirtualList
    items={props.filteredRecords}
    height={600}
    itemHeight={60}
    renderItem={(record) => <RecordItem record={record} />}
  />
)
```

3. **Debounce search:**

```typescript
// Already handled by LVEWorkspace, but you can add server-side search
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 300);

const { data } = useContactsQuery({ search: debouncedSearch });
```

---

## Next Steps

1. **Review Examples**: Check `moduleRegistry.tsx` for real-world examples
2. **Read API Docs**: See `README.md` for complete API reference
3. **Check Migration Guide**: See `MIGRATION.md` if migrating from legacy components
4. **Run Tests**: See test examples in `__tests__/` directory
5. **Join Discussion**: Ask questions in team channels

## Additional Resources

- [README.md](./README.md) - Complete API documentation
- [QUICK_START.md](./QUICK_START.md) - 5-minute quick start
- [MIGRATION.md](./MIGRATION.md) - Legacy migration guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture overview
- [types.ts](../types.ts) - TypeScript type definitions

---

**Questions or Issues?**

If you encounter problems not covered in this guide:

1. Check the troubleshooting section above
2. Review existing modules in `moduleRegistry.tsx`
3. Check test files for usage patterns
4. Consult with the team

**Happy coding! 🚀**
