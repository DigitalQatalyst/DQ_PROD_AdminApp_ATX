# ATX LVE Workspace Framework

Reusable, API-first workspace shell for ATX transactional modules.

## 📚 Documentation Quick Links

**New to LVE Workspace?** Start here:

- 🚀 **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- 📖 **[COMPLETE_MODULE_GUIDE.md](./docs/COMPLETE_MODULE_GUIDE.md)** - Comprehensive guide (800+ lines)
- 🎯 **[SIDEBAR_INTEGRATION.md](./docs/SIDEBAR_INTEGRATION.md)** - Add to sidebar navigation
- 📄 **[PAGINATION.md](./docs/PAGINATION.md)** - Built-in pagination guide

**Reference & Migration:**

- 📋 **[types.ts](./types.ts)** - TypeScript definitions with JSDoc
- 🔄 **[MIGRATION.md](./MIGRATION.md)** - Migrate from legacy components
- 🏗️ **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Architecture overview

---

## Design Philosophy

This framework is designed with an API-first approach:

- Records come from external APIs through controlled runtime props
- Loading, empty, and error states are driven by API state
- Local persistence is optional fallback behavior, not the primary workflow
- Module config stays static while API data stays runtime-controlled

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

```tsx
export function ContactsPage() {
  const { data, isLoading } = useContactsQuery();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []} // Pass all records - pagination handled automatically
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

### Related Documentation

- [PAGINATION.md](./docs/PAGINATION.md) - Detailed pagination documentation
- [COMPLETE_MODULE_GUIDE.md](./docs/COMPLETE_MODULE_GUIDE.md) - Section 8: Built-In Pagination

## What This Framework Renders

- Global shell integration via `AppShell`
- Module navigation
- Queue/list pane
- Work window
- Contextual pop pane
- Module tabs
- Record tabs
- Route-backed workspace recovery

The shell is generic. Module-specific behavior belongs in config and runtime handlers, not in layout markup.

## Recommended Onboarding Order

1. **Read [COMPLETE_MODULE_GUIDE.md](./docs/COMPLETE_MODULE_GUIDE.md)** for step-by-step instructions
2. Register the module config
3. Expose it through the module registry (see [SIDEBAR_INTEGRATION.md](./docs/SIDEBAR_INTEGRATION.md))

4. Mount `LVEWorkspace` with that module.
5. Pass runtime records and API handlers.

## 1. Module Registration

The framework starts from module registration, not from custom shell markup.

Reference:

- [moduleRegistry.tsx](/d:/Projects/DQ/ATX/src/components/layout/workspace/moduleRegistry.tsx)

Each module is a static `LVEWorkspaceModuleConfig<TRecord>` object:

```tsx
import { Building2 } from "lucide-react";
import type { LVEWorkspaceModuleConfig } from "@/components/layout/workspace";

interface ExampleRecord {
  id: string;
  name: string;
  owner: string;
  status: string;
}

export const exampleModule: LVEWorkspaceModuleConfig<ExampleRecord> = {
  metadata: {
    id: "examples",
    label: "Examples",
    singularLabel: "Example",
    pluralLabel: "Examples",
    route: "/examples",
    icon: Building2,
    moduleType: "record",
  },
  menu: {
    order: 40,
    visible: true,
    requiredSegments: ["internal"],
  },
  routes: {
    base: "/examples",
    record: (recordId) => `/examples/${recordId}`,
  },
  listPane: {
    records: [],
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        render: (record) => record.name,
      },
      {
        id: "owner",
        label: "Owner",
        slot: "secondary",
        render: (record) => record.owner,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        render: (record) => record.status,
      },
    ],
  },
  workWindow: {
    title: "Example Workspace",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "owner", label: "Owner", render: () => record.owner },
        ],
      },
    ],
  },
  popPane: {
    title: "Example Context",
    getSections: (record) => [
      {
        id: "context",
        title: "Context",
        items: [{ id: "status", label: "Status", render: () => record.status }],
      },
    ],
  },
};
```

After defining the module, add it to the registry exports used by routing and menu rendering.

## 2. Module Contract

Every module must satisfy:

```ts
interface LVEWorkspaceModuleConfig<TRecord> {
  metadata: LVEModuleMetadata;
  menu: LVEMenuRegistration;
  routes: LVEWorkspaceTabRouteConfig;
  listPane: LVEListPaneConfig<TRecord>;
  workWindow: LVEWorkWindowConfig<TRecord>;
  popPane: LVEPopPaneConfig<TRecord>;
  tabs?: LVEWorkspaceTabsConfig;
  crud?: LVECrudConfig<TRecord>;
  listPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
  workPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
  popPaneOverride?: (props: LVEWorkspaceOverrideProps<TRecord>) => ReactNode;
}
```

## 3. Mount The Workspace

```tsx
import {
  LVEWorkspace,
  type LVEWorkspaceProps,
  type LVEWorkspaceModuleConfig,
} from "@/components/layout/workspace";
```

Basic usage:

```tsx
import { LVEWorkspace, contactsModule } from "@/components/layout/workspace";

export function ContactsPage() {
  return <LVEWorkspace module={contactsModule} />;
}
```

## 4. Pass Runtime Data And API Handlers (Recommended)

The recommended integration pattern is API-first. Keep module config static and pass records and handlers at runtime:

```tsx
import { LVEWorkspace, contactsModule } from "@/components/layout/workspace";

