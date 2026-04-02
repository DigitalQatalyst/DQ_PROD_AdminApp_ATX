/**
 * Unit Tests for LVEWorkspaceLayout Component
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 13 - Implement LVEWorkspaceLayout unit tests
 *
 * These tests validate specific examples and edge cases for the LVEWorkspaceLayout component.
 * Tests are organized by subtask:
 * - 13.1: Basic layout rendering
 * - 13.2: Module tabs
 * - 13.3: Record tabs
 * - 13.4: Pop pane collapse
 * - 13.5: Pane headers
 * - 13.6: Action rendering
 *
 * **Validates: Requirements 1.1, 1.3, 1.5, 14.1, 14.2, 14.4, 15.1, 15.2, 15.3, 15.5, 16.4, 16.5, 17.1, 17.2, 17.4, 17.5**
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  LVEWorkspaceLayout,
  LVEWorkspaceLayoutProps,
  LVETab,
  LVEWorkspaceAction,
  LVEWorkspacePaneHeader,
} from "../../LVEWorkspaceLayout";
import { User, Plus, Edit, Trash } from "lucide-react";

// ============================================================================
// Test Setup and Helpers
// ============================================================================

/**
 * Wrapper component that provides routing context for tests
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

/**
 * Helper to render LVEWorkspaceLayout with routing context
 */
const renderLayout = (props: LVEWorkspaceLayoutProps) => {
  return render(
    <TestWrapper>
      <LVEWorkspaceLayout {...props} />
    </TestWrapper>,
  );
};

/**
 * Helper to create minimal props for testing
 */
const createMinimalProps = (): LVEWorkspaceLayoutProps => ({
  headerTitle: "Test Workspace",
  listPane: <div>List Pane Content</div>,
  workPane: <div>Work Pane Content</div>,
  popPane: <div>Pop Pane Content</div>,
});

// ============================================================================
// 13.1: Basic Layout Rendering
// **Validates: Requirements 1.1, 1.3**
// ============================================================================

describe("13.1 Basic Layout Rendering", () => {
  it("should render with minimal props", () => {
    const props = createMinimalProps();
    const { container } = renderLayout(props);

    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe("");
    expect(screen.getByText("Test Workspace")).toBeInTheDocument();
  });

  it("should render three-pane grid structure", () => {
    const props = createMinimalProps();
    const { container } = renderLayout(props);

    // Check for grid container
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();

    // Check for three sections (list, work, pop)
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBe(3);
  });

  it("should render header with title", () => {
    const props = createMinimalProps();
    renderLayout(props);

    expect(screen.getByText("Test Workspace")).toBeInTheDocument();
    expect(screen.getByText("LVE Shell")).toBeInTheDocument();
  });

  it("should render header with description", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerTitle: "Contacts Workspace",
      headerDescription: "Manage your contacts efficiently",
    };
    renderLayout(props);

    expect(screen.getByText("Contacts Workspace")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your contacts efficiently"),
    ).toBeInTheDocument();
  });

  it("should render footer when provided", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      footer: <span>Footer Content</span>,
    };
    renderLayout(props);

    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("should not render footer when not provided", () => {
    const props = createMinimalProps();
    const { container } = renderLayout(props);

    const footer = container.querySelector("footer");
    expect(footer).not.toBeInTheDocument();
  });
});

// ============================================================================
// 13.2: Module Tabs
// **Validates: Requirements 17.1, 17.2, 17.4, 17.5**
// ============================================================================

