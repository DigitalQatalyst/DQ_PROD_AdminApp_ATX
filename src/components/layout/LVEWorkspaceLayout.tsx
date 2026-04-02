import React, { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "../ui/ButtonComponent";

/**
 * Represents a tab in the workspace (either module tab or record tab).
 */
export interface LVETab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label shown in the tab */
  label: string;
  /** Whether this tab is currently active/selected */
  isActive?: boolean;
  /** Whether this tab has unsaved changes (shows dirty indicator) */
  isDirty?: boolean;
  /** Whether this tab can be closed by the user (defaults to true) */
  canClose?: boolean;
}

/**
 * Represents an action button in the workspace (header actions, pane actions, etc.).
 */
export interface LVEWorkspaceAction {
  /** Unique identifier for the action */
  id: string;
  /** Display label shown on the button */
  label: string;
  /** Optional icon component to display alongside the label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Visual style variant for the button (defaults to "outline" for header actions, "ghost" for title actions) */
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost";
  /** Whether the action button is disabled */
  disabled?: boolean;
  /** Callback function invoked when the action button is clicked */
  onClick?: () => void;
}

/**
 * Generic configuration for a pane header (list, work, or pop pane).
 * All fields are optional and accept only generic content - no module-specific logic.
 */
export interface LVEWorkspacePaneHeader {
  /** Small uppercase label displayed above the title (e.g., "RECORD QUEUE", "WORKSPACE") */
  eyebrow?: string;
  /** Main title for the pane header (can be string or ReactNode for dynamic content) */
  title?: ReactNode;
  /** Small action buttons displayed inline with the title (rendered with "ghost" variant) */
  titleActions?: LVEWorkspaceAction[];
  /** Subtitle text displayed below the title (typically smaller, muted text) */
  subtitle?: ReactNode;
  /** Additional metadata content displayed below the subtitle (e.g., badges, status indicators) */
  meta?: ReactNode;
  /** Action buttons displayed in the top-right of the header (rendered with "outline" variant) */
  actions?: LVEWorkspaceAction[];
}

/**
 * Props for the LVEWorkspaceLayout component.
 *
 * This interface defines the complete contract for the Shell_Layout component.
 * All props are generic and reusable across any module type - no module-specific
 * props or conditional logic should be added to this interface.
 *
 * @template TRecord - The record type is not used directly by the layout, but may
 *                     be present in action callbacks passed from the orchestrator.
 *
 * @example
 * ```tsx
 * <LVEWorkspaceLayout
 *   headerTitle="Contacts Workspace"
 *   headerDescription="Manage your contacts"
 *   tabs={recordTabs}
 *   onTabSelect={handleTabSelect}
 *   onTabClose={handleTabClose}
 *   listHeader={{ title: "Contact Queue", eyebrow: "RECORDS" }}
 *   listPane={<ContactList />}
 *   workHeader={{ title: "Contact Details" }}
 *   workPane={<ContactForm />}
 *   popHeader={{ title: "Context" }}
 *   popPane={<ContactContext />}
 *   popPaneCollapsible={true}
 * />
 * ```
 */
export interface LVEWorkspaceLayoutProps {
  // ============================================================================
  // HEADER CONFIGURATION
  // ============================================================================

  /** Main title displayed in the workspace header (defaults to "Workspace") */
  headerTitle?: string;

  /** Description text displayed below the header title */
  headerDescription?: ReactNode;

  /** Action buttons displayed in the top-right of the header */
  headerActions?: LVEWorkspaceAction[];

  // ============================================================================
  // MODULE TABS (for switching between different modules)
  // ============================================================================

  /** Array of module tabs (e.g., Contacts, Leads, Accounts) */
  moduleTabs?: LVETab[];

  /** Label for the module tabs section (defaults to "Modules") */
  moduleTabsLabel?: string;

  /** Callback invoked when a module tab is selected */
  onModuleTabSelect?: (tabId: string) => void;

  // ============================================================================
  // RECORD TABS (for switching between open records within a module)
  // ============================================================================

  /** Array of record tabs (e.g., open contact records) */
  tabs?: LVETab[];