export function ContactsPage() {
  const { data, isLoading, error } = useContactsQuery();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}
      state={{
        listPane: {
          isLoading,
          errorMessage: error ? "Unable to load contacts." : undefined,
        },
      }}
      onCreateRecord={async ({ values }) => api.contacts.create(values)}
      onUpdateRecord={async ({ recordId, values }) =>
        api.contacts.update(recordId, values)
      }
      onDeleteRecord={async ({ recordId }) => api.contacts.remove(recordId)}
      persistLocalRecords={false}
    />
  );
}
```

This is the primary integration path. Local persistence should only be used for demos or compatibility scenarios.

## 5. `LVEWorkspace` Runtime Props

`module` is the only required prop. All other props are optional but recommended for API-first integration.

```ts
interface LVEWorkspaceProps<TRecord> {
  module: LVEWorkspaceModuleConfig<TRecord>;
  records?: TRecord[];
  state?: LVEWorkspaceRuntimeState;
  persistLocalRecords?: boolean;
  onCreateRecord?: (
    context: LVECreateRecordHandlerContext<TRecord>,
  ) => Promise<TRecord> | TRecord;
  onUpdateRecord?: (
    context: LVEUpdateRecordHandlerContext<TRecord>,
  ) => Promise<TRecord> | TRecord;
  onDeleteRecord?: (
    context: LVEDeleteRecordHandlerContext<TRecord>,
  ) => Promise<void> | void;
}
```

### Complete Props Reference

#### `module: LVEWorkspaceModuleConfig<TRecord>` (required)

Static module configuration that defines the structure, behavior, and appearance of the workspace.

**Type**: `LVEWorkspaceModuleConfig<TRecord>`

**Purpose**: Provides the complete declarative configuration for how the workspace should render and behave. This includes metadata, routing, pane structure, actions, and CRUD configuration.

**Usage**:

```tsx
<LVEWorkspace module={contactsModule} />
```

**See**: Module Configuration section below for complete field reference.

---

#### `records: TRecord[]` (optional, recommended)

#### `records: TRecord[]` (optional, recommended)

Controlled record dataset from external API. This is the primary data source for API-backed modules.

**Type**: `TRecord[]` (array of your record type)

**Default**: Uses `module.listPane.records` if not provided

**Purpose**: Provides the authoritative record data for the workspace. When provided, the workspace treats records as controlled and updates only when this prop changes.

**Behavior**:

- When provided: Records are controlled by parent component
- When omitted: Uses static records from `module.listPane.records`
- Updates trigger re-render of list pane and work window
- Original array is never mutated (immutable)

**API-first integration example**:

```tsx
const { data } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  persistLocalRecords={false}
/>;
```

**When to use**:

- ✅ API-backed modules (recommended)
- ✅ Real-time data from external sources
- ✅ Server-side filtered/sorted data
- ❌ Static demo data (use `module.listPane.records` instead)

---

#### `state: LVEWorkspaceRuntimeState` (optional, recommended)

Runtime UI state overrides for loading, error, and empty states. This is the primary way to communicate API state to the workspace.

**Type**:

```ts
interface LVEWorkspaceRuntimeState {
  listPane?: Partial<LVEListStateConfig>;
  workWindow?: Partial<LVEWorkWindowStateConfig>;
  popPane?: Partial<LVEPopPaneStateConfig>;
}

interface LVEListStateConfig {
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}

interface LVEWorkWindowStateConfig {
  mode?: "create" | "edit" | "detail";
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}

interface LVEPopPaneStateConfig {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}
```

**Purpose**: Allows dynamic control of UI states without recreating the module config. Runtime state values take precedence over config values.

**Behavior**:

- Merged with module config at render time
- Does not mutate original config
- Each pane has independent state
- Updates trigger immediate re-render

**API-first integration example**:

```tsx
const { data, isLoading, error } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  state={{
    listPane: {
      isLoading,
      errorMessage: error ? "Failed to load contacts" : undefined,
    },
    workWindow: {
      isLoading: detailsLoading,
    },
    popPane: {
      isLoading: contextLoading,
    },
  }}
  persistLocalRecords={false}
/>;
```

**Common patterns**:

```tsx
// Loading state
state={{ listPane: { isLoading: true } }}

// Error state
state={{ listPane: { errorMessage: "Failed to load data" } }}

// Empty state override
state={{
  listPane: {
    emptyTitle: "No contacts yet",
    emptyDescription: "Create your first contact to get started"
  }
}}

// Multiple panes
state={{
  listPane: { isLoading: listLoading },
  workWindow: { isLoading: detailsLoading },
  popPane: { errorMessage: contextError }
}}
```

---

#### `persistLocalRecords: boolean` (optional)

Controls whether locally managed records are persisted to `localStorage`.

**Type**: `boolean`

**Default**:

- `false` when `records` prop is provided (controlled mode)
- `true` when `records` prop is omitted (uncontrolled mode)

**Purpose**: Determines if record data should be saved to browser localStorage for persistence across page refreshes.

**Behavior**:

- When `true`: Records are saved to localStorage on every change
- When `false`: No localStorage persistence occurs
- Storage key format: `atx:lve-workspace-records::{tenantId}::{streamId}::{moduleId}`

**API-backed modules (recommended)**:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  persistLocalRecords={false} // Explicitly disable
/>
```

**Demo/prototype modules**:

```tsx
<LVEWorkspace
  module={demoModule}
  persistLocalRecords={true} // Enable for local-only demos
/>
```

**When to use**:

- ✅ Set to `false` for all API-backed modules
- ✅ Set to `true` only for demos, prototypes, or testing
- ❌ Never use `true` in production with real user data

**Important**: Local persistence is not suitable for multi-user production systems. Always use API-backed data with `persistLocalRecords={false}` for production modules.

---

#### `onCreateRecord: (context) => Promise<TRecord> | TRecord` (optional, recommended)

Runtime create handler for API-backed record creation.

**Type**: `(context: LVECreateRecordHandlerContext<TRecord>) => Promise<TRecord> | TRecord`

