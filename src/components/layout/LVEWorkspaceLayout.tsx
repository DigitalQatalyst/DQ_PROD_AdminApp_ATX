import React, { ReactNode } from "react";

export interface LVETab {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
}
export type LVEViewMode = "list-only" | "list-work-context" | "list-work";

export interface LVEWorkspaceLayoutProps {
  headerTitle?: string;
  tenantLabel?: string;
  streamLabel?: string;
  tabs?: LVETab[];
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTenantClick?: () => void;
  onStreamClick?: () => void;
  onSettingsClick?: () => void;
  menuPane?: ReactNode;
  listPane?: ReactNode;
  workPane?: ReactNode;
  popPane?: ReactNode;
  footer?: ReactNode;
  showPaneControls?: boolean;
  initialViewMode?: LVEViewMode;
  viewMode?: LVEViewMode;
  onViewModeChange?: (mode: LVEViewMode) => void;
}

/**
 * LVEWorkspaceLayout
 *
 * Reusable layout shell implementing the List | View | Edit (LVE) workspace structure.
 * This component is deliberately UI-only: it contains no module-specific logic and is
 * driven entirely by props so it can be reused across modules.
 */
export const LVEWorkspaceLayout: React.FC<LVEWorkspaceLayoutProps> = ({
  headerTitle = "Workspace",
  tenantLabel = "Default Tenant",
  streamLabel = "Default Stream",
  tabs = [],
  onTabSelect,
  onTabClose,
  onTenantClick,
  onStreamClick,
  onSettingsClick,
  menuPane,
  listPane,
  workPane,
  popPane,
  footer,
  showPaneControls = false,
  initialViewMode = "list-work-context",
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const hasTabs = tabs && tabs.length > 0;
  const [internalViewMode, setInternalViewMode] = React.useState<LVEViewMode>(initialViewMode);
  const viewMode = controlledViewMode ?? internalViewMode;

  const setMode = (mode: LVEViewMode) => {
    if (!controlledViewMode) {
      setInternalViewMode(mode);
    }
    onViewModeChange?.(mode);
  };

  const showWorkPane = viewMode === "list-work-context" || viewMode === "list-work";
  const showPopPane = viewMode === "list-work-context";
  const gridTemplateColumns = menuPane
    ? viewMode === "list-only"
      ? "minmax(200px,240px) minmax(420px,1fr)"
      : viewMode === "list-work-context"
        ? "minmax(200px,240px) minmax(320px,380px) minmax(520px,1fr) minmax(260px,320px)"
        : "minmax(200px,240px) minmax(360px,420px) minmax(620px,1fr)"
    : viewMode === "list-only"
      ? "minmax(420px,1fr)"
      : viewMode === "list-work-context"
        ? "minmax(320px,380px) minmax(520px,1fr) minmax(260px,320px)"
        : "minmax(360px,420px) minmax(620px,1fr)";

  return (
    <div className="flex flex-col h-full w-full bg-background border border-border overflow-hidden">

      {/* Tabs Row */}
      {hasTabs && (
        <div className="border-b border-border bg-muted/50 px-2 py-1 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active = tab.isActive;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabSelect?.(tab.id)}
                  className={`group inline-flex items-center max-w-xs px-3 py-1.5 rounded-md text-xs border transition-colors ${
                    active
                      ? "bg-card border-primary text-primary shadow-sm"
                      : "bg-muted border-border text-muted-foreground hover:bg-card"
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {tab.isDirty && (
                    <span className="ml-1 text-[10px] text-amber-500">●</span>
                  )}
                  {onTabClose && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose(tab.id);
                      }}
                      className="ml-2 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {showPaneControls && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMode("list-work-context")}
                className={`h-7 px-2 rounded border text-[10px] ${
                  viewMode === "list-work-context"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
                title="Show list, workspace and context panes"
              >
                3 panes
              </button>
              <button
                type="button"
                onClick={() => setMode("list-work")}
                className={`h-7 px-2 rounded border text-[10px] ${
                  viewMode === "list-work"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
                title="Show list and workspace panes"
              >
                List + Workspace
              </button>
              <button
                type="button"
                onClick={() => setMode("list-context")}
                className={`h-7 px-2 rounded border text-[10px] ${
                  viewMode === "list-context"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
                title="Show list and context panes"
              >
                List + Context
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="flex-1 grid min-h-0" style={{ gridTemplateColumns }}>
        {/* Menu Pane — hidden when not provided */}
        {menuPane && (
          <section className="border-r border-border bg-muted/30 overflow-y-auto">
            {menuPane}
          </section>
        )}

        {/* List Pane */}
        <section className="border-r border-border bg-card overflow-y-auto">
          {listPane ?? (
            <div className="p-4 text-xs text-muted-foreground">
              List Pane — show record queues and filters here.
            </div>
          )}
        </section>

        {/* Work Window */}
        {showWorkPane && (
          <section className={`bg-card overflow-y-auto ${showPopPane ? "border-r border-border" : ""}`}>
            {workPane ?? (
              <div className="h-full flex items-center justify-center px-6 py-8">
                <div className="text-center max-w-sm">
                  <div className="mb-3 text-3xl">🧩</div>
                  <h2 className="text-sm font-semibold text-foreground mb-1">
                    LVE Workspace Shell
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Connect this workspace to a core data entity (e.g. Account,
                    Lead, Case) and drive it via configuration—no module-specific
                    logic should live in this layout.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Pop Pane */}
        {showPopPane && (
          <section className="bg-muted/30 overflow-y-auto">
            {popPane ?? (
              <div className="p-4 text-xs text-muted-foreground">
                Pop Pane — use this for related context, timelines, or actions.
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>System status: Connected</span>
        <span>{footer}</span>
      </footer>
    </div>
  );
};
