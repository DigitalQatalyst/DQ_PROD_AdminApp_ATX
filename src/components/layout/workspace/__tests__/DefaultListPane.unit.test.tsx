/**
 * Unit Tests for DefaultListPane Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 14.1 - Write unit tests for DefaultListPane
 *
 * **Validates: Requirements 12.5, 13.1, 13.2, 13.3**
 *
 * These tests validate the DefaultListPane renderer with specific examples:
 * - Record list rendering
 * - Search input rendering
 * - Filter/sort/views dropdowns
 * - List actions rendering
 * - Loading state
 * - Error state
 * - Empty state
 * - Record selection
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DefaultListPane } from "../defaultRenderers";
import { LVEListPaneConfig, LVEActionDefinition } from "../types";
import { User, Plus, Download } from "lucide-react";

// ============================================================================
// Test Setup
// ============================================================================

interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

const createTestRecords = (): TestRecord[] => [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "Active",
  },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "Inactive" },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "Active",
  },
];

const createMinimalConfig = (
  overrides?: Partial<LVEListPaneConfig<TestRecord>>,
): LVEListPaneConfig<TestRecord> => ({
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
  ...overrides,
});

// ============================================================================
// Test Suite: Record List Rendering
// ============================================================================

describe("DefaultListPane - Record List Rendering", () => {
  it("should render a list of records", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
  });

  it("should render primary column content", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("should render secondary column content", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("should render meta column when provided", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({
      records,
      columns: [
        {
          id: "name",
          label: "Name",
          slot: "primary",
          render: (record) => record.name,
        },
        {
          id: "meta",
          label: "Meta",
          slot: "meta",
          render: (record) => `Created: ${record.id}`,
        },
      ],
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Created: 1")).toBeInTheDocument();
  });

  it("should render badge column when provided", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({
      records,
      columns: [
        {
          id: "name",
          label: "Name",
          slot: "primary",
          render: (record) => record.name,
        },
        {
          id: "status",
          label: "Status",
          slot: "badge",
          render: (record) => <span data-testid="badge">{record.status}</span>,
        },
      ],
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const badges = screen.getAllByTestId("badge");
    expect(badges).toHaveLength(3);
    expect(badges[0]).toHaveTextContent("Active");
  });
});

// ============================================================================
// Test Suite: Search Input Rendering
// ============================================================================

describe("DefaultListPane - Search Input Rendering", () => {
  it("should render search input with default placeholder", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Search records");
    expect(searchInput).toBeInTheDocument();
  });

  it("should render search input with custom placeholder", () => {
    const config = createMinimalConfig({
      searchPlaceholder: "Find contacts...",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Find contacts...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should call setSearchQuery when search input changes", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Search records");
    fireEvent.change(searchInput, { target: { value: "alice" } });

    expect(setSearchQuery).toHaveBeenCalledWith("alice");
  });

  it("should display current search query in input", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery="test query"
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Search records",
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("test query");
  });
});

// ============================================================================
// Test Suite: Filter/Sort/Views Dropdowns
// ============================================================================

describe("DefaultListPane - Filter/Sort/Views Dropdowns", () => {
  it("should render filter dropdown when filterTriggerLabel is provided", () => {
    const config = createMinimalConfig({
      filterTriggerLabel: "Filter Records",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Filter Records")).toBeInTheDocument();
  });

  it("should render filter dropdown with view presets", () => {
    const config = createMinimalConfig({
      filterTriggerLabel: "Filters",
      viewPresets: [
        { id: "all", label: "All Records" },
        { id: "active", label: "Active Only" },
      ],
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    // Verify the filter button renders when view presets are provided
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("should render filter dropdown with queue presets", () => {
    const config = createMinimalConfig({
      filterTriggerLabel: "Filters",
      queuePresets: [
        { id: "my-queue", label: "My Queue" },
        { id: "team-queue", label: "Team Queue" },
      ],
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    // Verify the filter button renders when queue presets are provided
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("should render sort dropdown when sortTriggerLabel is provided", () => {
    const config = createMinimalConfig({
      sortTriggerLabel: "Sort By",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("should render views dropdown when viewsTriggerLabel is provided", () => {
    const config = createMinimalConfig({
      viewsTriggerLabel: "Views",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Views")).toBeInTheDocument();
  });

  it("should not render dropdowns when no trigger labels are provided", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    expect(screen.queryByText("Sort By")).not.toBeInTheDocument();
    expect(screen.queryByText("Views")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: List Actions Rendering
// ============================================================================

describe("DefaultListPane - List Actions Rendering", () => {
  it("should render list actions when provided", () => {
    const listActions: LVEActionDefinition<TestRecord>[] = [
      { id: "create", label: "Create", icon: Plus },
      { id: "export", label: "Export", icon: Download },
    ];
    const config = createMinimalConfig({ listActions });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("should call onAction when list action is clicked", () => {
    const listActions: LVEActionDefinition<TestRecord>[] = [
      { id: "create", label: "Create", icon: Plus },
    ];
    const config = createMinimalConfig({ listActions });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    expect(onAction).toHaveBeenCalledWith(listActions[0]);
  });

  it("should disable action buttons when disabled is true", () => {
    const listActions: LVEActionDefinition<TestRecord>[] = [
      { id: "create", label: "Create", icon: Plus, disabled: true },
    ];
    const config = createMinimalConfig({ listActions });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const createButton = screen.getByText("Create");
    expect(createButton).toBeDisabled();
  });

  it("should not render list actions when not provided", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("Create")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Loading State
// ============================================================================

describe("DefaultListPane - Loading State", () => {
  it("should display loading message when isLoading is true", () => {
    const config = createMinimalConfig({ isLoading: true });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Loading records...")).toBeInTheDocument();
  });

  it("should still render records when isLoading is true (records not hidden)", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records, isLoading: true });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    // Note: The current implementation shows both loading message AND records
    expect(screen.getByText("Loading records...")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Error State
// ============================================================================

describe("DefaultListPane - Error State", () => {
  it("should display error message when errorMessage is set", () => {
    const config = createMinimalConfig({
      errorMessage: "Failed to load records",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Failed to load records")).toBeInTheDocument();
  });

  it("should still render records when errorMessage is set (records not hidden)", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({
      records,
      errorMessage: "Failed to load records",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    // Note: The current implementation shows both error message AND records
    expect(screen.getByText("Failed to load records")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Empty State
// ============================================================================

describe("DefaultListPane - Empty State", () => {
  it("should display default empty message when no records", () => {
    const config = createMinimalConfig();
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("No records")).toBeInTheDocument();
    expect(
      screen.getByText("No records match the current workspace state."),
    ).toBeInTheDocument();
  });

  it("should display custom empty title and description", () => {
    const config = createMinimalConfig({
      emptyTitle: "No contacts found",
      emptyDescription: "Try adjusting your search or filters",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.getByText("No contacts found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filters"),
    ).toBeInTheDocument();
  });

  it("should not display empty state when loading", () => {
    const config = createMinimalConfig({ isLoading: true });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("No records")).not.toBeInTheDocument();
  });

  it("should not display empty state when error is present", () => {
    const config = createMinimalConfig({
      errorMessage: "Error loading",
    });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={[]}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("No records")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Record Selection
// ============================================================================

describe("DefaultListPane - Record Selection", () => {
  it("should call onSelectRecord when a record is clicked", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const recordButton = screen.getByText("Alice Johnson");
    fireEvent.click(recordButton);

    expect(onSelectRecord).toHaveBeenCalledWith(records[0]);
  });

  it("should highlight selected record", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        selectedRecordId="1"
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const recordButton = screen.getByText("Alice Johnson").closest("button");
    expect(recordButton).toHaveClass("border-primary/30");
    expect(recordButton).toHaveClass("bg-primary/10");
  });

  it("should not highlight non-selected records", () => {
    const records = createTestRecords();
    const config = createMinimalConfig({ records });
    const onSelectRecord = jest.fn();
    const onAction = jest.fn();
    const setSearchQuery = jest.fn();

    render(
      <DefaultListPane
        config={config}
        filteredRecords={records}
        selectedRecordId="1"
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSelectRecord={onSelectRecord}
        onAction={onAction}
      />,
    );

    const recordButton = screen.getByText("Bob Smith").closest("button");
    expect(recordButton).not.toHaveClass("border-primary/30");
    expect(recordButton).not.toHaveClass("bg-primary/10");
  });
});