**Context Type**:

```ts
interface LVECreateRecordHandlerContext<TRecord> {
  moduleId: string; // ID of the module creating the record
  values: Record<string, string>; // Form field values from create modal
  records: TRecord[]; // Current list of records
}
```

**Purpose**: Connects the create operation to your API endpoint. When a user submits the create form, this handler is called to persist the new record.

**Behavior**:

- Called when user submits create modal
- Must return the created record (with server-generated ID)
- Returned record is added to the workspace
- New record tab opens automatically
- Supports both sync and async operations
- Loading state displayed during async operations
- Errors are caught and displayed in modal

**API-first integration example**:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  onCreateRecord={async ({ moduleId, values, records }) => {
    // Call your API
    const newRecord = await api.contacts.create(values);

    // Optionally invalidate queries
    queryClient.invalidateQueries(["contacts"]);

    // Return the created record
    return newRecord;
  }}
  persistLocalRecords={false}
/>
```

**With error handling**:

```tsx
onCreateRecord={async ({ values }) => {
  try {
    const newRecord = await api.contacts.create(values);
    return newRecord;
  } catch (error) {
    // Error is automatically displayed in modal
    throw new Error('Failed to create contact: ' + error.message);
  }
}}
```

**Fallback**: If not provided, uses `module.crud.create.createRecord` for local-only behavior.

---

#### `onUpdateRecord: (context) => Promise<TRecord> | TRecord` (optional, recommended)

Runtime update handler for API-backed record updates.

**Type**: `(context: LVEUpdateRecordHandlerContext<TRecord>) => Promise<TRecord> | TRecord`

**Context Type**:

```ts
interface LVEUpdateRecordHandlerContext<TRecord> {
  moduleId: string; // ID of the module updating the record
  record: TRecord; // The original record being updated
  recordId: string; // ID of the record being updated
  values: Record<string, string>; // Form field values from edit modal
  records: TRecord[]; // Current list of records
}
```

**Purpose**: Connects the update operation to your API endpoint. When a user submits the edit form, this handler is called to persist the changes.

**Behavior**:

- Called when user submits edit modal
- Must return the updated record
- Returned record replaces the original in workspace
- Record tab remains open
- Supports both sync and async operations
- Loading state displayed during async operations
- Errors are caught and displayed in modal

**API-first integration example**:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  onUpdateRecord={async ({ recordId, values, record }) => {
    // Call your API
    const updatedRecord = await api.contacts.update(recordId, values);

    // Optionally invalidate queries
    queryClient.invalidateQueries(["contacts"]);

    // Return the updated record
    return updatedRecord;
  }}
  persistLocalRecords={false}
/>
```

**With optimistic updates**:

```tsx
onUpdateRecord={async ({ record, recordId, values }) => {
  // Optimistically update UI
  const optimisticRecord = { ...record, ...values };

  try {
    // Call API
    const updatedRecord = await api.contacts.update(recordId, values);
    return updatedRecord;
  } catch (error) {
    // Error handling - workspace will show error
    throw new Error('Failed to update contact');
  }
}}
```

**Fallback**: If not provided, uses `module.crud.edit.updateRecord` for local-only behavior.

---

#### `onDeleteRecord: (context) => Promise<void> | void` (optional, recommended)

Runtime delete handler for API-backed record deletion.

**Type**: `(context: LVEDeleteRecordHandlerContext<TRecord>) => Promise<void> | void`

**Context Type**:

```ts
interface LVEDeleteRecordHandlerContext<TRecord> {
  moduleId: string; // ID of the module deleting the record
  record: TRecord; // The record being deleted
  recordId: string; // ID of the record being deleted
  records: TRecord[]; // Current list of records
}
```

**Purpose**: Connects the delete operation to your API endpoint. When a user confirms deletion, this handler is called to remove the record.

**Behavior**:

- Called when user confirms delete modal
- Does not need to return data
- Record is removed from workspace automatically
- Record tab closes automatically
- Navigates to next available tab or module base
- Supports both sync and async operations
- Loading state displayed during async operations
- Errors are caught and displayed in modal

**API-first integration example**:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  onDeleteRecord={async ({ recordId, record }) => {
    // Call your API
    await api.contacts.delete(recordId);

    // Optionally invalidate queries
    queryClient.invalidateQueries(["contacts"]);

    // No return value needed
  }}
  persistLocalRecords={false}
/>
```

**With confirmation logging**:

```tsx
onDeleteRecord={async ({ recordId, record, moduleId }) => {
  console.log(`Deleting ${record.name} from ${moduleId}`);

  try {
    await api.contacts.delete(recordId);
    console.log('Delete successful');
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('Failed to delete contact');
  }
}}
```

**Fallback**: If not provided, performs local-only deletion without API calls.

---

## 6. Module Configuration Reference

}}
persistLocalRecords={false}
/>

````

If not provided, the workspace falls back to `module.crud.create.createRecord` for local-only behavior.

### `onUpdateRecord`

Optional runtime edit handler for API-backed record updates.

```ts
interface LVEUpdateRecordHandlerContext<TRecord> {
  moduleId: string;
  record: TRecord;
  recordId: string;
  values: Record<string, string>;
  records: TRecord[];
}
````

- If provided, the shell awaits this handler.
- The handler must return the updated record.
- The returned record replaces the active record in queue/workspace state.

API-first integration example:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  onUpdateRecord={async ({ recordId, values }) => {
    const updatedRecord = await api.contacts.update(recordId, values);
    return updatedRecord;
  }}
  persistLocalRecords={false}
