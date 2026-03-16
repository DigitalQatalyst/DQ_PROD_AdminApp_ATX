import React, { ReactNode } from "react";

export interface LVETab {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
}

export interface LVEWorkspaceLayoutProps {
  headerTitle?: string;
  tabs?: LVETab[];
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  listPane?: ReactNode;
  workPane?: ReactNode;
  popPane?: ReactNode;
  footer?: ReactNode;
}

/**
 * LVEWorkspaceLayout
 *
 * Streamlined layout shell implementing the List | View | Edit (LVE) workspace structure.
 * This component integrates seamlessly with the global AppShell layout. Module-specific
 * actions are now handled directly in the global sidebar MenuPane, eliminating the need
 * for a separate context menu pane and creating a cleaner, more unified navigation experience.
 */
export const LVEWorkspaceLayout: React.FC<LVEWorkspaceLayoutProps> = ({
  headerTitle = "Workspace",
  tabs = [],
  onTabSelect,
  onTabClose,
  listPane,
  workPane,
  popPane,
  footer,
}) => {
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Workspace Header - Simplified */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-center shrink-0">
        <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
      </header>

      {/* Tabs Row */}
      {hasTabs && (
        <div className="border-b border-border bg-muted/50 px-2 py-1 flex items-center gap-1 overflow-x-auto">
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
      )}

      {/* Main Workspace Grid - 3-pane layout without context menu */}
      <div className="flex-1 grid grid-cols-[minmax(300px,400px)_minmax(400px,1fr)_minmax(280px,320px)] min-h-0">
        {/* List Pane */}
        <section className="border-r border-border bg-card overflow-y-auto">
          {listPane ?? (
            <div className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
                Record List
              </div>
              <p className="text-muted-foreground">
                Record queues, filters, and search will appear here.
              </p>
            </div>
          )}
        </section>

        {/* Work Window */}
        <section className="border-r border-border bg-card overflow-y-auto">
          {workPane ?? (
            <div className="h-full flex items-center justify-center px-6 py-8">
              <div className="text-center max-w-sm">
                <div className="mb-3 text-3xl">🧩</div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  LVE Workspace
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select an item from the list to view and edit details here.
                  Module actions are available in the sidebar navigation.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Pop Pane */}
        <section className="bg-muted/30 overflow-y-auto">
          {popPane ?? (
            <div className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase mb-2">
                Context Panel
              </div>
              <p className="text-muted-foreground">
                Related context, timelines, and quick actions will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer - Simplified */}
      {footer && (
        <footer className="border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground flex items-center justify-between shrink-0">
          <span>Workspace Status</span>
          <span>{footer}</span>
        </footer>
      )}
    </div>
  );
};
