# Migration Guide: Legacy LVE to Canonical Workspace

This guide helps migrate from legacy `src/components/lve` patterns to the canonical API-first workspace in `src/components/layout/workspace`.

## Why Migrate?

The canonical workspace provides:

- API-first design with controlled records
- Consistent runtime state management
- Better separation of config and data
- Standardized CRUD handler patterns
- Route-backed workspace recovery
- Shared shell layout and behavior

The legacy `src/components/lve` path should not be used for new modules and existing modules should migrate to the canonical implementation.

## Migration Steps

### 1. Identify Current Pattern

Check if your module uses:

- `src/components/lve/LVEWorkspace.tsx` (legacy)
- `src/components/lve/LVEWorkspaceLayout.tsx` (legacy)
- Local state management with `useState`
- Direct localStorage access
- Custom tab management logic

If yes, follow this migration guide.

### 2. Extract Module Config

Convert your current module setup to the canonical config format:

**Before (Legacy):**

```tsx
const config = {
  moduleId: "contacts",
  title: "Contacts",
  tabs: [...],
  listPane: {
    columns: [...],
    filters: [...],
  },
  workPane: {
    sections: [...],
  },
  popPane: {
    sections: [...],
  },
};

<LVEWorkspace
  config={config}
  records={localRecords}
  selectedRecord={selectedRecord}
  onRecordSelect={handleSelect}
/>
```

**After (Canonical):**

```tsx
const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  metadata: {
    id: "contacts",
    label: "Contacts",
    singularLabel: "Contact",
    pluralLabel: "Contacts",
    route: "/contacts",
    icon: Users,
    moduleType: "record",
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
    columns: [...],
  },
  workWindow: {
    title: "Contact Workspace",
    getSections: (record) => [...],
  },
  popPane: {
    title: "Context",
    getSections: (record) => [...],
  },
};

<LVEWorkspace module={contactsModule} />
```

### 3. Replace Local State with API Queries

**Before (Legacy):**

```tsx
const [records, setRecords] = useState<Contact[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchContacts()
    .then(setRecords)
    .finally(() => setLoading(false));
}, []);
```

**After (Canonical):**

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
  }}
  persistLocalRecords={false}
/>;
```

### 4. Add CRUD Handlers

**Before (Legacy):**

```tsx
const handleCreate = (values: Record<string, string>) => {
  const newRecord = {
    id: generateId(),
    ...values,
  };
  setRecords([...records, newRecord]);
};

const handleUpdate = (recordId: string, values: Record<string, string>) => {
  setRecords(records.map((r) => (r.id === recordId ? { ...r, ...values } : r)));
};

const handleDelete = (recordId: string) => {
  setRecords(records.filter((r) => r.id !== recordId));
};
```

**After (Canonical):**

```tsx
<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  onCreateRecord={async ({ values }) => {
    const newRecord = await api.contacts.create(values);
    queryClient.invalidateQueries(["contacts"]);
    return newRecord;
  }}
  onUpdateRecord={async ({ recordId, values }) => {
    const updated = await api.contacts.update(recordId, values);
    queryClient.invalidateQueries(["contacts"]);
    return updated;
  }}
  onDeleteRecord={async ({ recordId }) => {
    await api.contacts.delete(recordId);
    queryClient.invalidateQueries(["contacts"]);
  }}
  persistLocalRecords={false}
/>
```

### 5. Remove Local Storage Logic

**Before (Legacy):**

```tsx
useEffect(() => {
  const stored = localStorage.getItem("contacts");
  if (stored) {
    setRecords(JSON.parse(stored));
  }
}, []);

useEffect(() => {
  localStorage.setItem("contacts", JSON.stringify(records));
}, [records]);
```

**After (Canonical):**

```tsx
// Remove all localStorage logic
// Set persistLocalRecords={false}

<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  persistLocalRecords={false}
/>
```

### 6. Update CRUD Config

**Before (Legacy):**

```tsx
crud: {
  create: {
    fields: [...],
    createRecord: (values) => ({
      id: generateId(),
      ...values,
    }),
  },
}
```

**After (Canonical):**

```tsx
crud: {
  create: {
    fields: [...],
    createRecord: (values) => ({
      id: `temp-${Date.now()}`,
      ...values,
    }),
  },
}