/>
```

If not provided, the workspace falls back to `module.crud.edit.updateRecord` for local-only behavior.

### `onDeleteRecord`

Optional runtime delete handler for API-backed record deletion.

```ts
interface LVEDeleteRecordHandlerContext<TRecord> {
  moduleId: string;
  record: TRecord;
  recordId: string;
  records: TRecord[];
}
```

- If provided, the shell awaits this handler.
- The handler does not need to return data.
- The shell removes the deleted record, closes its tab, and navigates to the next valid route.

API-first integration example:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  onDeleteRecord={async ({ recordId }) => {
    await api.contacts.delete(recordId);
  }}
  persistLocalRecords={false}
/>
```

If not provided, the workspace performs local-only deletion without API calls.

## Module Sections

### `metadata`

```ts
interface LVEModuleMetadata {
  id: string;
  label: string;
  singularLabel: string;
  pluralLabel: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleType: "record" | "workflow" | "parent-workspace";
}
```

Required for labels, routing, menu registration, and workspace semantics.

### `menu`

```ts
interface LVEMenuRegistration {
  order: number;
  visible?: boolean;
  requiredSegments?: string[];
}
```

Controls top-level module navigation only.

### `routes`

```ts
interface LVEWorkspaceTabRouteConfig {
  base: string;
  record: (recordId: string) => string;
}
```

Required because record tabs are route-backed.

Expected examples:

- `/contacts`
- `/contacts/:recordId`
- `/leads`
- `/leads/:recordId`
- `/accounts`
- `/accounts/:recordId`

### `tabs`

```ts
interface LVEWorkspaceTabsConfig {
  routeBacked?: boolean;
  persist?: boolean;
  supportDirtyState?: boolean;
  moduleTabLabel?: string;
  recordTabLabel?: string;
}
```

These are display and capability flags for the shell tab system.

### `listPane`

```ts
interface LVEListPaneConfig<TRecord> {
  records: TRecord[];
  getRecordId: (record: TRecord) => string;
  getRecordLabel: (record: TRecord) => string;
  columns: LVEListColumn<TRecord>[];
  resultCountLabel?: (count: number) => string;
  viewPresets?: LVEListPreset[];
  queuePresets?: LVEListPreset[];
  bulkActions?: LVEActionDefinition<TRecord>[];
  listActions?: LVEActionDefinition<TRecord>[];
  searchPlaceholder?: string;
  filterTriggerLabel?: string;
  sortTriggerLabel?: string;
  viewsTriggerLabel?: string;
  getSearchText?: (record: TRecord) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}
```

Required fields:

- `records`
- `getRecordId`
- `getRecordLabel`
- `columns`

Notes:

- search is active
- filter/sort/view triggers are structural placeholders unless you implement behavior outside the shell
- queue remains visible while the work window is active

### `workWindow`

```ts
interface LVEWorkWindowConfig<TRecord> {
  title: string;
  subtitle?: string;
  getSelectedRecordTitle?: (record: TRecord) => ReactNode;
  getSelectedRecordSubtitle?: (record: TRecord) => ReactNode;
  getSelectedRecordMeta?: (record: TRecord) => ReactNode;
  getSections: (record: TRecord) => LVEWorkSection<TRecord>[];
  innerTabs?: LVEInnerWorkspaceTab<TRecord>[];
  moduleActions?: LVEActionDefinition<TRecord>[];
  recordActions?: LVEActionDefinition<TRecord>[];
  lifecycleActions?: LVEActionDefinition<TRecord>[];
  mode?: "create" | "edit" | "detail";
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}
```

Required fields:

- `title`
- `getSections`

Notes:

- `moduleActions` are workspace-level actions
- `recordActions` are selected-record actions
- `lifecycleActions` support workflow modules like Leads
- `innerTabs` support parent-workspace modules like Accounts

### `popPane`

```ts
interface LVEPopPaneConfig<TRecord> {
  title: string;
  subtitle?: string;
  getSections: (record: TRecord) => LVEContextSection<TRecord>[];
  quickActions?: LVEActionDefinition<TRecord>[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
}
```

Required fields:

- `title`
- `getSections`

Notes:

- the pop pane is contextual and visually secondary
- it is collapsible by default unless disabled

### `crud`

Optional, but required if you want the shared create/edit/delete modals.

```ts
interface LVECrudConfig<TRecord> {
  create?: LVECrudCreateConfig<TRecord>;
  edit?: LVECrudEditConfig<TRecord>;
  delete?: LVECrudDeleteConfig<TRecord>;
}
```

### Create config

```ts
interface LVECrudCreateConfig<TRecord> {
  title?: string;
  description?: string;
  submitLabel?: string;
  fields: LVECrudFieldDefinition<TRecord>[];
  createRecord: (
    values: Record<string, string>,
    context: { records: TRecord[] },
  ) => TRecord;
}
```

### Edit config

```ts
interface LVECrudEditConfig<TRecord> {
  title?: string | ((record: TRecord) => string);
  description?: string | ((record: TRecord) => string);
  submitLabel?: string;
  fields: LVECrudFieldDefinition<TRecord>[];
  updateRecord: (record: TRecord, values: Record<string, string>) => TRecord;
}
```

### Delete config

```ts
interface LVECrudDeleteConfig<TRecord> {
  title?: string | ((record: TRecord) => string);
  description?: string | ((record: TRecord) => string);
  confirmLabel?: string;
}
```

### CRUD field definition

```ts
interface LVECrudFieldDefinition<TRecord> {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  description?: string;
  required?: boolean;
  rows?: number;
  colSpan?: 1 | 2;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  getValue?: (record: TRecord) => string;
}
```

## Action Handling

Actions are declared in config and executed by the shared workspace.

```ts
interface LVEActionDefinition<TRecord> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost";
  intent?: "create" | "edit" | "delete";
  disabled?: boolean;
  onClick?: (context: LVEActionContext<TRecord>) => void;
}
```