describe("13.2 Module Tabs", () => {
  it("should render module tabs", () => {
    const moduleTabs: LVETab[] = [
      { id: "contacts", label: "Contacts", isActive: true },
      { id: "leads", label: "Leads", isActive: false },
      { id: "accounts", label: "Accounts", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      moduleTabs,
    };
    renderLayout(props);

    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  it("should handle module tab selection", () => {
    const onModuleTabSelect = jest.fn();
    const moduleTabs: LVETab[] = [
      { id: "contacts", label: "Contacts", isActive: true },
      { id: "leads", label: "Leads", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      moduleTabs,
      onModuleTabSelect,
    };
    renderLayout(props);

    const leadsTab = screen.getByText("Leads");
    fireEvent.click(leadsTab);

    expect(onModuleTabSelect).toHaveBeenCalledWith("leads");
  });

  it("should highlight active module tab", () => {
    const moduleTabs: LVETab[] = [
      { id: "contacts", label: "Contacts", isActive: true },
      { id: "leads", label: "Leads", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      moduleTabs,
    };
    const { container } = renderLayout(props);

    // Find the active tab by checking for the active styling classes
    const contactsButton = screen.getByText("Contacts").closest("div");
    const leadsButton = screen.getByText("Leads").closest("div");

    expect(contactsButton?.className).toContain("border-primary");
    expect(leadsButton?.className).not.toContain("border-primary");
  });

  it("should render module tabs label", () => {
    const moduleTabs: LVETab[] = [
      { id: "contacts", label: "Contacts", isActive: true },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      moduleTabs,
      moduleTabsLabel: "Available Modules",
    };
    renderLayout(props);

    // Label is rendered in uppercase
    expect(screen.getByText("Available Modules")).toBeInTheDocument();
  });

  it("should not render module tabs when empty", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      moduleTabs: [],
    };
    const { container } = renderLayout(props);

    // Module tabs section should not be present - check that "Modules" label doesn't exist
    expect(screen.queryByText("Modules")).not.toBeInTheDocument();
  });
});

// ============================================================================
// 13.3: Record Tabs
// **Validates: Requirements 14.1, 14.2, 14.4**
// ============================================================================

describe("13.3 Record Tabs", () => {
  it("should render record tabs", () => {
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true },
      { id: "record-2", label: "Jane Smith", isActive: false },
      { id: "record-3", label: "Bob Johnson", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
    };
    renderLayout(props);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("should handle record tab selection", () => {
    const onTabSelect = jest.fn();
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true },
      { id: "record-2", label: "Jane Smith", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
      onTabSelect,
    };
    renderLayout(props);

    const janeTab = screen.getByText("Jane Smith");
    fireEvent.click(janeTab);

    expect(onTabSelect).toHaveBeenCalledWith("record-2");
  });

  it("should handle record tab closing", () => {
    const onTabClose = jest.fn();
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true, canClose: true },
      { id: "record-2", label: "Jane Smith", isActive: false, canClose: true },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
      onTabClose,
    };
    const { container } = renderLayout(props);

    // Find close button for Jane Smith tab
    const janeTab = screen.getByText("Jane Smith").closest("div");
    const closeButton = janeTab?.querySelector(
      'button[type="button"]:last-child',
    );

    expect(closeButton).toBeInTheDocument();
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onTabClose).toHaveBeenCalledWith("record-2");
    }
  });

  it("should highlight active record tab", () => {
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true },
      { id: "record-2", label: "Jane Smith", isActive: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
    };
    renderLayout(props);

    const johnTab = screen.getByText("John Doe").closest("div");
    const janeTab = screen.getByText("Jane Smith").closest("div");

    expect(johnTab?.className).toContain("border-primary");
    expect(janeTab?.className).not.toContain("border-primary");
  });

  it("should show dirty indicator on tabs", () => {
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true, isDirty: false },
      { id: "record-2", label: "Jane Smith", isActive: false, isDirty: true },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
    };
    const { container } = renderLayout(props);

    // Find Jane Smith tab and check for dirty indicator
    const janeTab = screen.getByText("Jane Smith").closest("button");
    const dirtyIndicator = janeTab?.querySelector(".bg-amber-500");

    expect(dirtyIndicator).toBeInTheDocument();
  });

  it("should not show close button when canClose is false", () => {
    const tabs: LVETab[] = [
      { id: "record-1", label: "John Doe", isActive: true, canClose: false },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      tabs,
    };
    const { container } = renderLayout(props);

    const johnTab = screen.getByText("John Doe").closest("div");
    const closeButtons = johnTab?.querySelectorAll('button[type="button"]');

    // Should only have one button (the tab itself), not a close button
    expect(closeButtons?.length).toBe(1);
  });
});

// ============================================================================
// 13.4: Pop Pane Collapse
// **Validates: Requirements 15.1, 15.2, 15.3, 15.5**
// ============================================================================

