import React, { ReactNode, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PanelRight,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "../ui/ButtonComponent";

export interface LVETab {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
  canClose?: boolean;
}

export interface LVEWorkspaceAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
}

export interface LVEWorkspacePaneHeader {
  eyebrow?: string;
  title?: ReactNode;
  titleActions?: LVEWorkspaceAction[];
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: LVEWorkspaceAction[];
}

export interface LVEWorkspaceLayoutProps {
  headerTitle?: string;
  headerDescription?: ReactNode;
  headerActions?: LVEWorkspaceAction[];
  moduleTabs?: LVETab[];
  onModuleTabSelect?: (tabId: string) => void;
  tabs?: LVETab[];
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  listHeader?: LVEWorkspacePaneHeader;
  listToolbar?: ReactNode;
  listPane?: ReactNode;
  workHeader?: LVEWorkspacePaneHeader;
  workPane?: ReactNode;
  popHeader?: LVEWorkspacePaneHeader;
  popPane?: ReactNode;
  defaultPopPaneCollapsed?: boolean;
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
        <p className="mt-0.5 text-xs text-muted-foreground">{header.subtitle}</p>
      )}
      {header?.meta && <div className="mt-1.5">{header.meta}</div>}
    </div>
    {rightSide}
  </div>
);

/**
 * LVEWorkspaceLayout
 *
 * Global ATX List | View | Edit shell.
 * Keeps the queue visible, preserves tabbed workspaces, and leaves module behavior
 * in configuration rather than embedding module-specific logic in the layout.
 */
export const LVEWorkspaceLayout: React.FC<LVEWorkspaceLayoutProps> = ({
  headerTitle = "Workspace",
  headerDescription = "Module queue, active workspace, and context stay visible in one shell.",
  headerActions,
  moduleTabs = [],
  onModuleTabSelect,
  tabs = [],
  onTabSelect,
  onTabClose,
  listHeader,
  listToolbar,
  listPane,
  workHeader,
  workPane,
  popHeader,
  popPane,
  defaultPopPaneCollapsed = false,
  footer,
}) => {
  const [isPopPaneCollapsed, setIsPopPaneCollapsed] = useState(
    defaultPopPaneCollapsed,
  );
  const hasModuleTabs = moduleTabs.length > 0;
  const hasTabs = tabs.length > 0;
  const hasPopPane = Boolean(popPane);

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background">
      {hasModuleTabs &&
        renderTabBar({
          tabs: moduleTabs,
          onSelect: onModuleTabSelect,
          label: "Modules",
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
          label: "Records",
        })}

      <div className="relative min-h-0 min-w-0 flex-1 overflow-auto">
        {hasPopPane && isPopPaneCollapsed && (
          <button
            type="button"
            onClick={() => setIsPopPaneCollapsed(false)}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <PanelRight className="h-3.5 w-3.5" />
            Show Context
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          className={cn(
            "grid h-full min-h-full w-full",
            hasPopPane && !isPopPaneCollapsed
              ? "grid-cols-[minmax(18rem,0.95fr)_minmax(34rem,1.7fr)_minmax(16rem,0.85fr)]"
              : "grid-cols-[minmax(18rem,1fr)_minmax(36rem,2.15fr)]",
          )}
        >
          <section className="flex min-h-0 min-w-0 flex-col border-r border-border bg-card">
            {renderPaneHeader(
              listHeader,
              "Record Queue",
              listToolbar,
            )}
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
                      Select a record from the queue to start working without leaving the module.
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2 border-border bg-background px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsPopPaneCollapsed(true)}
                >
                  <span>Collapse</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>,
              )}
              <div className="min-h-0 flex-1 overflow-auto">
                {popPane}
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
