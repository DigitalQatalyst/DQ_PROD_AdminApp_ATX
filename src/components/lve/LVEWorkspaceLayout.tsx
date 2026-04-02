import React, { ReactNode } from "react";
import { ChevronLeft, ChevronRight, PanelRight } from "lucide-react";
import { cn } from "../../utils/cn";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVEWorkspaceLayout from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

export interface LVEWorkspaceLayoutProps {
  headerTitle?: string;
  tabs?: ReactNode;
  listPane?: ReactNode;
  workPane?: ReactNode;
  popPane?: ReactNode;
  popPaneCollapsed?: boolean;
  onPopPaneToggle?: () => void;
  footer?: ReactNode;
}

/**
 * @deprecated This component is deprecated. Use LVEWorkspaceLayout from @/components/layout/LVEWorkspaceLayout instead.
 * See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for migration guidance.
 *
 * LVEWorkspaceLayout - Dumb shell component
 *
 * Pure layout component that only handles positioning and styling.
 * No business logic, no data handling, no configuration.
 * All content is provided via render props.
 */
export const LVEWorkspaceLayout: React.FC<LVEWorkspaceLayoutProps> = ({
  headerTitle = "Workspace",
  tabs,
  listPane,
  workPane,
  popPane,
  popPaneCollapsed = false,
  onPopPaneToggle,
  footer,
}) => {
  const hasPopPane = Boolean(popPane);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      {/* Workspace Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-center shrink-0">
        <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
      </header>

      {/* Tabs Bar */}
      {tabs && (
        <div className="border-b border-border bg-muted/50 shrink-0">
          {tabs}
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="relative min-h-0 min-w-0 flex-1 overflow-auto">
        {hasPopPane && popPaneCollapsed && onPopPaneToggle && (
          <button
            type="button"
            onClick={onPopPaneToggle}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <PanelRight className="h-3.5 w-3.5" />
            Show Context
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          className={cn(
            "grid h-full min-h-full min-w-[980px]",
            hasPopPane && !popPaneCollapsed
              ? "grid-cols-[minmax(300px,400px)_minmax(400px,1fr)_minmax(280px,320px)]"
              : "grid-cols-[minmax(300px,400px)_minmax(400px,1fr)]",
          )}
        >
          {/* List Pane */}
          <section className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-card">
            {listPane}
          </section>

          {/* Work Pane */}
          <section className="min-h-0 min-w-0 overflow-hidden border-r border-border bg-card">
            {workPane}
          </section>

          {/* Pop Pane */}
          {hasPopPane && !popPaneCollapsed && (
            <section className="min-h-0 min-w-0 overflow-hidden bg-muted/30">
              {popPane}
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
};