Rules:

- `intent: "create"` opens the shared create modal
- `intent: "edit"` opens the shared edit modal for the selected record
- `intent: "delete"` opens the shared delete modal for the selected record
- actions without `intent` use `onClick`

## Overrides

Use only when config is not enough.

```ts
listPaneOverride?: (props) => ReactNode;
workPaneOverride?: (props) => ReactNode;
popPaneOverride?: (props) => ReactNode;
```

Override props receive:

```ts
interface LVEWorkspaceOverrideProps<TRecord> {
  module: LVEWorkspaceModuleConfig<TRecord>;
  filteredRecords: TRecord[];
  selectedRecord?: TRecord;
  selectedRecordId?: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectRecord: (record: TRecord) => void;
}
```

Preferred path remains config + runtime props, not overrides.

## Route And Persistence Behavior

The shell currently preserves:

- route-backed record tabs
- module-to-module workspace recovery
- pop-pane collapse state
- active tab state per tenant and stream

Behavior rules:

- current URL takes priority over stored tab state
- returning to a module restores the last valid record tab when one exists
- selecting the module root tab explicitly resets the stored active workspace for that module
- closing a record tab falls back to the previous valid tab or module root
- refreshing a route restores the active workspace when the record still exists
- deleting a record removes its tab and navigates to a valid fallback route

## Recommended API Integration Pattern

Use static module config for structure and runtime props for live data.

```tsx
<LVEWorkspace
  module={accountsModule}
  records={accounts}
  state={{
    listPane: {
      isLoading: accountsLoading,
      errorMessage: accountsError ? "Unable to load accounts." : undefined,
    },
    workWindow: {
      isLoading: accountDetailsLoading,
    },
    popPane: {
      isLoading: accountContextLoading,
    },
  }}
  onCreateRecord={async ({ values }) => api.accounts.create(values)}
  onUpdateRecord={async ({ recordId, values }) =>
    api.accounts.update(recordId, values)
  }
  onDeleteRecord={async ({ recordId }) => api.accounts.delete(recordId)}
  persistLocalRecords={false}
/>
```

## Integration Examples for All Module Types

### Record Module Example (Contacts)

Standard CRUD operations on individual records.

**Module Config**:

```tsx
import { Users } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
}

export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  metadata: {
    id: "contacts",
    label: "Contacts",
    singularLabel: "Contact",
    pluralLabel: "Contacts",
    route: "/contacts",
    icon: Users,
    moduleType: "record", // Standard record module
  },
  menu: {
    order: 10,
    visible: true,
  },
  routes: {
    base: "/contacts",
    record: (recordId) => `/contacts/${recordId}`,
  },
  listPane: {
    records: [],
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        render: (record) => record.name,
      },
      {
        id: "email",
        label: "Email",
        slot: "secondary",
        render: (record) => record.email,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        render: (record) => record.status,
      },
    ],
    listActions: [
      {
        id: "create",
        label: "New Contact",
        intent: "create",
        variant: "primary",
      },
    ],
  },
  workWindow: {
    title: "Contact Details",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        columns: 2,
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "email", label: "Email", render: () => record.email },
          { id: "phone", label: "Phone", render: () => record.phone },
          { id: "company", label: "Company", render: () => record.company },
        ],
      },
    ],
    recordActions: [
      { id: "edit", label: "Edit", intent: "edit" },
      { id: "delete", label: "Delete", intent: "delete", variant: "outline" },
    ],
  },
  popPane: {
    title: "Context",
    getSections: (record) => [
      {
        id: "status",
        title: "Status",
        items: [{ id: "status", label: "Status", render: () => record.status }],
      },
    ],
  },
  crud: {
    create: {
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          id: "email",
          name: "email",
          label: "Email",
          type: "email",
          required: true,
        },
        { id: "phone", name: "phone", label: "Phone", type: "tel" },
        { id: "company", name: "company", label: "Company", type: "text" },
      ],
      createRecord: (values) =>
        ({
          id: `temp-${Date.now()}`,
          ...values,
          status: "active",
        }) as Contact,
    },
    edit: {
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          getValue: (r) => r.name,
        },
        {
          id: "email",
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          getValue: (r) => r.email,
        },
      ],
      updateRecord: (record, values) => ({ ...record, ...values }),
    },
    delete: {
      title: (record) => `Delete ${record.name}?`,
      description: "This action cannot be undone.",
    },
  },
};
```

**Page Component**:

```tsx
import { LVEWorkspace } from "@/components/layout/workspace";
import { contactsModule } from "@/components/layout/workspace/moduleRegistry";
import {
  useContactsQuery,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/useContacts";

export function ContactsPage() {
  const { data, isLoading, error } = useContactsQuery();
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
```

---

### Workflow Module Example (Leads)

Lifecycle-aware workflows with stage transitions.

**Module Config**:

