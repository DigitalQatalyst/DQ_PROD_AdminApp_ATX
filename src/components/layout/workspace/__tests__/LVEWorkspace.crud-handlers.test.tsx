/**
 * LVEWorkspace CRUD Handlers Test Suite
 *
 * Validates API-backed create, update, and delete operations
 * with runtime handlers instead of local state mutations.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LVEWorkspace } from "../LVEWorkspace";
import {
  LVECreateRecordHandlerContext,
  LVEDeleteRecordHandlerContext,
  LVEUpdateRecordHandlerContext,
  LVEWorkspaceModuleConfig,
} from "../types";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";
import { LVEWorkspaceProvider } from "../../../../context/LVEWorkspaceContext";
import { AuthProvider } from "../../../../context/AuthContext";

interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

const createModuleWithCrud = (): LVEWorkspaceModuleConfig<TestRecord> => ({
  metadata: {
    id: "contacts",
    label: "Contacts",
    singularLabel: "Contact",
    pluralLabel: "Contacts",
    route: "/contacts",
    icon: FileText,
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
    ],
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
    title: "Contact Workspace",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "email", label: "Email", render: () => record.email },
          { id: "status", label: "Status", render: () => record.status },
        ],
      },
    ],
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
  popPane: {
    title: "Context",
    getSections: (record) => [
      {
        id: "context",
        title: "Details",
        items: [{ id: "status", label: "Status", render: () => record.status }],
      },
    ],
  },
  crud: {
    create: {
      title: "Create Contact",
      description: "Add a new contact to the system",
      submitLabel: "Create",
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Enter contact name",
        },
        {
          id: "email",
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "contact@example.com",
        },
      ],
      createRecord: (values) => ({
        id: `contact-${Date.now()}`,
        name: values.name,
        email: values.email,
        status: "active",
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
      ],
      updateRecord: (record, values) => ({
        ...record,
        name: values.name,
        email: values.email,
      }),
    },
    delete: {
      title: (record) => `Delete ${record.name}?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete Contact",
    },
  },
});

const createTestRecords = (count: number): TestRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `contact-${i + 1}`,
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@example.com`,
    status: "active",
  }));

const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = "/contacts" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <LVEWorkspaceProvider>
        <Routes>
          <Route path="/contacts" element={children} />
          <Route path="/contacts/:recordId" element={children} />
        </Routes>
      </LVEWorkspaceProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("LVEWorkspace - CRUD Handlers (API-Backed)", () => {
  beforeEach(() => {
    // Mock localStorage for AuthProvider to provide user context
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
      organization_id: "test-org-id",
    };
    localStorage.setItem("platform_admin_user", JSON.stringify(mockUser));
    localStorage.setItem("user_role", "admin");
    localStorage.setItem("user_segment", "test-segment");
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe("Create Handler", () => {
    it("calls onCreateRecord handler when creating a record", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(2);
      const onCreateRecord = jest.fn(
        async ({ values }: LVECreateRecordHandlerContext<TestRecord>) => ({
          id: "new-contact",
          name: values.name,
          email: values.email,
          status: "active",
        }),
      );

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            onCreateRecord={onCreateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      const createButton = screen.getByRole("button", { name: /New Contact/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Create Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Enter contact name");
      const emailInput = screen.getByPlaceholderText("contact@example.com");

      await user.type(nameInput, "New Contact");
      await user.type(emailInput, "new@example.com");

      const submitButton = screen.getByRole("button", { name: /Create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onCreateRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            moduleId: "contacts",
            values: {
              name: "New Contact",
              email: "new@example.com",
            },
            records: expect.any(Array),
          }),
        );
      });
    });

    it("handles create handler errors gracefully", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(1);
      const onCreateRecord = jest.fn(async () => {
        throw new Error("API Error: Failed to create contact");
      });

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            onCreateRecord={onCreateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      const createButton = screen.getByRole("button", { name: /New Contact/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Create Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Enter contact name");
      const emailInput = screen.getByPlaceholderText("contact@example.com");

      await user.type(nameInput, "Test");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /Create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("API Error: Failed to create contact"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Update Handler", () => {
    it("calls onUpdateRecord handler when editing a record", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(2);
      const onUpdateRecord = jest.fn(
        async ({
          record,
          values,
        }: LVEUpdateRecordHandlerContext<TestRecord>) => ({
          ...record,
          name: values.name,
          email: values.email,
        }),
      );

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onUpdateRecord={onUpdateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /Edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue("Contact 1");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Contact");

      const submitButton = screen.getByRole("button", {
        name: /Save Changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onUpdateRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            moduleId: "contacts",
            recordId: "contact-1",
            values: expect.objectContaining({
              name: "Updated Contact",
            }),
          }),
        );
      });
    });

    it("handles update handler errors gracefully", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(1);
      const onUpdateRecord = jest.fn(async () => {
        throw new Error("API Error: Failed to update contact");
      });

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onUpdateRecord={onUpdateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /Edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue("Contact 1");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated");

      const submitButton = screen.getByRole("button", {
        name: /Save Changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("API Error: Failed to update contact"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Delete Handler", () => {
    it("calls onDeleteRecord handler when deleting a record", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(2);
      const onDeleteRecord = jest.fn(async () => {
        // Simulate successful API deletion
      });

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onDeleteRecord={onDeleteRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Contact 1\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Delete Contact/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onDeleteRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            moduleId: "contacts",
            recordId: "contact-1",
            record: expect.objectContaining({
              id: "contact-1",
              name: "Contact 1",
            }),
          }),
        );
      });
    });

    it("handles delete handler errors gracefully", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(1);
      const onDeleteRecord = jest.fn(async () => {
        throw new Error("API Error: Failed to delete contact");
      });

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onDeleteRecord={onDeleteRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Contact 1\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Delete Contact/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText("API Error: Failed to delete contact"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Handler Context", () => {
    it("provides correct context to create handler", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(2);
      let capturedContext: LVECreateRecordHandlerContext<TestRecord> | null =
        null;

      const onCreateRecord = jest.fn(
        async (context: LVECreateRecordHandlerContext<TestRecord>) => {
          capturedContext = context;
          return {
            id: "new-contact",
            name: context.values.name,
            email: context.values.email,
            status: "active",
          };
        },
      );

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            onCreateRecord={onCreateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      const createButton = screen.getByRole("button", { name: /New Contact/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Create Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Enter contact name");
      const emailInput = screen.getByPlaceholderText("contact@example.com");

      await user.type(nameInput, "Test");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /Create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
        expect(capturedContext?.moduleId).toBe("contacts");
        expect(capturedContext?.values).toEqual({
          name: "Test",
          email: "test@example.com",
        });
        expect(capturedContext?.records).toHaveLength(2);
      });
    });

    it("provides correct context to update handler", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(1);
      let capturedContext: LVEUpdateRecordHandlerContext<TestRecord> | null =
        null;

      const onUpdateRecord = jest.fn(
        async (context: LVEUpdateRecordHandlerContext<TestRecord>) => {
          capturedContext = context;
          return { ...context.record, name: context.values.name };
        },
      );

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onUpdateRecord={onUpdateRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /Edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit Contact")).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue("Contact 1");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated");

      const submitButton = screen.getByRole("button", {
        name: /Save Changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
        expect(capturedContext?.moduleId).toBe("contacts");
        expect(capturedContext?.recordId).toBe("contact-1");
        expect(capturedContext?.record.id).toBe("contact-1");
        expect(capturedContext?.values.name).toBe("Updated");
      });
    });

    it("provides correct context to delete handler", async () => {
      const user = userEvent.setup();
      const module = createModuleWithCrud();
      const records = createTestRecords(1);
      let capturedContext: LVEDeleteRecordHandlerContext<TestRecord> | null =
        null;

      const onDeleteRecord = jest.fn(
        async (context: LVEDeleteRecordHandlerContext<TestRecord>) => {
          capturedContext = context;
        },
      );

      render(
        <TestWrapper initialRoute="/contacts/contact-1">
          <LVEWorkspace
            module={module}
            records={records}
            onDeleteRecord={onDeleteRecord}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Contact 1")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Contact 1\?/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Delete Contact/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
        expect(capturedContext?.moduleId).toBe("contacts");
        expect(capturedContext?.recordId).toBe("contact-1");
        expect(capturedContext?.record.id).toBe("contact-1");
        expect(capturedContext?.records).toHaveLength(1);
      });
    });
  });
});
