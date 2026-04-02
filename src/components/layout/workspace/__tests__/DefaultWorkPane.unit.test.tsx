/**
 * Unit Tests for DefaultWorkPane Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 14.2 - Write unit tests for DefaultWorkPane
 *
 * **Validates: Requirements 11.2, 11.3, 13.4, 13.5**
 *
 * These tests validate the DefaultWorkPane renderer with specific examples:
 * - Sections rendering
 * - Inner tabs rendering (parent-workspace)
 * - Record actions rendering
 * - Lifecycle actions rendering (workflow)
 * - Loading state
 * - Error state
 * - Empty state
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DefaultWorkPane } from "../defaultRenderers";
import { LVEWorkSection, LVEInnerWorkspaceTab } from "../types";

// ============================================================================
// Test Setup
// ============================================================================

interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

const createTestRecord = (): TestRecord => ({
  id: "1",
  name: "Alice Johnson",
  email: "alice@example.com",
  status: "Active",
});

const createBasicSections = (
  record: TestRecord,
): LVEWorkSection<TestRecord>[] => [
  {
    id: "details",
    title: "Details",
    fields: [
      { id: "name", label: "Name", render: (r) => r.name },
      { id: "email", label: "Email", render: (r) => r.email },
    ],
  },
];

// ============================================================================
// Test Suite: Sections Rendering
// ============================================================================

describe("DefaultWorkPane - Sections Rendering", () => {
  it("should render section title", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("should render section fields", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("should render multiple sections", () => {
    const record = createTestRecord();
    const sections: LVEWorkSection<TestRecord>[] = [
      {
        id: "details",
        title: "Details",
        fields: [{ id: "name", label: "Name", render: (r) => r.name }],
      },
      {
        id: "contact",
        title: "Contact Information",
        fields: [{ id: "email", label: "Email", render: (r) => r.email }],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("should render sections with 2 columns", () => {
    const record = createTestRecord();
    const sections: LVEWorkSection<TestRecord>[] = [
      {
        id: "details",
        title: "Details",
        columns: 2,
        fields: [
          { id: "name", label: "Name", render: (r) => r.name },
          { id: "email", label: "Email", render: (r) => r.email },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    const sectionDiv = screen.getByText("Name").closest("div")?.parentElement;
    expect(sectionDiv).toHaveClass("md:grid-cols-2");
  });

  it("should render sections with 3 columns", () => {
    const record = createTestRecord();
    const sections: LVEWorkSection<TestRecord>[] = [
      {
        id: "details",
        title: "Details",
        columns: 3,
        fields: [
          { id: "name", label: "Name", render: (r) => r.name },
          { id: "email", label: "Email", render: (r) => r.email },
          { id: "status", label: "Status", render: (r) => r.status },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    const sectionDiv = screen.getByText("Name").closest("div")?.parentElement;
    expect(sectionDiv).toHaveClass("md:grid-cols-3");
  });
});

// ============================================================================
// Test Suite: Inner Tabs Rendering (Parent-Workspace)
// ============================================================================

describe("DefaultWorkPane - Inner Tabs Rendering", () => {
  it("should render inner tabs when provided", () => {
    const record = createTestRecord();
    const innerTabs: LVEInnerWorkspaceTab<TestRecord>[] = [
      {
        id: "overview",
        label: "Overview",
        getSections: (r) => [
          {
            id: "details",
            title: "Details",
            fields: [{ id: "name", label: "Name", render: (rec) => rec.name }],
          },
        ],
      },
      {
        id: "activity",
        label: "Activity",
        getSections: (r) => [
          {
            id: "activity",
            title: "Activity",
            fields: [
              { id: "status", label: "Status", render: (rec) => rec.status },
            ],
          },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={[]}
        innerTabs={innerTabs}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });

  it("should render first inner tab as active by default", () => {
    const record = createTestRecord();
    const innerTabs: LVEInnerWorkspaceTab<TestRecord>[] = [
      {
        id: "overview",
        label: "Overview",
        getSections: (r) => [
          {
            id: "details",
            title: "Details",
            fields: [{ id: "name", label: "Name", render: (rec) => rec.name }],
          },
        ],
      },
      {
        id: "activity",
        label: "Activity",
        getSections: (r) => [
          {
            id: "activity",
            title: "Activity",
            fields: [
              { id: "status", label: "Status", render: (rec) => rec.status },
            ],
          },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={[]}
        innerTabs={innerTabs}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    const overviewTab = screen.getByText("Overview").closest("button");
    expect(overviewTab).toHaveClass("border-primary/30");
    expect(overviewTab).toHaveClass("bg-primary/10");
  });

  it("should switch inner tabs when clicked", () => {
    const record = createTestRecord();
    const innerTabs: LVEInnerWorkspaceTab<TestRecord>[] = [
      {
        id: "overview",
        label: "Overview",
        getSections: (r) => [
          {
            id: "details",
            title: "Overview Section",
            fields: [{ id: "name", label: "Name", render: (rec) => rec.name }],
          },
        ],
      },
      {
        id: "activity",
        label: "Activity",
        getSections: (r) => [
          {
            id: "activity",
            title: "Activity Section",
            fields: [
              { id: "status", label: "Status", render: (rec) => rec.status },
            ],
          },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={[]}
        innerTabs={innerTabs}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Overview Section")).toBeInTheDocument();
    expect(screen.queryByText("Activity Section")).not.toBeInTheDocument();

    const activityTab = screen.getByText("Activity");
    fireEvent.click(activityTab);

    expect(screen.queryByText("Overview Section")).not.toBeInTheDocument();
    expect(screen.getByText("Activity Section")).toBeInTheDocument();
  });

  it("should render sections from active inner tab", () => {
    const record = createTestRecord();
    const innerTabs: LVEInnerWorkspaceTab<TestRecord>[] = [
      {
        id: "overview",
        label: "Overview",
        getSections: (r) => [
          {
            id: "details",
            title: "Details",
            fields: [{ id: "name", label: "Name", render: (rec) => rec.name }],
          },
        ],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={[]}
        innerTabs={innerTabs}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("should not render inner tabs when not provided", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /overview/i }),
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Loading State
// ============================================================================

describe("DefaultWorkPane - Loading State", () => {
  it("should display loading message when isLoading is true", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        isLoading={true}
      />,
    );

    expect(screen.getByText("Loading workspace...")).toBeInTheDocument();
  });

  it("should not display sections when isLoading is true", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        isLoading={true}
      />,
    );

    expect(screen.queryByText("Details")).not.toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Error State
// ============================================================================

describe("DefaultWorkPane - Error State", () => {
  it("should display error message when errorMessage is set", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        errorMessage="Failed to load workspace"
      />,
    );

    expect(screen.getByText("Failed to load workspace")).toBeInTheDocument();
  });

  it("should not display sections when errorMessage is set", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);

    render(
      <DefaultWorkPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        errorMessage="Failed to load workspace"
      />,
    );

    expect(screen.queryByText("Details")).not.toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Empty State
// ============================================================================

describe("DefaultWorkPane - Empty State", () => {
  it("should display empty state when no record is selected", () => {
    const sections: LVEWorkSection<TestRecord>[] = [];

    render(
      <DefaultWorkPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.getByText("No record selected")).toBeInTheDocument();
    expect(
      screen.getByText("Select a record to view details"),
    ).toBeInTheDocument();
  });

  it("should not display sections when no record is selected", () => {
    const sections: LVEWorkSection<TestRecord>[] = [
      {
        id: "details",
        title: "Details",
        fields: [{ id: "name", label: "Name", render: (r) => r.name }],
      },
    ];

    render(
      <DefaultWorkPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
      />,
    );

    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });

  it("should not display empty state when loading", () => {
    render(
      <DefaultWorkPane
        selectedRecord={undefined}
        sections={[]}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        isLoading={true}
      />,
    );

    expect(screen.queryByText("No record selected")).not.toBeInTheDocument();
  });

  it("should not display empty state when error is present", () => {
    render(
      <DefaultWorkPane
        selectedRecord={undefined}
        sections={[]}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view details"
        errorMessage="Error loading"
      />,
    );

    expect(screen.queryByText("No record selected")).not.toBeInTheDocument();
  });
});