// But prefer runtime handler:
<LVEWorkspace
  module={contactsModule}
  onCreateRecord={async ({ values }) => api.contacts.create(values)}
/>
```

### 7. Register Module

Add your module to the canonical registry:

```tsx
// src/components/layout/workspace/moduleRegistry.tsx

export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... config
};

export const getLveModulesForSegment = (segment: string) => {
  const modules = [
    contactsModule,
    // ... other modules
  ];

  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
};
```

### 8. Update Routes

**Before (Legacy):**

```tsx
<Route path="/contacts" element={<ContactsLegacyPage />} />
```

**After (Canonical):**

```tsx
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />

// ContactsPage.tsx
export function ContactsPage() {
  const { data, isLoading, error } = useContactsQuery();

  return (
    <LVEWorkspace
      module={contactsModule}
      records={data ?? []}
      state={{ listPane: { isLoading, errorMessage: error?.message } }}
      onCreateRecord={async ({ values }) => api.contacts.create(values)}
      onUpdateRecord={async ({ recordId, values }) =>
        api.contacts.update(recordId, values)
      }
      onDeleteRecord={async ({ recordId }) => api.contacts.delete(recordId)}
      persistLocalRecords={false}
    />
  );
}
```

## Common Migration Patterns

### Pattern 1: Static Demo Data

**Before:**

```tsx
const demoRecords = [...];
<LVEWorkspace config={config} records={demoRecords} />
```

**After:**

```tsx
const contactsModule = {
  // ... config
  listPane: {
    records: demoRecords, // Static fallback
    // ... rest of config
  },
};

<LVEWorkspace module={contactsModule} />
// Or with controlled records:
<LVEWorkspace module={contactsModule} records={demoRecords} />
```

### Pattern 2: API with Loading States

**Before:**

```tsx
const [records, setRecords] = useState([]);
const [loading, setLoading] = useState(false);

<LVEWorkspace config={config} records={records} loading={loading} />;
```

**After:**

```tsx
const { data, isLoading } = useQuery(["contacts"], fetchContacts);

<LVEWorkspace
  module={contactsModule}
  records={data ?? []}
  state={{ listPane: { isLoading } }}
  persistLocalRecords={false}