```tsx
import { Target } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string;
  stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  value: number;
}

export const leadsModule: LVEWorkspaceModuleConfig<Lead> = {
  metadata: {
    id: "leads",
    label: "Leads",
    singularLabel: "Lead",
    pluralLabel: "Leads",
    route: "/leads",
    icon: Target,
    moduleType: "workflow", // Workflow module with lifecycle
  },
  menu: {
    order: 20,
    visible: true,
  },
  routes: {
    base: "/leads",
    record: (recordId) => `/leads/${recordId}`,
  },
  listPane: {
    records: [],
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        render: (record) => record.name,
      },
      {
        id: "company",
        label: "Company",
        slot: "secondary",
        render: (record) => record.company,
      },
      {
        id: "stage",
        label: "Stage",
        slot: "badge",
        render: (record) => record.stage,
      },
    ],
  },
  workWindow: {
    title: "Lead Details",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "company", label: "Company", render: () => record.company },
          { id: "value", label: "Value", render: () => `$${record.value}` },
          { id: "stage", label: "Stage", render: () => record.stage },
        ],
      },
    ],
    // Lifecycle actions for workflow modules
    lifecycleActions: [
      {
        id: "qualify",
        label: "Qualify",
        variant: "primary",
        onClick: ({ selectedRecord }) => {
          // Handle stage transition
          console.log("Qualifying lead:", selectedRecord);
        },
      },
      {
        id: "send-proposal",
        label: "Send Proposal",
        variant: "secondary",
        onClick: ({ selectedRecord }) => {
          console.log("Sending proposal:", selectedRecord);
        },
      },
    ],
    recordActions: [
      { id: "edit", label: "Edit", intent: "edit" },
      { id: "delete", label: "Delete", intent: "delete", variant: "outline" },
    ],
  },
  popPane: {
    title: "Lead Context",
    getSections: (record) => [
      {
        id: "stage",
        title: "Stage",
        items: [
          { id: "stage", label: "Current Stage", render: () => record.stage },
        ],
      },
    ],
  },
};
```

**Page Component**:

```tsx
export function LeadsPage() {
  const { data, isLoading, error } = useLeadsQuery();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  return (
    <LVEWorkspace
      module={leadsModule}
      records={data ?? []}
      state={{
        listPane: {
          isLoading,
          errorMessage: error ? "Failed to load leads" : undefined,
        },
      }}
      onCreateRecord={async ({ values }) => {
        const newLead = await createMutation.mutateAsync(values);
        return newLead;
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
```

---

### Parent-Workspace Module Example (Accounts)

Supports inner tabs for nested workspaces.

**Module Config**:

```tsx
import { Building2 } from "lucide-react";

interface Account {
  id: string;
  name: string;
  industry: string;
  revenue: number;
}

export const accountsModule: LVEWorkspaceModuleConfig<Account> = {
  metadata: {
    id: "accounts",
    label: "Accounts",
    singularLabel: "Account",
    pluralLabel: "Accounts",
    route: "/accounts",
    icon: Building2,
    moduleType: "parent-workspace", // Parent workspace with inner tabs
  },
  menu: {
    order: 30,
    visible: true,
  },
  routes: {
    base: "/accounts",
    record: (recordId) => `/accounts/${recordId}`,
  },
  listPane: {
    records: [],
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        render: (record) => record.name,
      },
      {
        id: "industry",
        label: "Industry",
        slot: "secondary",
        render: (record) => record.industry,
      },
    ],
  },
  workWindow: {
    title: "Account Details",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "industry", label: "Industry", render: () => record.industry },
          {
            id: "revenue",
            label: "Revenue",
            render: () => `$${record.revenue}M`,
          },
        ],
      },
    ],
    // Inner tabs for parent-workspace modules
    innerTabs: [
      {
        id: "contacts",
        label: "Contacts",
        getSections: (record) => [
          {
            id: "contacts-list",
            title: "Related Contacts",
            fields: [
              {
                id: "info",
                label: "Info",
                render: () => "Contact list would go here",
              },
            ],
          },
        ],
      },
      {
        id: "deals",
        label: "Deals",
        getSections: (record) => [
          {
            id: "deals-list",
            title: "Related Deals",
            fields: [
              {
                id: "info",
                label: "Info",
                render: () => "Deals list would go here",
              },
            ],
          },
        ],
      },
      {
        id: "activities",
        label: "Activities",
        getSections: (record) => [
          {
            id: "activities-list",
            title: "Recent Activities",
            fields: [
              {
                id: "info",
                label: "Info",
                render: () => "Activities would go here",
              },
            ],
          },
        ],
      },
    ],
    recordActions: [
      { id: "edit", label: "Edit", intent: "edit" },
      { id: "delete", label: "Delete", intent: "delete", variant: "outline" },
    ],
  },
  popPane: {
    title: "Account Context",
    getSections: (record) => [
      {
        id: "info",
        title: "Information",
        items: [
          { id: "industry", label: "Industry", render: () => record.industry },
        ],
      },
    ],
  },
};
```

**Page Component**:

```tsx
export function AccountsPage() {
  const { data, isLoading, error } = useAccountsQuery();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  return (
    <LVEWorkspace
      module={accountsModule}
      records={data ?? []}
      state={{
        listPane: {
          isLoading,
          errorMessage: error ? "Failed to load accounts" : undefined,
        },
      }}
      onCreateRecord={async ({ values }) => {
        const newAccount = await createMutation.mutateAsync(values);
        return newAccount;
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
```

---

## API-First Design Contract

### Primary Integration Path

The workspace is designed for API-backed modules:

1. Module config defines structure (static)
2. `records` prop provides data (runtime, controlled)
3. `state` prop drives loading/error UI (runtime)
4. CRUD handlers connect to API endpoints (runtime)
5. Local persistence is disabled (`persistLocalRecords={false}`)

### When to Use Local Persistence

Local persistence should only be used for:

- Demo modules without API backends
- Prototyping and early development
- Testing scenarios without live APIs
- Compatibility during migration from legacy patterns

### Config vs Runtime Props

Keep these concerns separate:

**Module Config (Static)**

- Structure and layout
- Field definitions
- Section organization
- Column configuration
- Action definitions
- Route patterns

**Runtime Props (Dynamic)**

- Actual record data
- Loading states
- Error messages
- API handlers
- Empty state overrides

### Migration from Legacy Patterns

If migrating from `src/components/lve` or local-only patterns:

