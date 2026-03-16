import React, { ReactNode } from "react";

export interface LVEWorkspaceLayoutProps {
  headerTitle?: string;
  tabs?: ReactNode;
  listPane?: ReactNode;
  workPane?: ReactNode;
  popPane?: ReactNode;
  footer?: ReactNode;
}

/**
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
  footer,
}) => {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
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
      <div className="flex-1 grid grid-cols-[minmax(300px,400px)_minmax(400px,1fr)_minmax(280px,320px)] min-h-0">
        {/* List Pane */}
        <section className="border-r border-border bg-card overflow-hidden">
          {listPane}
        </section>

        {/* Work Pane */}
        <section className="border-r border-border bg-card overflow-hidden">
          {workPane}
        </section>

        {/* Pop Pane */}
        <section className="bg-muted/30 overflow-hidden">{popPane}</section>
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