/>;
```

### Pattern 3: Custom Overrides

**Before:**

```tsx
overrides={{
  listPane: <CustomListPane />,
  workPane: <CustomWorkPane />,
}}
```

**After:**

```tsx
const contactsModule = {
  // ... config
  listPaneOverride: (props) => <CustomListPane {...props} />,
  workPaneOverride: (props) => <CustomWorkPane {...props} />,
};
```

## Validation Checklist

After migration, verify:

- [ ] Module config is registered in `moduleRegistry.tsx`
- [ ] Routes include both base and record paths
- [ ] `records` prop receives API data
- [ ] `state` prop drives loading/error UI
- [ ] CRUD handlers call API endpoints
- [ ] `persistLocalRecords={false}` is set
- [ ] No direct localStorage access remains
- [ ] Record tabs open/close correctly
- [ ] Navigation and route recovery work
- [ ] Search and filtering work with API data
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Empty states display correctly

## Testing

Add tests for your migrated module:

```tsx
describe("ContactsModule - API Integration", () => {
  it("renders controlled records from API", () => {
    const records = createTestRecords(3);

    render(
      <LVEWorkspace
        module={contactsModule}
        records={records}
        persistLocalRecords={false}
      />,
    );

    expect(screen.getByText("Contact 1")).toBeInTheDocument();
  });

  it("displays loading state", () => {
    render(
      <LVEWorkspace
        module={contactsModule}
        records={[]}
        state={{ listPane: { isLoading: true } }}
        persistLocalRecords={false}
      />,
    );

    expect(screen.getByText("Loading records...")).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Records not updating

Ensure `records` prop is controlled and updates when API data changes:

```tsx
const { data } = useContactsQuery();

<LVEWorkspace
  module={contactsModule}
  records={data ?? []} // Updates when data changes
  persistLocalRecords={false}
/>;
```

### Local storage still being used

Explicitly set `persistLocalRecords={false}`:

```tsx
<LVEWorkspace
  module={contactsModule}
  records={apiRecords}
  persistLocalRecords={false} // Required for API-first
/>
```

### CRUD operations not working

Ensure handlers are async and return correct values:

```tsx
onCreateRecord={async ({ values }) => {
  const newRecord = await api.contacts.create(values);
  return newRecord; // Must return the created record
}}

onUpdateRecord={async ({ recordId, values }) => {
  const updated = await api.contacts.update(recordId, values);
  return updated; // Must return the updated record
}}

onDeleteRecord={async ({ recordId }) => {
  await api.contacts.delete(recordId);
  // No return value needed
}}
```

### Route recovery not working

Ensure both base and record routes are defined:

```tsx
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />
```

## Support

For questions or issues during migration:

1. Review the canonical README: `src/components/layout/workspace/README.md`
2. Check example modules in `moduleRegistry.tsx`
3. Review test examples in `__tests__/` directory
4. Consult the team for complex migration scenarios

## Breaking Changes

### API Changes

**1. Component Import Path**

- **Legacy**: `import { LVEWorkspace } from "@/components/lve"`
- **Canonical**: `import { LVEWorkspace } from "@/components/layout/workspace"`
- **Impact**: All imports must be updated
- **Migration**: Find and replace import paths

**2. Props Interface**

- **Legacy**: Accepted `config`, `records`, `selectedRecord`, `onRecordSelect`
- **Canonical**: Accepts `module`, `records`, `state`, `persistLocalRecords`, CRUD handlers
- **Impact**: Props structure completely changed
- **Migration**: Convert config to module format, replace event handlers with CRUD handlers

**3. Module Configuration Structure**

- **Legacy**: Flat config object with mixed concerns
- **Canonical**: Structured `LVEWorkspaceModuleConfig` with metadata, menu, routes, panes, crud
- **Impact**: All module configs must be restructured
- **Migration**: Extract and reorganize config fields into canonical structure

**4. Record Management**

- **Legacy**: Local state with `useState`, direct localStorage access
- **Canonical**: Controlled `records` prop, optional `persistLocalRecords` flag
- **Impact**: State management approach completely changed
- **Migration**: Replace local state with API queries, pass records as prop

**5. CRUD Operations**

- **Legacy**: Custom event handlers (`onCreate`, `onUpdate`, `onDelete`)
- **Canonical**: Standardized handlers (`onCreateRecord`, `onUpdateRecord`, `onDeleteRecord`) with context objects
- **Impact**: Handler signatures changed, context structure different
- **Migration**: Update handler signatures to match new context types

**6. Loading/Error States**

- **Legacy**: Passed as separate props or managed locally
- **Canonical**: Passed through `state` prop with pane-specific overrides
- **Impact**: State management approach changed
- **Migration**: Consolidate loading/error state into `state` prop

**7. Tab Management**

- **Legacy**: Custom tab state management
- **Canonical**: Automatic route-backed tab management
- **Impact**: No manual tab management needed
- **Migration**: Remove custom tab logic, rely on routing

**8. Persistence Strategy**

- **Legacy**: Always persisted to localStorage
- **Canonical**: Controlled by `persistLocalRecords` flag, defaults to false for controlled records
- **Impact**: Persistence behavior changed
- **Migration**: Explicitly set `persistLocalRecords={false}` for API-backed modules

### Type Changes

**1. Module Config Type**

- **Legacy**: No strict type enforcement
- **Canonical**: `LVEWorkspaceModuleConfig<TRecord>` with generic type parameter
- **Impact**: TypeScript errors if types don't match
- **Migration**: Define record type and use consistently

**2. CRUD Handler Context Types**

- **Legacy**: Simple value objects
- **Canonical**: Structured context types (`LVECreateRecordHandlerContext`, `LVEUpdateRecordHandlerContext`, `LVEDeleteRecordHandlerContext`)
- **Impact**: Handler parameters changed
- **Migration**: Update handler signatures to destructure context

**3. Action Definition Type**

- **Legacy**: Simple action objects
- **Canonical**: `LVEActionDefinition<TRecord>` with intent, variant, context
- **Impact**: Action structure more complex
- **Migration**: Update action definitions to include intent and variant

### Behavioral Changes

**1. Route-Backed Tabs**

- **Legacy**: Tabs managed in component state
- **Canonical**: Tabs automatically managed based on route
- **Impact**: Tab behavior tied to routing
- **Migration**: Ensure routes are configured correctly

**2. Session Storage**

- **Legacy**: No session storage
- **Canonical**: Tab state persisted to session storage
- **Impact**: Tab state survives page refresh
- **Migration**: No action needed, automatic behavior

**3. Search Behavior**

- **Legacy**: Custom search implementation
- **Canonical**: Built-in search with `getSearchText` function
- **Impact**: Search behavior standardized
- **Migration**: Define `getSearchText` in listPane config

**4. Empty/Error States**

- **Legacy**: Custom empty/error rendering
- **Canonical**: Standardized empty/error states with configurable messages
- **Impact**: Consistent UI across modules
- **Migration**: Define empty/error messages in config or state

**5. Module Type Support**

- **Legacy**: Single module pattern
- **Canonical**: Three module types (record, workflow, parent-workspace)
- **Impact**: Must specify `moduleType` in metadata
- **Migration**: Choose appropriate module type for your use case

### Removed Features

**1. Custom Tab Components**

- **Legacy**: Could provide custom tab components
- **Canonical**: Uses standard tab component
- **Impact**: Custom tab UI not supported
- **Migration**: Use standard tabs or pane overrides

**2. Direct localStorage API**

- **Legacy**: Direct access to localStorage
- **Canonical**: Managed through `persistLocalRecords` flag
- **Impact**: No direct localStorage control
- **Migration**: Use `persistLocalRecords` flag or manage persistence externally

**3. Custom Pane Layout**

- **Legacy**: Could customize pane layout
- **Canonical**: Fixed three-pane layout
- **Impact**: Layout structure is fixed
- **Migration**: Use pane overrides for custom content, not layout

### Added Features

**1. Runtime State Management**

- **New**: `state` prop for dynamic UI state
- **Benefit**: Update loading/error states without recreating config
- **Usage**: Pass `state` prop with pane-specific overrides

**2. CRUD Handler Context**

- **New**: Rich context objects passed to CRUD handlers
- **Benefit**: Access to moduleId, records, and other context
- **Usage**: Destructure context in handler functions

**3. Module Types**

- **New**: Support for record, workflow, and parent-workspace modules
- **Benefit**: Specialized behavior for different workflows
- **Usage**: Set `moduleType` in metadata

**4. Pane Overrides**

- **New**: `listPaneOverride`, `workPaneOverride`, `popPaneOverride`
- **Benefit**: Complete control over pane rendering
- **Usage**: Provide override functions in module config

**5. Action Intents**

- **New**: `intent` field on actions ("create", "edit", "delete")
- **Benefit**: Automatic modal opening for CRUD operations
- **Usage**: Set `intent` on action definitions

### Version Compatibility

**Legacy Path**: `src/components/lve` (deprecated)

- No longer maintained
- Will be removed in future release
- Do not use for new modules

**Canonical Path**: `src/components/layout/workspace` (current)

- Actively maintained
- All new features added here
- Required for all new modules

**Migration Timeline**:

- **Phase 1**: New modules must use canonical path
- **Phase 2**: Existing modules should migrate as capacity allows
- **Phase 3**: Legacy path will be removed (TBD)

### Migration Support

**Resources**:

- `README.md` - Complete documentation
- `QUICK_START.md` - Quick start guide
- `MIGRATION.md` - This guide
- `IMPLEMENTATION_SUMMARY.md` - Architecture decisions
- `moduleRegistry.tsx` - Example modules
- `__tests__/` - Test examples

**Getting Help**:

1. Review documentation and examples
2. Check troubleshooting section
3. Review test examples for patterns
4. Consult team for complex scenarios

## Timeline

Legacy `src/components/lve` patterns are deprecated. All new modules should use the canonical workspace. Existing modules should migrate as capacity allows.
