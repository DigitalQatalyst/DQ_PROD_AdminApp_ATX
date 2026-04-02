# LVE Workspace Quick Start Guide

Get started with the API-first workspace in 5 minutes.

## 1. Install Testing Dependencies (One Time)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event identity-obj-proxy
```

## 2. Define Your Record Type

```tsx
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
}
```

## 3. Create Module Config

```tsx
import { LVEWorkspaceModuleConfig } from "@/components/layout/workspace";
import { Users } from "lucide-react";

export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
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
        render: (record) => (
          <span
            className={
              record.status === "active" ? "text-green-600" : "text-gray-400"
            }
          >
            {record.status}
          </span>
        ),
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
};
```

## 4. Create API Hooks

```tsx
// hooks/useContacts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useContactsQuery() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to load contacts");
      return response.json() as Promise<Contact[]>;
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to create contact");
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
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Record<string, string>;
    }) => {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to update contact");
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
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
```

## 5. Create Page Component

```tsx
// pages/ContactsPage.tsx
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

## 6. Add Routes

```tsx
// App.tsx or router config
<Route path="/contacts" element={<ContactsPage />} />
<Route path="/contacts/:recordId" element={<ContactsPage />} />
```

## 7. Register Module (Optional)

If you want the module to appear in navigation:

```tsx
// src/components/layout/workspace/moduleRegistry.tsx

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

## That's It!

You now have a fully functional API-backed workspace with:

- ✅ List pane with search
- ✅ Work window with sections
- ✅ Context pane
- ✅ Record tabs
- ✅ Route-backed navigation
- ✅ Loading states
- ✅ Error handling
- ✅ CRUD operations

## Next Steps

### Add CRUD Forms

```tsx
export const contactsModule: LVEWorkspaceModuleConfig<Contact> = {
  // ... existing config
  crud: {
    create: {
      title: "Create Contact",
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
      ],
      createRecord: (values) =>
        ({
          id: `temp-${Date.now()}`,
          ...values,
          status: "active",
        }) as Contact,
    },
    edit: {
      title: "Edit Contact",
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          getValue: (record) => record.name,
        },
      ],
      updateRecord: (record, values) => ({
        ...record,
        ...values,
      }),
    },
    delete: {
      title: (record) => `Delete ${record.name}?`,
      description: "This action cannot be undone.",
    },
  },
};
```

### Add Actions

```tsx
listPane: {
  // ... existing config
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
workWindow: {
  // ... existing config
  recordActions: [
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      intent: "edit",
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
```

### Add Tests

```tsx
// __tests__/ContactsModule.test.tsx
import { render, screen } from "@testing-library/react";
import { LVEWorkspace } from "../LVEWorkspace";
import { contactsModule } from "../moduleRegistry";

describe("ContactsModule", () => {
  it("renders controlled records", () => {
    const records = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "",
        company: "",
        status: "active",
      },
    ];

    render(
      <TestWrapper>
        <LVEWorkspace
          module={contactsModule}
          records={records}
          persistLocalRecords={false}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

## Common Patterns

### Loading State

```tsx
state={{
  listPane: { isLoading: true },
}}
```

### Error State

```tsx
state={{
  listPane: { errorMessage: "Failed to load data" },
}}
```

### Empty State

```tsx
state={{
  listPane: {
    emptyTitle: "No contacts yet",
    emptyDescription: "Create your first contact to get started",
  },
}}
```

### Custom Renderer

```tsx
listPaneOverride: (props) => <CustomListPane {...props} />,
```

## Resources

- Full Documentation: `README.md`
- Migration Guide: `MIGRATION.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Type Definitions: `types.ts`
- Example Modules: `moduleRegistry.tsx`
- Test Examples: `__tests__/`

## Support

For questions or issues:

1. Check the README for detailed documentation
2. Review example modules in moduleRegistry.tsx
3. Look at test examples for patterns
4. Consult the team for complex scenarios