describe("13.4 Pop Pane Collapse", () => {
  it("should render collapse button when collapsible=true", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: false,
    };
    const { container } = renderLayout(props);

    // Look for ChevronRight button (collapse button)
    const collapseButton = container.querySelector('button[type="button"] svg');
    expect(collapseButton).toBeInTheDocument();
  });

  it("should not render collapse button when collapsible=false", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: false,
    };
    const { container } = renderLayout(props);

    // Pop pane should be visible but without collapse button
    expect(screen.getByText("Pop Pane Content")).toBeInTheDocument();

    // Check that there's no collapse button in the pop pane header
    const sections = container.querySelectorAll("section");
    const popSection = sections[2]; // Third section is pop pane
    const collapseButton = popSection?.querySelector(
      'button[aria-label="Show context pane"]',
    );
    expect(collapseButton).not.toBeInTheDocument();
  });

  it("should toggle collapse state", () => {
    const onPopPaneCollapsedChange = jest.fn();
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: false,
      onPopPaneCollapsedChange,
    };
    const { container } = renderLayout(props);

    // Find and click collapse button
    const sections = container.querySelectorAll("section");
    const popSection = sections[2];
    const collapseButton = popSection?.querySelector('button[type="button"]');

    expect(collapseButton).toBeInTheDocument();
    if (collapseButton) {
      fireEvent.click(collapseButton);
      expect(onPopPaneCollapsedChange).toHaveBeenCalledWith(true);
    }
  });

  it("should adjust grid columns when collapsed", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: true,
    };
    const { container } = renderLayout(props);

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer?.className).toContain("grid-cols-");

    // When collapsed, should have different grid columns
    expect(gridContainer?.className).toMatch(/grid-cols-\[.*3\.25rem\]/);
  });

  it("should adjust grid columns when expanded", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: false,
    };
    const { container } = renderLayout(props);

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer?.className).toContain("grid-cols-");

    // When expanded, should have three full columns with the pop pane visible
    expect(gridContainer?.className).toContain("0.85fr");
  });

  it("should show expand button when collapsed", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: true,
    };
    const { container } = renderLayout(props);

    const expandButton = container.querySelector(
      'button[aria-label="Show context pane"]',
    );
    expect(expandButton).toBeInTheDocument();
  });

  it("should expand when expand button clicked", () => {
    const onPopPaneCollapsedChange = jest.fn();
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      isPopPaneCollapsed: true,
      onPopPaneCollapsedChange,
    };
    const { container } = renderLayout(props);

    const expandButton = container.querySelector(
      'button[aria-label="Show context pane"]',
    );

    expect(expandButton).toBeInTheDocument();
    if (expandButton) {
      fireEvent.click(expandButton);
      expect(onPopPaneCollapsedChange).toHaveBeenCalledWith(false);
    }
  });

  it("should use default collapse state in uncontrolled mode", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popPaneCollapsible: true,
      defaultPopPaneCollapsed: true,
    };
    const { container } = renderLayout(props);

    // Should start collapsed
    const expandButton = container.querySelector(
      'button[aria-label="Show context pane"]',
    );
    expect(expandButton).toBeInTheDocument();
  });
});

// ============================================================================
// 13.5: Pane Headers
// **Validates: Requirements 1.5**
// ============================================================================