  /** Label for the record tabs section (defaults to "Records") */
  recordTabsLabel?: string;

  /** Callback invoked when a record tab is selected */
  onTabSelect?: (tabId: string) => void;

  /** Callback invoked when a record tab is closed */
  onTabClose?: (tabId: string) => void;

  // ============================================================================
  // LIST PANE (left pane - typically shows a queue/list of records)
  // ============================================================================

  /** Generic header configuration for the list pane */
  listHeader?: LVEWorkspacePaneHeader;

  /** Optional toolbar content displayed below the list header (e.g., search, filters) */
  listToolbar?: ReactNode;

  /** Content to render in the list pane body */
  listPane?: ReactNode;

  // ============================================================================
  // WORK PANE (center pane - typically shows the active record details/form)
  // ============================================================================

  /** Generic header configuration for the work pane */
  workHeader?: LVEWorkspacePaneHeader;

  /** Content to render in the work pane body */
  workPane?: ReactNode;

  // ============================================================================
  // POP PANE (right pane - typically shows context/metadata)
  // ============================================================================

  /** Generic header configuration for the pop pane */
  popHeader?: LVEWorkspacePaneHeader;

  /** Content to render in the pop pane body */
  popPane?: ReactNode;

  /** Whether the pop pane can be collapsed by the user (defaults to true) */
  popPaneCollapsible?: boolean;

  /** Controlled state for pop pane collapse (if provided, component becomes controlled) */
  isPopPaneCollapsed?: boolean;

  /** Callback invoked when pop pane collapse state changes */
  onPopPaneCollapsedChange?: (nextValue: boolean) => void;

  /** Default collapse state for uncontrolled mode (defaults to false) */
  defaultPopPaneCollapsed?: boolean;

  // ============================================================================
  // FOOTER
  // ============================================================================

  /** Optional footer content displayed at the bottom of the workspace */
  footer?: ReactNode;
}

const renderActions = (actions?: LVEWorkspaceAction[]) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          size="sm"
          variant={action.variant ?? "outline"}
          disabled={action.disabled}
          onClick={action.onClick}
          className="h-9 border-border bg-background px-3 hover:bg-secondary hover:text-foreground"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

const renderTitleActions = (actions?: LVEWorkspaceAction[]) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          size="sm"
          variant={action.variant ?? "ghost"}
          disabled={action.disabled}
          onClick={action.onClick}
          className="h-7 gap-1.5 px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        >
          {action.icon && <action.icon className="h-3.5 w-3.5" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

const renderTabBar = ({
  tabs,
  onSelect,
  onClose,
  label,
}: {
  tabs: LVETab[];
  onSelect?: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  label?: string;
}) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b border-border bg-muted/50 px-3 py-2">
      {label && (
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group inline-flex max-w-xs items-center rounded-md border transition-colors",
              tab.isActive
                ? "border-primary bg-card text-primary shadow-sm"
                : "border-border bg-muted text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect?.(tab.id)}
              className="inline-flex min-w-0 items-center px-3 py-1.5 text-xs"
            >
              <span className="truncate">{tab.label}</span>
              {tab.isDirty && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
            {tab.canClose !== false && onClose && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab.id);
                }}
                className="ml-2 rounded p-0.5 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderPaneHeader = (
  header: LVEWorkspacePaneHeader | undefined,
  fallbackTitle: string,
  rightSide?: ReactNode,
) => (
  <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
    <div className="min-w-0">
      {header?.eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {header.eyebrow}
        </p>
      )}
      <div className="mt-0.5 flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 truncate text-sm font-semibold text-foreground">
          {header?.title ?? fallbackTitle}
        </h2>
        {renderTitleActions(header?.titleActions)}
      </div>
      {header?.subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {header.subtitle}
        </p>
      )}
      {header?.meta && <div className="mt-1.5">{header.meta}</div>}
    </div>
    {rightSide}
  </div>
);

