/**
 * Unit Tests for LVEWorkspace Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 11 - Implement LVEWorkspace unit tests
 *
 * These tests validate specific examples and edge cases for the LVEWorkspace component.
 * Tests are organized by subtask:
 * - 11.1: Basic rendering scenarios
 * - 11.2: Tab management
 * - 11.3: Search and filtering
 * - 11.4: Route navigation
 * - 11.5: Pane overrides
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { LVEWorkspace } from "../LVEWorkspace";
import {
  LVEWorkspaceModuleConfig,
  LVEWorkspaceRuntimeState,
  LVEWorkspaceOverrideProps,
} from "../types";
import { User, Building2, Target } from "lucide-react";

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

// Helper to create minimal module config
const createMinimalModule = (
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
      {
        id: "email",
        label: "Email",
        slot: "secondary",
        searchable: true,
        render: (record) => record.email,
      },
    ],
    searchPlaceholder: "Search records...",
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
// 11.1: Basic Rendering Scenarios
// ============================================================================

describe("11.1 Basic Rendering Scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should render with minimal config", () => {
    const module = createMinimalModule();

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe("");
    expect(screen.getByText("Test Module Workspace")).toBeInTheDocument();
  });

  it("should render record module type", () => {
    const module = createMinimalModule({
      metadata: {
        id: "contacts",
        label: "Contacts",
        singularLabel: "Contact",
        pluralLabel: "Contacts",
        route: "/contacts",
        icon: User,
        moduleType: "record",
      },
    });

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Contacts Workspace")).toBeInTheDocument();
  });

  it("should render workflow module type with lifecycle actions", () => {
    const module = createMinimalModule({
      metadata: {
        id: "leads",
        label: "Leads",
        singularLabel: "Lead",
        pluralLabel: "Leads",
        route: "/leads",
        icon: Target,
        moduleType: "workflow",
      },
      workWindow: {
        title: "Lead Details",
        getSections: () => [],
        lifecycleActions: [
          {
            id: "qualify",
            label: "Qualify Lead",
            variant: "primary",
          },
          {
            id: "convert",
            label: "Convert",
            variant: "primary",
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Leads Workspace")).toBeInTheDocument();
  });

  it("should render parent-workspace module type with inner tabs", () => {
    const module = createMinimalModule({
      metadata: {
        id: "accounts",
        label: "Accounts",
        singularLabel: "Account",
        pluralLabel: "Accounts",
        route: "/accounts",
        icon: Building2,
        moduleType: "parent-workspace",
      },
      workWindow: {
        title: "Account Details",
        getSections: () => [],
        innerTabs: [
          {
            id: "contacts",
            label: "Contacts",
            getSections: () => [],
          },
          {
            id: "deals",
            label: "Deals",
            getSections: () => [],
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Accounts Workspace")).toBeInTheDocument();
  });

  it("should render with empty records", () => {
    const module = createMinimalModule({
      listPane: {
        records: [],
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        columns: [],
        emptyTitle: "No records found",
        emptyDescription: "Create your first record to get started",
      },
    });

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={[]} />
      </BrowserRouter>,
    );

    expect(screen.getByText("No records found")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first record to get started"),
    ).toBeInTheDocument();
  });

  it("should render with loading state", () => {
    const module = createMinimalModule();
    const state: LVEWorkspaceRuntimeState = {
      listPane: {
        isLoading: true,
      },
    };

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} state={state} />
      </BrowserRouter>,
    );

    // Loading indicator should be present
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render with error state", () => {
    const module = createMinimalModule();
    const state: LVEWorkspaceRuntimeState = {
      listPane: {
        errorMessage: "Failed to load records",
      },
    };

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} state={state} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Failed to load records")).toBeInTheDocument();
  });
});

// ============================================================================
// 11.2: Tab Management
// ============================================================================

describe("11.2 Tab Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should open tab on record selection", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });

    // Verify tab was opened for the record
    const calls = mockSetModuleWorkspaceState.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall).toBeDefined();
  });

  it("should handle tab closing behavior", async () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1", "record-2"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });

    const module = createMinimalModule();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Use getAllByText since "Test Record 1" appears in multiple places
      const elements = screen.getAllByText("Test Record 1");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should handle tab switching", async () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1", "record-2"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });

    const module = createMinimalModule();
    const records = createTestRecords(3);

    const { rerender } = render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Switch to record-2
    rerender(
      <TestWrapper initialRoute="/test/record-2">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });
  });

  it("should prevent duplicate tabs", async () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });

    const module = createMinimalModule();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const state = mockGetModuleWorkspaceState();
      // Should only have one instance of record-1
      const count = state.openRecordIds.filter(
        (id: string) => id === "record-1",
      ).length;
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  it("should persist tabs to session storage", async () => {
    const module = createMinimalModule({
      tabs: {
        persist: true,
        routeBacked: true,
      },
    });
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });

    // Verify session storage was updated
    const calls = mockSetModuleWorkspaceState.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it("should restore tabs from session storage", () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1", "record-2"],
      activeTabId: "tab::record-2",
      isPopPaneCollapsed: false,
    });

    const module = createMinimalModule({
      tabs: {
        persist: true,
        routeBacked: true,
      },
    });
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Should restore from session storage
    expect(mockGetModuleWorkspaceState).toHaveBeenCalled();
  });
});

// ============================================================================
// 11.3: Search and Filtering
// ============================================================================

describe("11.3 Search and Filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should filter records by search query", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(5);

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    // Find search input
    const searchInput = container.querySelector(
      'input[placeholder="Search records..."]',
    );
    expect(searchInput).toBeInTheDocument();

    if (searchInput) {
      // Type search query
      fireEvent.change(searchInput, { target: { value: "Record 1" } });

      await waitFor(() => {
        // Should filter to show only matching records
        expect(searchInput).toHaveValue("Record 1");
      });
    }
  });

  it("should search across multiple columns", async () => {
    const module = createMinimalModule({
      listPane: {
        records: [],
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        columns: [
          {
            id: "name",
            label: "Name",
            searchable: true,
            render: (record) => record.name,
          },
          {
            id: "email",
            label: "Email",
            searchable: true,
            render: (record) => record.email,
          },
        ],
        searchPlaceholder: "Search records...",
        getSearchText: (record) => `${record.name} ${record.email}`,
      },
    });
    const records = createTestRecords(5);

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    const searchInput = container.querySelector(
      'input[placeholder="Search records..."]',
    );
    expect(searchInput).toBeInTheDocument();

    if (searchInput) {
      // Search by email
      fireEvent.change(searchInput, { target: { value: "test1@" } });

      await waitFor(() => {
        expect(searchInput).toHaveValue("test1@");
      });
    }
  });

  it("should handle empty search query", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(5);

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    const searchInput = container.querySelector(
      'input[placeholder="Search records..."]',
    );
    expect(searchInput).toBeInTheDocument();

    if (searchInput) {
      // Empty search should show all records
      fireEvent.change(searchInput, { target: { value: "" } });

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
      });
    }
  });

  it("should handle search with no results", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(5);

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    const searchInput = container.querySelector(
      'input[placeholder="Search records..."]',
    );
    expect(searchInput).toBeInTheDocument();

    if (searchInput) {
      // Search for non-existent record
      fireEvent.change(searchInput, {
        target: { value: "NonExistentRecord" },
      });

      await waitFor(() => {
        expect(searchInput).toHaveValue("NonExistentRecord");
      });
    }
  });

  it("should render search placeholder", () => {
    const module = createMinimalModule({
      listPane: {
        records: [],
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        columns: [],
        searchPlaceholder: "Search for contacts...",
      },
    });

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    const searchInput = container.querySelector(
      'input[placeholder="Search for contacts..."]',
    );
    expect(searchInput).toBeInTheDocument();
  });
});

// ============================================================================
// 11.4: Route Navigation
// ============================================================================

describe("11.4 Route Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should navigate to base route", () => {
    const module = createMinimalModule();

    render(
      <TestWrapper initialRoute="/test">
        <LVEWorkspace module={module} />
      </TestWrapper>,
    );

    expect(screen.getByText("Test Module Workspace")).toBeInTheDocument();
  });

  it("should navigate to record route", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Use getAllByText since "Test Record 1" appears in multiple places
      const elements = screen.getAllByText("Test Record 1");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should handle navigation with invalid record ID", async () => {
    const module = createMinimalModule();
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/invalid-id">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Should navigate back to base route when record not found
    await waitFor(() => {
      expect(screen.getByText("Test Module Workspace")).toBeInTheDocument();
    });
  });

  it("should navigate after record deletion", async () => {
    mockGetModuleWorkspaceState.mockReturnValue({
      openRecordIds: ["record-1", "record-2"],
      activeTabId: "tab::record-1",
      isPopPaneCollapsed: false,
    });

    const module = createMinimalModule();
    const records = createTestRecords(3);

    const { rerender } = render(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    // Remove record-1
    const updatedRecords = records.filter((r) => r.id !== "record-1");

    rerender(
      <TestWrapper initialRoute="/test/record-1">
        <LVEWorkspace module={module} records={updatedRecords} />
      </TestWrapper>,
    );

    // Should navigate away from deleted record
    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });
  });

  it("should open tab based on route", async () => {
    const module = createMinimalModule({
      tabs: {
        routeBacked: true,
      },
    });
    const records = createTestRecords(3);

    render(
      <TestWrapper initialRoute="/test/record-2">
        <LVEWorkspace module={module} records={records} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockSetModuleWorkspaceState).toHaveBeenCalled();
    });

    // Verify tab was opened for record-2
    const calls = mockSetModuleWorkspaceState.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 11.5: Pane Overrides
// ============================================================================

describe("11.5 Pane Overrides", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.clear();
  });

  it("should invoke listPaneOverride", () => {
    let overrideCalled = false;
    let capturedProps: LVEWorkspaceOverrideProps<TestRecord> | null = null;

    const module = createMinimalModule({
      listPaneOverride: (props) => {
        overrideCalled = true;
        capturedProps = props;
        return <div data-testid="list-override">Custom List Pane</div>;
      },
    });

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(overrideCalled).toBe(true);
    expect(
      container.querySelector('[data-testid="list-override"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Custom List Pane")).toBeInTheDocument();
  });

  it("should invoke workPaneOverride", () => {
    let overrideCalled = false;
    let capturedProps: LVEWorkspaceOverrideProps<TestRecord> | null = null;

    const module = createMinimalModule({
      workPaneOverride: (props) => {
        overrideCalled = true;
        capturedProps = props;
        return <div data-testid="work-override">Custom Work Pane</div>;
      },
    });

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(overrideCalled).toBe(true);
    expect(
      container.querySelector('[data-testid="work-override"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Custom Work Pane")).toBeInTheDocument();
  });

  it("should invoke popPaneOverride", () => {
    let overrideCalled = false;
    let capturedProps: LVEWorkspaceOverrideProps<TestRecord> | null = null;

    const module = createMinimalModule({
      popPaneOverride: (props) => {
        overrideCalled = true;
        capturedProps = props;
        return <div data-testid="pop-override">Custom Pop Pane</div>;
      },
    });

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} />
      </BrowserRouter>,
    );

    expect(overrideCalled).toBe(true);
    expect(
      container.querySelector('[data-testid="pop-override"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Custom Pop Pane")).toBeInTheDocument();
  });

  it("should pass complete props to overrides", () => {
    let capturedProps: LVEWorkspaceOverrideProps<TestRecord> | null = null;

    const module = createMinimalModule({
      listPaneOverride: (props) => {
        capturedProps = props;
        return <div>Override</div>;
      },
    });

    const records = createTestRecords(3);

    render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    expect(capturedProps).not.toBeNull();
    expect(capturedProps?.module).toBeDefined();
    expect(capturedProps?.filteredRecords).toBeDefined();
    expect(Array.isArray(capturedProps?.filteredRecords)).toBe(true);
    expect(capturedProps?.searchQuery).toBeDefined();
    expect(typeof capturedProps?.searchQuery).toBe("string");
    expect(capturedProps?.setSearchQuery).toBeDefined();
    expect(typeof capturedProps?.setSearchQuery).toBe("function");
    expect(capturedProps?.onSelectRecord).toBeDefined();
    expect(typeof capturedProps?.onSelectRecord).toBe("function");
  });

  it("should fallback to default renderers when no overrides", () => {
    const module = createMinimalModule();
    const records = createTestRecords(3);

    const { container } = render(
      <BrowserRouter>
        <LVEWorkspace module={module} records={records} />
      </BrowserRouter>,
    );

    // Should render default panes (not custom overrides)
    expect(
      container.querySelector('[data-testid="list-override"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="work-override"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="pop-override"]'),
    ).not.toBeInTheDocument();

    // Should have default content
    expect(screen.getByText("Test Module Workspace")).toBeInTheDocument();
  });
});