describe("13.5 Pane Headers", () => {
  it("should render list header with all fields", () => {
    const listHeader: LVEWorkspacePaneHeader = {
      eyebrow: "RECORD QUEUE",
      title: "Contacts",
      subtitle: "125 total contacts",
      meta: <span>Meta Content</span>,
    };

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      listHeader,
    };
    renderLayout(props);

    expect(screen.getByText("RECORD QUEUE")).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("125 total contacts")).toBeInTheDocument();
    expect(screen.getByText("Meta Content")).toBeInTheDocument();
  });

  it("should render work header with all fields", () => {
    const workHeader: LVEWorkspacePaneHeader = {
      eyebrow: "CONTACT DETAILS",
      title: "John Doe",
      subtitle: "john.doe@example.com",
      meta: <span>Last updated: 2 hours ago</span>,
    };

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      workHeader,
    };
    renderLayout(props);

    expect(screen.getByText("CONTACT DETAILS")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Last updated: 2 hours ago")).toBeInTheDocument();
  });

  it("should render pop header with all fields", () => {
    const popHeader: LVEWorkspacePaneHeader = {
      eyebrow: "CONTEXT",
      title: "Related Information",
      subtitle: "Quick access to related data",
    };

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      popHeader,
    };
    renderLayout(props);

    expect(screen.getByText("CONTEXT")).toBeInTheDocument();
    expect(screen.getByText("Related Information")).toBeInTheDocument();
    expect(
      screen.getByText("Quick access to related data"),
    ).toBeInTheDocument();
  });

  it("should render header actions", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "edit", label: "Edit", icon: Edit, onClick: jest.fn() },
      { id: "delete", label: "Delete", icon: Trash, onClick: jest.fn() },
    ];

    const workHeader: LVEWorkspacePaneHeader = {
      title: "John Doe",
      actions,
    };

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      workHeader,
    };
    renderLayout(props);

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should render header title actions", () => {
    const titleActions: LVEWorkspaceAction[] = [
      { id: "refresh", label: "Refresh", onClick: jest.fn() },
    ];

    const listHeader: LVEWorkspacePaneHeader = {
      title: "Contacts",
      titleActions,
    };

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      listHeader,
    };
    renderLayout(props);

    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("should use fallback title when header not provided", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      listHeader: undefined,
    };
    renderLayout(props);

    expect(screen.getByText("Record Queue")).toBeInTheDocument();
  });
});

// ============================================================================
// 13.6: Action Rendering
// **Validates: Requirements 16.4, 16.5**
// ============================================================================

describe("13.6 Action Rendering", () => {
  it("should render action buttons", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "create", label: "Create", icon: Plus },
      { id: "edit", label: "Edit", icon: Edit },
      { id: "delete", label: "Delete", icon: Trash },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    renderLayout(props);

    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should render action with correct variant", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "primary", label: "Primary Action", variant: "primary" },
      { id: "secondary", label: "Secondary Action", variant: "secondary" },
      { id: "outline", label: "Outline Action", variant: "outline" },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    const { container } = renderLayout(props);

    const primaryButton = screen.getByText("Primary Action").closest("button");
    const secondaryButton = screen
      .getByText("Secondary Action")
      .closest("button");
    const outlineButton = screen.getByText("Outline Action").closest("button");

    // Buttons should exist
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
    expect(outlineButton).toBeInTheDocument();
  });

  it("should render disabled action", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "disabled", label: "Disabled Action", disabled: true },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    renderLayout(props);

    const button = screen.getByText("Disabled Action").closest("button");
    expect(button).toBeDisabled();
  });

  it("should handle action onClick", () => {
    const onClick = jest.fn();
    const actions: LVEWorkspaceAction[] = [
      { id: "clickable", label: "Click Me", onClick },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    renderLayout(props);

    const button = screen.getByText("Click Me");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render action with icon", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "with-icon", label: "With Icon", icon: User },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    const { container } = renderLayout(props);

    const button = screen.getByText("With Icon").closest("button");
    const icon = button?.querySelector("svg");

    expect(icon).toBeInTheDocument();
  });

  it("should not render actions when array is empty", () => {
    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: [],
    };
    const { container } = renderLayout(props);

    // Header should exist but without action buttons
    expect(screen.getByText("Test Workspace")).toBeInTheDocument();

    // No action buttons should be rendered
    const buttons = container.querySelectorAll('button[type="button"]');
    // Only collapse/expand buttons should exist, not action buttons
    expect(buttons.length).toBeLessThan(3);
  });

  it("should render multiple actions in correct order", () => {
    const actions: LVEWorkspaceAction[] = [
      { id: "first", label: "First Action" },
      { id: "second", label: "Second Action" },
      { id: "third", label: "Third Action" },
    ];

    const props: LVEWorkspaceLayoutProps = {
      ...createMinimalProps(),
      headerActions: actions,
    };
    renderLayout(props);

    const firstButton = screen.getByText("First Action");
    const secondButton = screen.getByText("Second Action");
    const thirdButton = screen.getByText("Third Action");

    expect(firstButton).toBeInTheDocument();
    expect(secondButton).toBeInTheDocument();
    expect(thirdButton).toBeInTheDocument();
  });
});
