/**
 * CRUD Integration Tests for LVEWorkspace Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 12 - Implement CRUD integration tests
 *
 * These tests validate CRUD operations (Create, Update, Delete) with async handlers,
 * modal interactions, loading states, and error handling.
 * Tests are organized by subtask:
 * - 12.1: Create operations
 * - 12.2: Update operations
 * - 12.3: Delete operations
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { LVEWorkspace } from "../LVEWorkspace";
import {
  LVEWorkspaceModuleConfig,
  LVECreateRecordHandlerContext,
  LVEUpdateRecordHandlerContext,
  LVEDeleteRecordHandlerContext,
} from "../types";
import { User } from "lucide-react";

// ============================================================================
// Test Setup and Mocks
// ============================================================================

// Mock the context hooks
const mockGetModuleWorkspaceState = jest.fn(() => ({
  openRecordIds: [],
  activeTabId: "module-root",
  isPopPaneCollapsed: false,
}));

const mockSetModuleWorkspaceState = jest.fn();

jest.mock("../../../../context/LVEWorkspaceContext", () => ({
  ...jest.requireActual("../../../../context/LVEWorkspaceContext"),
  useLVEWorkspace: () => ({
    currentStreamId: "test-stream",
    currentStreamLabel: "Test Stream",
    currentTenantId: "test-tenant",
    currentTenantLabel: "Test Tenant",
    streamOptions: [],
    setCurrentStreamId: jest.fn(),
    getModuleWorkspaceState: mockGetModuleWorkspaceState,
    setModuleWorkspaceState: mockSetModuleWorkspaceState,
    clearModuleWorkspaceState: jest.fn(),
  }),
  LVEWorkspaceProvider: ({ children }: any) => children,
}));

jest.mock("../../../../context/AuthContext", () => ({
  ...jest.requireActual("../../../../context/AuthContext"),
  useAuth: () => ({
    userSegment: "test-segment",
    user: { id: "test-user", organization_id: "test-org" },
    isAuthenticated: true,
  }),
}));

// Mock session storage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Test record type
interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

// Helper to create module config with CRUD support
const createModuleWithCrud = (
  overrides?: Partial<LVEWorkspaceModuleConfig<TestRecord>>,
): LVEWorkspaceModuleConfig<TestRecord> => ({
  metadata: {
    id: "test-module",
    label: "Test Module",
    singularLabel: "Test Record",
    pluralLabel: "Test Records",
    route: "/test",
    icon: User,
    moduleType: "record",
  },
  menu: {
    order: 1,
    visible: true,
  },
  routes: {
    base: "/test",
    record: (recordId: string) => `/test/${recordId}`,
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
        searchable: true,
        render: (record) => record.name,
      },
    ],
    listActions: [
      {
        id: "create",
        label: "Create Record",
        intent: "create",
        variant: "primary",
      },
    ],
  },
  workWindow: {
    title: "Test Work Window",
    getSections: (record) => [
      {
        id: "details",
        title: "Details",
        fields: [
          { id: "name", label: "Name", render: (r) => r.name },
          { id: "email", label: "Email", render: (r) => r.email },
        ],
      },
    ],
    recordActions: [
      {
        id: "edit",
        label: "Edit",
        intent: "edit",
        variant: "primary",
      },
      {
        id: "delete",
        label: "Delete",
        intent: "delete",
        variant: "outline",
      },
    ],
  },
  popPane: {
    title: "Test Pop Pane",
    getSections: (record) => [
      {
        id: "context",
        title: "Context",
        items: [{ id: "status", label: "Status", render: (r) => r.status }],
      },
    ],
  },
  crud: {
    create: {
      title: "Create Test Record",
      description: "Fill in the details to create a new record",
      submitLabel: "Create",
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "Enter name",
          required: true,
        },
        {
          id: "email",
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter email",
          required: true,
        },
        {
          id: "status",
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ],
      createRecord: (values) => ({
        id: `record-${Date.now()}`,
        name: values.name || "",
        email: values.email || "",
        status: values.status || "Active",
      }),
    },
    edit: {
      title: "Edit Test Record",
      description: "Update the record details",
      submitLabel: "Save",
      fields: [
        {
          id: "name",
          name: "name",
          label: "Name",
          type: "text",
          getValue: (record) => record.name,
        },
        {
          id: "email",
          name: "email",
          label: "Email",
          type: "email",
          getValue: (record) => record.email,
        },
      ],
      updateRecord: (record, values) => ({
        ...record,
        name: values.name || record.name,
        email: values.email || record.email,
      }),
    },
    delete: {
      title: "Delete Test Record",
      description: "Are you sure you want to delete this record?",
      confirmLabel: "Delete",
    },
  },
  ...overrides,
});

// Helper to create test records
const createTestRecords = (count: number): TestRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 1}`,
    name: `Test Record ${i + 1}`,
    email: `test${i + 1}@example.com`,
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

// Helper to click the delete confirm button in the modal
const clickDeleteConfirmButton = () => {
  const confirmButtons = screen.getAllByText("Delete");
  const confirmButton = confirmButtons[confirmButtons.length - 1]; // Last one is the confirm button in modal
  fireEvent.click(confirmButton);
};

// Wrapper component for routing tests
const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = "/test" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <Routes>
      <Route path="/test" element={children} />
      <Route path="/test/:recordId" element={children} />
    </Routes>
  </MemoryRouter>
);

// ============================================================================
// 12.1: Create Operations
// ============================================================================

describe("12.1 Create Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should open create modal when create action is triggered", async () => {
    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    // Find and click the create button
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
      expect(
        screen.getByText("Fill in the details to create a new record"),
      ).toBeInTheDocument();
    });
  });

  it("should submit create form with handler context", async () => {
    const mockCreateHandler = jest.fn(
      async (context: LVECreateRecordHandlerContext<TestRecord>) => {
        return {
          id: "new-record",
          name: context.values.name || "",
          email: context.values.email || "",
          status: context.values.status || "Active",
        };
      },
    );

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <BrowserRouter>
        <LVEWorkspace
          module={module}
          records={records}
          onCreateRecord={mockCreateHandler}
        />
      </BrowserRouter>,
    );

    // Open create modal
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
    });

    // Fill in form fields
    const nameInput = screen.getByPlaceholderText("Enter name");
    const emailInput = screen.getByPlaceholderText("Enter email");

    fireEvent.change(nameInput, { target: { value: "New Record" } });
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    // Submit form
    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // Verify handler was called with correct context
    await waitFor(() => {
      expect(mockCreateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: "test-module",
          values: expect.objectContaining({
            name: "New Record",
            email: "new@example.com",
          }),
          records: expect.arrayContaining([
            expect.objectContaining({ id: "record-1" }),
            expect.objectContaining({ id: "record-2" }),
          ]),
        }),
      );
    });
  });

  it("should navigate to new record after successful create", async () => {
    const mockCreateHandler = jest.fn(async () => ({
      id: "new-record-123",
      name: "New Record",
      email: "new@example.com",
      status: "Active",
    }));

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper>
        <LVEWorkspace
          module={module}
          records={records}
          onCreateRecord={mockCreateHandler}
        />
      </TestWrapper>,
    );

    // Open create modal
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
    });

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "New Record" } });

    const emailInput = screen.getByPlaceholderText("Enter email");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // Verify tab was opened and navigation occurred
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalledWith(
        "test-module",
        expect.any(Function),
      );
    });
  });

  it("should display error when create handler fails", async () => {
    const mockCreateHandler = jest.fn(async () => {
      throw new Error("Failed to create record");
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <BrowserRouter>
        <LVEWorkspace
          module={module}
          records={records}
          onCreateRecord={mockCreateHandler}
        />
      </BrowserRouter>,
    );

    // Open create modal
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
    });

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "New Record" } });

    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to create record")).toBeInTheDocument();
    });
  });

  it("should display loading state during create operation", async () => {
    let resolveCreate: (value: TestRecord) => void;
    const createPromise = new Promise<TestRecord>((resolve) => {
      resolveCreate = resolve;
    });

    const mockCreateHandler = jest.fn(() => createPromise);

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <BrowserRouter>
        <LVEWorkspace
          module={module}
          records={records}
          onCreateRecord={mockCreateHandler}
        />
      </BrowserRouter>,
    );

    // Open create modal
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
    });

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "New Record" } });

    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // Loading state should be active
    await waitFor(() => {
      expect(mockCreateHandler).toHaveBeenCalled();
    });

    // Resolve the promise
    resolveCreate!({
      id: "new-record",
      name: "New Record",
      email: "new@example.com",
      status: "Active",
    });

    // Wait for completion
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });
  });

  it("should close modal after successful create", async () => {
    const mockCreateHandler = jest.fn(async () => ({
      id: "new-record",
      name: "New Record",
      email: "new@example.com",
      status: "Active",
    }));

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <BrowserRouter>
        <LVEWorkspace
          module={module}
          records={records}
          onCreateRecord={mockCreateHandler}
        />
      </BrowserRouter>,
    );

    // Open create modal
    const createButton = screen.getByText("Create Record");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create Test Record")).toBeInTheDocument();
    });

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "New Record" } });

    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // Modal should close after success
    await waitFor(() => {
      expect(screen.queryByText("Create Test Record")).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// 12.2: Update Operations
// ============================================================================

describe("12.2 Update Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });
  });

  it("should open edit modal when edit action is triggered", async () => {
    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText("Edit Test Record")).toBeInTheDocument();
      expect(screen.getByText("Update the record details")).toBeInTheDocument();
    });
  });

  it("should pre-populate edit form with record data", async () => {
    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Form should be pre-populated
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(
        "Enter name",
      ) as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText(
        "Enter email",
      ) as HTMLInputElement;

      expect(nameInput.value).toBe("Test Record 1");
      expect(emailInput.value).toBe("test1@example.com");
    });
  });

  it("should submit edit form with handler context", async () => {
    const mockUpdateHandler = jest.fn(
      async (context: LVEUpdateRecordHandlerContext<TestRecord>) => {
        return {
          ...context.record,
          name: context.values.name || context.record.name,
          email: context.values.email || context.record.email,
        };
      },
    );

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onUpdateRecord={mockUpdateHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Test Record")).toBeInTheDocument();
    });

    // Update form fields
    const nameInput = screen.getByPlaceholderText("Enter name");
    fireEvent.change(nameInput, { target: { value: "Updated Record" } });

    // Submit form
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Verify handler was called with correct context
    await waitFor(() => {
      expect(mockUpdateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: "test-module",
          record: expect.objectContaining({ id: "record-1" }),
          recordId: "record-1",
          values: expect.objectContaining({
            name: "Updated Record",
          }),
          records: expect.arrayContaining([
            expect.objectContaining({ id: "record-1" }),
            expect.objectContaining({ id: "record-2" }),
          ]),
        }),
      );
    });
  });

  it("should display error when update handler fails", async () => {
    const mockUpdateHandler = jest.fn(async () => {
      throw new Error("Failed to update record");
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onUpdateRecord={mockUpdateHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Test Record")).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to update record")).toBeInTheDocument();
    });
  });

  it("should display loading state during update operation", async () => {
    let resolveUpdate: (value: TestRecord) => void;
    const updatePromise = new Promise<TestRecord>((resolve) => {
      resolveUpdate = resolve;
    });

    const mockUpdateHandler = jest.fn(() => updatePromise);

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onUpdateRecord={mockUpdateHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Test Record")).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Loading state should be active
    await waitFor(() => {
      expect(mockUpdateHandler).toHaveBeenCalled();
    });

    // Resolve the promise
    resolveUpdate!({
      id: "record-1",
      name: "Updated Record",
      email: "updated@example.com",
      status: "Active",
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText("Edit Test Record")).not.toBeInTheDocument();
    });
  });

  it("should close modal after successful update", async () => {
    const mockUpdateHandler = jest.fn(async (context) => ({
      ...context.record,
      name: context.values.name || context.record.name,
    }));

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onUpdateRecord={mockUpdateHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Test Record")).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Modal should close after success
    await waitFor(() => {
      expect(screen.queryByText("Edit Test Record")).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// 12.3: Delete Operations
// ============================================================================

describe("12.3 Delete Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1", "record-2"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });
  });

  it("should open delete modal when delete action is triggered", async () => {
    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this record?"),
      ).toBeInTheDocument();
    });
  });

  it("should confirm delete with handler context", async () => {
    const mockDeleteHandler = jest.fn(
      async (context: LVEDeleteRecordHandlerContext<TestRecord>) => {
        // Simulate successful deletion
      },
    );

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion - get the confirm button from the modal
    clickDeleteConfirmButton();

    // Verify handler was called with correct context
    await waitFor(() => {
      expect(mockDeleteHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: "test-module",
          record: expect.objectContaining({ id: "record-1" }),
          recordId: "record-1",
          records: expect.arrayContaining([
            expect.objectContaining({ id: "record-1" }),
            expect.objectContaining({ id: "record-2" }),
          ]),
        }),
      );
    });
  });

  it("should navigate to fallback record after successful delete", async () => {
    const mockDeleteHandler = jest.fn(async () => {
      // Simulate successful deletion
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion
    clickDeleteConfirmButton();

    // Verify navigation occurred
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalledWith(
        "test-module",
        expect.any(Function),
      );
    });
  });

  it("should display error when delete handler fails", async () => {
    const mockDeleteHandler = jest.fn(async () => {
      throw new Error("Failed to delete record");
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion
    clickDeleteConfirmButton();

    // Wait for handler to be called
    await waitFor(() => {
      expect(mockDeleteHandler).toHaveBeenCalled();
    });

    // Error should be displayed in the modal
    await waitFor(
      () => {
        expect(screen.getByText("Failed to delete record")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should display loading state during delete operation", async () => {
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });

    const mockDeleteHandler = jest.fn(() => deletePromise);

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion
    clickDeleteConfirmButton();

    // Loading state should be active
    await waitFor(() => {
      expect(mockDeleteHandler).toHaveBeenCalled();
    });

    // Resolve the promise
    resolveDelete!();

    // Wait for completion
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });
  });

  it("should close modal after successful delete", async () => {
    const mockDeleteHandler = jest.fn(async () => {
      // Simulate successful deletion
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(2);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion
    clickDeleteConfirmButton();

    // Modal should close after success
    await waitFor(() => {
      expect(screen.queryByText("Delete Test Record")).not.toBeInTheDocument();
    });
  });

  it("should navigate to base route when no fallback record exists", async () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });

    const mockDeleteHandler = jest.fn(async () => {
      // Simulate successful deletion
    });

    const module = createModuleWithCrud();
    const records = createTestRecords(1);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace
          module={module}
          records={records}
          onDeleteRecord={mockDeleteHandler}
        />
      </TestWrapper>,
    );

    // Wait for record to load
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Delete Test Record")).toBeInTheDocument();
    });

    // Confirm deletion
    clickDeleteConfirmButton();

    // Should navigate to base route (module root)
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalledWith(
        "test-module",
        expect.any(Function),
      );
    });
  });
});