1. Extract module config to canonical format
2. Replace local state with API queries
3. Add `records` prop with API data
4. Add `state` prop for loading/error
5. Add CRUD handlers for API operations
6. Set `persistLocalRecords={false}`
7. Remove local storage dependencies

The legacy `src/components/lve` path should not be used for new modules.

## Current Example Modules

Reference implementations live in [moduleRegistry.tsx](/d:/Projects/DQ/ATX/src/components/layout/workspace/moduleRegistry.tsx):

- Contacts: record module
- Leads: workflow module
- Accounts: parent-workspace module with inner tabs

## Best Practices

- Keep module config static and declarative.
- Pass API data through `records`, not by mutating config.
- Pass loading and error state through `state`.
- Set `persistLocalRecords={false}` for API-backed pages.
- Use CRUD runtime handlers for server writes.
- Keep business rules outside the shell.
- Prefer config over pane overrides.
- **Pagination**: Load all records for client-side pagination (< 1,000 records); use server-side pagination for larger datasets.
- **Testing**: Test with 50+ sample records to verify pagination works correctly.
- **Performance**: Monitor performance with realistic data volumes; optimize render functions.

## Troubleshooting

### Records Not Updating

**Problem**: Records don't update when API data changes.

**Solution**: Ensure `records` prop is controlled and updates when API data changes:

```tsx
const { data } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []} // Updates when data changes
  persistLocalRecords={false}
/>;
```

**Common mistakes**:

- Passing static array instead of query data
- Not spreading or recreating array when data changes
- Using local state instead of query state

---

### Local Storage Still Being Used

**Problem**: Records are being saved to localStorage even with API integration.

**Solution**: Explicitly set `persistLocalRecords={false}`:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  persistLocalRecords={false} // Required for API-first
/>
```

**Why this happens**:

- Default is `true` when `records` is omitted
- Must explicitly disable for controlled records

---

### CRUD Operations Not Working

**Problem**: Create/update/delete operations fail or don't call API.

**Solution**: Ensure handlers are async and return correct values:

```tsx
// CREATE: Must return the created record
onCreateRecord={async ({ values }) => {
  const newRecord = await api.contacts.create(values);
  return newRecord;  // Required!
}}

// UPDATE: Must return the updated record
onUpdateRecord={async ({ recordId, values }) => {
  const updated = await api.contacts.update(recordId, values);
  return updated;  // Required!
}}

// DELETE: No return value needed
onDeleteRecord={async ({ recordId }) => {
  await api.contacts.delete(recordId);
  // No return
}}
```

**Common mistakes**:

- Forgetting to return the record from create/update
- Not awaiting async operations
- Not handling errors properly

---

### Route Recovery Not Working

**Problem**: Tabs don't restore after page refresh.

**Solution**: Ensure both base and record routes are defined:

```tsx
// In your router
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />

// In module config
routes: {
  base: "/contacts",
  record: (recordId) => `/contacts/${recordId}`,
}
```

**Common mistakes**:

- Missing record route in router
- Route pattern doesn't match config
- Using different component for record route

---

### Loading States Not Showing

**Problem**: Loading indicators don't appear during API calls.

**Solution**: Pass loading state through `state` prop:

```tsx
const { data, isLoading } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  state={{
    listPane: { isLoading }, // Shows loading in list
    workWindow: { isLoading: detailsLoading }, // Shows loading in work pane
  }}
  persistLocalRecords={false}
/>;
```

**Common mistakes**:

- Not passing `isLoading` to state prop
- Passing loading state to wrong pane
- Using local loading state instead of query loading state

---

### Error Messages Not Displaying

**Problem**: API errors don't show in the UI.

**Solution**: Pass error messages through `state` prop:

```tsx
const { data, error } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  state={{
    listPane: {
      errorMessage: error ? "Failed to load contacts" : undefined,
    },
  }}
  persistLocalRecords={false}
/>;
```

**For CRUD errors**: Throw errors in handlers - they're automatically displayed:

```tsx
onCreateRecord={async ({ values }) => {
  try {
    return await api.contacts.create(values);
  } catch (error) {
    throw new Error('Failed to create contact: ' + error.message);
  }
}}
```

---

### Search Not Working

**Problem**: Search input doesn't filter records.

**Solution**: Ensure `getSearchText` is defined in listPane config:

```tsx
listPane: {
  // ... other config
  getSearchText: (record) => `${record.name} ${record.email} ${record.company}`,
  searchPlaceholder: "Search contacts...",
}
```

**How search works**:

- Searches across all text returned by `getSearchText`
- Case-insensitive by default
- Filters `records` prop or `module.listPane.records`
- Does not mutate original records array

---

### Tabs Not Opening/Closing Correctly

**Problem**: Record tabs don't open when clicking records, or don't close properly.

**Solution**: Ensure routes are configured correctly:

```tsx
// Module config
routes: {
  base: "/contacts",
  record: (recordId) => `/contacts/${recordId}`,
}

// Router
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />
```

**Common issues**:

- Route pattern mismatch
- Missing `:recordId` parameter
- Using different components for base and record routes

---

### Module Not Appearing in Navigation

**Problem**: Module doesn't show in module tabs.

**Solution**: Register module in `moduleRegistry.tsx`:

```tsx
export const getLveModulesForSegment = (segment: string) => {
  const modules = [
    contactsModule, // Add your module here
    // ... other modules
  ];

  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
};
```

**Check**:

- Module is exported from registry
- `menu.visible` is not `false`
- User segment matches `menu.requiredSegments` (if defined)

---

### TypeScript Errors with Generic Types

**Problem**: TypeScript errors about `TRecord` type mismatch.

**Solution**: Ensure record type is consistent throughout:

```tsx
// Define your record type
interface Contact {
  id: string;
  name: string;
  // ... other fields
}