/**
 * LVEWorkspaceLayout - Shell Layout Component
 *
 * Global ATX List | View | Edit shell that provides a three-pane workspace layout.
 * This component is a pure layout primitive that accepts only generic props and
 * delegates all module-specific behavior to the orchestrator (LVEWorkspace.tsx).
 *
 * ## Design Principles
 *
 * 1. **Generic Props Only**: All props are generic and reusable across any module type.
 *    No module-specific props or conditional logic based on module type/ID.
 *
 * 2. **Separation of Concerns**: This component handles only visual layout and structure.
 *    The orchestrator (LVEWorkspace.tsx) handles routing, state, and API integration.
 *
 * 3. **Pane Header Contract**: Pane headers accept only generic configuration:
 *    - eyebrow: Small uppercase label
 *    - title: Main title (string or ReactNode)
 *    - titleActions: Small inline action buttons
 *    - subtitle: Secondary text below title
 *    - meta: Additional metadata content
 *    - actions: Action buttons in top-right
 *
 * 4. **UI Styling Preservation**: All Tailwind classes and visual design are preserved.
 *    This component should not be modified for styling changes.
 *
 * ## Three-Pane Layout
 *
 * - **List Pane** (left): Typically shows a queue/list of records
 * - **Work Pane** (center): Typically shows the active record details/form
 * - **Pop Pane** (right): Typically shows context/metadata, can be collapsed
 *
 * ## Module Types Support
 *
 * This layout supports all module types through the same structure:
 * - Record modules: Standard CRUD operations
 * - Workflow modules: Lifecycle-aware workflows
 * - Parent workspace modules: Nested workspaces with inner tabs
 *
 * All module-specific behavior is handled by the orchestrator through configuration.
 *
 * @example
 * ```tsx
 * // Basic usage with minimal props
 * <LVEWorkspaceLayout
 *   headerTitle="Contacts"
 *   listPane={<ContactList />}
 *   workPane={<ContactForm />}
 *   popPane={<ContactContext />}
 * />
 *
 * // Full usage with all features
 * <LVEWorkspaceLayout
 *   headerTitle="Contacts Workspace"
 *   headerDescription="Manage your contacts"
 *   headerActions={[
 *     { id: "import", label: "Import", onClick: handleImport },
 *     { id: "export", label: "Export", onClick: handleExport },
 *   ]}
 *   moduleTabs={[
 *     { id: "contacts", label: "Contacts", isActive: true },
 *     { id: "leads", label: "Leads", isActive: false },
 *   ]}
 *   onModuleTabSelect={handleModuleTabSelect}
 *   tabs={[
 *     { id: "contact-1", label: "John Doe", isActive: true, isDirty: false },
 *     { id: "contact-2", label: "Jane Smith", isActive: false, isDirty: true },
 *   ]}
 *   onTabSelect={handleTabSelect}
 *   onTabClose={handleTabClose}
 *   listHeader={{
 *     eyebrow: "RECORD QUEUE",
 *     title: "Contacts",
 *     subtitle: "125 total contacts",
 *   }}
 *   listToolbar={<SearchAndFilters />}
 *   listPane={<ContactList />}
 *   workHeader={{
 *     eyebrow: "CONTACT DETAILS",
 *     title: "John Doe",
 *     subtitle: "john.doe@example.com",
 *     actions: [
 *       { id: "edit", label: "Edit", onClick: handleEdit },
 *       { id: "delete", label: "Delete", onClick: handleDelete },
 *     ],
 *   }}
 *   workPane={<ContactForm />}
 *   popHeader={{
 *     title: "Context",
 *     subtitle: "Related information",
 *   }}
 *   popPane={<ContactContext />}
 *   popPaneCollapsible={true}
 *   isPopPaneCollapsed={false}
 *   onPopPaneCollapsedChange={setIsPopPaneCollapsed}
 * />
 * ```
 *
 * @see LVEWorkspace.tsx - The orchestrator that uses this layout component
 * @see types.ts - Complete type definitions for workspace contracts
 */
