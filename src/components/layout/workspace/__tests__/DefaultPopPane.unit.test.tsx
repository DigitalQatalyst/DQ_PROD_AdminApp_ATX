/**
 * Unit Tests for DefaultPopPane Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 14.3 - Write unit tests for DefaultPopPane
 *
 * **Validates: Requirements 13.4, 13.5**
 *
 * These tests validate the DefaultPopPane renderer with specific examples:
 * - Context sections rendering
 * - Quick actions rendering
 * - Loading state
 * - Error state
 * - Empty state
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DefaultPopPane } from "../defaultRenderers";
import { LVEContextSection, LVEActionDefinition } from "../types";
import { Mail, Phone } from "lucide-react";

// ============================================================================
// Test Setup
// ============================================================================

interface TestRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

const createTestRecord = (): TestRecord => ({
  id: "1",
  name: "Alice Johnson",
  email: "alice@example.com",
  phone: "+1234567890",
  status: "Active",
});

const createBasicSections = (
  record: TestRecord,
): LVEContextSection<TestRecord>[] => [
  {
    id: "contact",
    title: "Contact Info",
    items: [
      { id: "email", label: "Email", render: (r) => r.email },
      { id: "phone", label: "Phone", render: (r) => r.phone },
    ],
  },
];

// ============================================================================
// Test Suite: Context Sections Rendering
// ============================================================================

describe("DefaultPopPane - Context Sections Rendering", () => {
  it("should render section title", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Contact Info")).toBeInTheDocument();
  });

  it("should render section items", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
  });

  it("should render multiple sections", () => {
    const record = createTestRecord();
    const sections: LVEContextSection<TestRecord>[] = [
      {
        id: "contact",
        title: "Contact Info",
        items: [{ id: "email", label: "Email", render: (r) => r.email }],
      },
      {
        id: "status",
        title: "Account Status",
        items: [{ id: "status", label: "Status", render: (r) => r.status }],
      },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Contact Info")).toBeInTheDocument();
    expect(screen.getByText("Account Status")).toBeInTheDocument();
  });

  it("should render section actions when provided", () => {
    const record = createTestRecord();
    const sectionActions: LVEActionDefinition<TestRecord>[] = [
      { id: "edit", label: "Edit", icon: Mail },
    ];
    const sections: LVEContextSection<TestRecord>[] = [
      {
        id: "contact",
        title: "Contact Info",
        items: [{ id: "email", label: "Email", render: (r) => r.email }],
        actions: sectionActions,
      },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should call onAction when section action is clicked", () => {
    const record = createTestRecord();
    const sectionActions: LVEActionDefinition<TestRecord>[] = [
      { id: "edit", label: "Edit", icon: Mail },
    ];
    const sections: LVEContextSection<TestRecord>[] = [
      {
        id: "contact",
        title: "Contact Info",
        items: [{ id: "email", label: "Email", render: (r) => r.email }],
        actions: sectionActions,
      },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(onAction).toHaveBeenCalledWith(sectionActions[0]);
  });
});

// ============================================================================
// Test Suite: Quick Actions Rendering
// ============================================================================

describe("DefaultPopPane - Quick Actions Rendering", () => {
  it("should render quick actions when provided", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const quickActions: LVEActionDefinition<TestRecord>[] = [
      { id: "email", label: "Send Email", icon: Mail },
      { id: "call", label: "Call", icon: Phone },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        quickActions={quickActions}
      />,
    );

    expect(screen.getByText("Send Email")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
  });

  it("should call onAction when quick action is clicked", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const quickActions: LVEActionDefinition<TestRecord>[] = [
      { id: "email", label: "Send Email", icon: Mail },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        quickActions={quickActions}
      />,
    );

    const emailButton = screen.getByText("Send Email");
    fireEvent.click(emailButton);

    expect(onAction).toHaveBeenCalledWith(quickActions[0]);
  });

  it("should disable quick actions when disabled is true", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const quickActions: LVEActionDefinition<TestRecord>[] = [
      { id: "email", label: "Send Email", icon: Mail, disabled: true },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        quickActions={quickActions}
      />,
    );

    const emailButton = screen.getByText("Send Email");
    expect(emailButton).toBeDisabled();
  });

  it("should not render quick actions when not provided", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("Send Email")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Loading State
// ============================================================================

describe("DefaultPopPane - Loading State", () => {
  it("should display loading message when isLoading is true", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        isLoading={true}
      />,
    );

    expect(screen.getByText("Loading context...")).toBeInTheDocument();
  });

  it("should not display sections when isLoading is true", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        isLoading={true}
      />,
    );

    expect(screen.queryByText("Contact Info")).not.toBeInTheDocument();
    expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Error State
// ============================================================================

describe("DefaultPopPane - Error State", () => {
  it("should display error message when errorMessage is set", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        errorMessage="Failed to load context"
      />,
    );

    expect(screen.getByText("Failed to load context")).toBeInTheDocument();
  });

  it("should not display sections when errorMessage is set", () => {
    const record = createTestRecord();
    const sections = createBasicSections(record);
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={record}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        errorMessage="Failed to load context"
      />,
    );

    expect(screen.queryByText("Contact Info")).not.toBeInTheDocument();
    expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite: Empty State
// ============================================================================

describe("DefaultPopPane - Empty State", () => {
  it("should display empty state when no record is selected", () => {
    const sections: LVEContextSection<TestRecord>[] = [];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("No record selected")).toBeInTheDocument();
    expect(
      screen.getByText("Select a record to view context"),
    ).toBeInTheDocument();
  });

  it("should not display sections when no record is selected", () => {
    const sections: LVEContextSection<TestRecord>[] = [
      {
        id: "contact",
        title: "Contact Info",
        items: [{ id: "email", label: "Email", render: (r) => r.email }],
      },
    ];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
      />,
    );

    expect(screen.queryByText("Contact Info")).not.toBeInTheDocument();
  });

  it("should not display empty state when loading", () => {
    const sections: LVEContextSection<TestRecord>[] = [];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        isLoading={true}
      />,
    );

    expect(screen.queryByText("No record selected")).not.toBeInTheDocument();
  });

  it("should not display empty state when error is present", () => {
    const sections: LVEContextSection<TestRecord>[] = [];
    const onAction = jest.fn();

    render(
      <DefaultPopPane
        selectedRecord={undefined}
        sections={sections}
        emptyTitle="No record selected"
        emptyDescription="Select a record to view context"
        onAction={onAction}
        errorMessage="Error loading"
      />,
    );

    expect(screen.queryByText("No record selected")).not.toBeInTheDocument();
  });
});