// Use it consistently
const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... config
};

// In component
<LVEWorkspace<Contact>
  module={contactsModule}
  records={contacts} // Must be Contact[]
  onCreateRecord={async ({ values }) => {
    const newContact: Contact = await api.contacts.create(values);
    return newContact;
  }}
/>;
```

---

### Pagination Not Appearing

**Problem**: Pagination controls don't show even with many records.

**Solution**: Ensure you have more than 20 records:

```tsx
const { data } = useContactsQuery();

console.log("Total records:", data?.length); // Should be > 20

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  state={{
    listPane: {
      isLoading: false, // Pagination hidden during loading
      errorMessage: undefined, // Pagination hidden on error
    },
  }}
  persistLocalRecords={false}
/>;
```

**Common causes**:

- Less than 21 records in dataset
- List pane is in loading state (`isLoading: true`)
- List pane has an error state (`errorMessage` is set)
- Using custom `listPaneOverride` without pagination

**To test pagination**:

1. Use sample data generator to create 50+ records
2. Verify `records` prop contains all records
3. Check that loading/error states are false/undefined

---

### Page Doesn't Reset on Search

**Problem**: Page number doesn't reset to 1 when searching.

**Solution**: This is handled automatically by the workspace. If it's not working:

- Verify you're using the default list pane (not overridden)
- Check that search functionality is enabled in your module config

```tsx
listPane: {
  searchPlaceholder: "Search contacts...", // Enables search
  getSearchText: (record) => `${record.name} ${record.email}`, // Optional custom search
}
```

---

### Performance Issues with Large Datasets

**Problem**: Workspace is slow with many records.

**Solutions**:

1. **Use Built-In Pagination** (Automatic):

The workspace automatically paginates records at 20 per page. This is enabled by default and requires no configuration. See the "Built-In Pagination" section above for details.

```tsx
// Pagination works automatically
<LVEWorkspace
  module={contactsModule}
  records={allRecords} // All records loaded, only 20 displayed per page
  persistLocalRecords={false}
/>
```

**Best for**: Datasets under 1,000 records

2. **Implement server-side pagination** (For 10,000+ records):

```tsx
const { data } = useContactsQuery({ page, pageSize });

<LVEWorkspace
  module={contactsModule}
  records={data?.items ?? []}
  // Add pagination controls
/>;
```

3. **Use server-side search/filter**:

```tsx
const { data } = useContactsQuery({ search: searchQuery });

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  // Search happens on server
/>;
```

4. **Limit displayed columns**:

```tsx
listPane: {
  columns: [
    // Only include essential columns
    { id: "name", label: "Name", slot: "primary", render: (r) => r.name },
    { id: "email", label: "Email", slot: "secondary", render: (r) => r.email },
  ],
}
```

5. **Optimize render functions**:

```tsx
// Avoid expensive operations in render functions
columns: [
  {
    id: "name",
    label: "Name",
    slot: "primary",
    render: (record) => record.name, // Simple, fast
  },
  {
    id: "computed",
    label: "Computed",
    slot: "secondary",
    // ❌ Avoid: Expensive computation on every render
    render: (record) => expensiveCalculation(record),
    // ✅ Better: Pre-compute in API response
    render: (record) => record.precomputedValue,
  },
];
```

**Performance Guidelines**:

- < 100 records: No optimization needed
- 100-1,000 records: Built-in pagination handles this well
- 1,000-10,000 records: Consider server-side search/filter
- 10,000+ records: Implement server-side pagination

---

### Custom Pane Not Rendering

**Problem**: Custom pane override doesn't appear.

**Solution**: Ensure override function is defined in module config:

```tsx
const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... other config
  listPaneOverride: (props) => <CustomListPane {...props} />,
  // or
  workPaneOverride: (props) => <CustomWorkPane {...props} />,
  // or
  popPaneOverride: (props) => <CustomPopPane {...props} />,
};
```

**Override props available**:

```tsx
interface LVEWorkspaceOverrideProps<TRecord> {
  module: LVEWorkspaceModuleConfig<TRecord>;
  filteredRecords: TRecord[];
  selectedRecord?: TRecord;
  selectedRecordId?: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectRecord: (record: TRecord) => void;
}
```

---

### Session Storage Issues

**Problem**: Tab state not persisting or conflicting between modules.

**How it works**:

- Tab state stored per module: `atx:lve-workspace-state::{tenantId}::{streamId}::{moduleId}`
- Includes open record IDs, active tab, collapse state
- Persists across page refreshes
- Cleared when browser session ends

**To debug**:

```tsx
// Check session storage
console.log(
  sessionStorage.getItem("atx:lve-workspace-state::tenant::stream::contacts"),
);

// Clear if corrupted
sessionStorage.removeItem("atx:lve-workspace-state::tenant::stream::contacts");
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check the documentation**:
   - `README.md` - Complete usage guide (this file)
   - `QUICK_START.md` - Quick start examples
   - `MIGRATION.md` - Migration from legacy patterns
   - `IMPLEMENTATION_SUMMARY.md` - Architecture decisions
   - `types.ts` - Type definitions

2. **Review examples**:
   - `moduleRegistry.tsx` - Example module configurations
   - `__tests__/` - Test examples and patterns

3. **Check diagnostics**:
   - Browser console for errors
   - React DevTools for component state
   - Network tab for API calls
   - Session storage for persisted state

4. **Common debugging steps**:
   - Verify `records` prop is updating
   - Check `state` prop is passed correctly
   - Ensure `persistLocalRecords={false}` for API modules
   - Verify CRUD handlers return correct values
   - Check routes match module config
   - Verify module is registered in registry

5. **Consult the team** for complex scenarios or bugs.