export const LVEWorkspaceLayout: React.FC<LVEWorkspaceLayoutProps> = ({
  headerTitle = "Workspace",
  headerDescription = "Module queue, active workspace, and context stay visible in one shell.",
  headerActions,
  moduleTabs = [],
  moduleTabsLabel = "Modules",
  onModuleTabSelect,
  tabs = [],
  recordTabsLabel = "Records",
  onTabSelect,
  onTabClose,
  listHeader,
  listToolbar,
  listPane,
  workHeader,
  workPane,
  popHeader,
  popPane,
  popPaneCollapsible = true,
  isPopPaneCollapsed: controlledPopPaneCollapsed,
  onPopPaneCollapsedChange,
  defaultPopPaneCollapsed = false,
  footer,
}) => {
  const [uncontrolledPopPaneCollapsed, setUncontrolledPopPaneCollapsed] =
    useState(defaultPopPaneCollapsed);
  const isPopPaneCollapsed =
    controlledPopPaneCollapsed ?? uncontrolledPopPaneCollapsed;
  const hasModuleTabs = moduleTabs.length > 0;
  const hasTabs = tabs.length > 0;
  const hasPopPane = Boolean(popPane);

  const setIsPopPaneCollapsed = (nextValue: boolean) => {
    if (controlledPopPaneCollapsed === undefined) {
      setUncontrolledPopPaneCollapsed(nextValue);
    }

    onPopPaneCollapsedChange?.(nextValue);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background">
      {hasModuleTabs &&
        renderTabBar({
          tabs: moduleTabs,
          onSelect: onModuleTabSelect,
          label: moduleTabsLabel,
        })}

      <header className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              LVE Shell
            </p>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {headerDescription}
            </p>
          </div>
          {renderActions(headerActions)}
        </div>
      </header>

      {hasTabs &&
        renderTabBar({
          tabs,
          onSelect: onTabSelect,
          onClose: onTabClose,
          label: recordTabsLabel,
        })}

      <div className="relative min-h-0 min-w-0 flex-1 overflow-auto">
        <div
          className={cn(
            "grid h-full min-h-full w-full",
            hasPopPane && !isPopPaneCollapsed
              ? "grid-cols-[minmax(18rem,0.95fr)_minmax(34rem,1.7fr)_minmax(16rem,0.85fr)]"
              : hasPopPane && popPaneCollapsible
                ? "grid-cols-[minmax(18rem,1fr)_minmax(36rem,2.15fr)_3.25rem]"
                : "grid-cols-[minmax(18rem,1fr)_minmax(36rem,2.15fr)]",
          )}
        >
          <section className="flex min-h-0 min-w-0 flex-col border-r border-border bg-card">
            {renderPaneHeader(listHeader, "Record Queue", listToolbar)}
            <div className="min-h-0 flex-1 overflow-auto">
              {listPane ?? (
                <div className="p-4 text-sm text-muted-foreground">
                  Queue content renders here.
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-0 min-w-0 flex-col border-r border-border bg-card">
            {renderPaneHeader(
              workHeader,
              "Workspace",
              renderActions(workHeader?.actions),
            )}
            <div className="min-h-0 flex-1 overflow-auto">
              {workPane ?? (
                <div className="flex h-full items-center justify-center px-6 py-8">
                  <div className="max-w-md text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      Active Workspace
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Select a record from the queue to start working without
                      leaving the module.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {hasPopPane && !isPopPaneCollapsed && (
            <section className="flex min-h-0 min-w-0 flex-col bg-muted/30">
              {renderPaneHeader(
                popHeader,
                "Context",
                popPaneCollapsible ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 border-border bg-background px-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    onClick={() => setIsPopPaneCollapsed(true)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : undefined,
              )}
              <div className="min-h-0 flex-1 overflow-auto">{popPane}</div>
            </section>
          )}

          {hasPopPane && popPaneCollapsible && isPopPaneCollapsed && (
            <section className="flex min-h-0 min-w-0 flex-col border-l border-border bg-muted/20">
              <div className="flex h-full items-start justify-center px-1 py-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 border-border bg-background px-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsPopPaneCollapsed(false)}
                  aria-label="Show context pane"
                  title="Show context pane"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {footer && (
        <footer className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <span>System Status</span>
          <span>{footer}</span>
        </footer>
      )}
    </div>
  );
};
