import React, { ReactNode } from "react";

export interface LVETabLegacy {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
}

export interface LVEWorkspaceLayoutLegacyProps {
  headerTitle?: string;
  tenantLabel?: string;
  streamLabel?: string;
  tabs?: LVETabLegacy[];
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
}

/**
 * LVEWorkspaceLayoutLegacy
 *
 * Reusable layout shell implementing the List | View | Edit (LVE) workspace structure.
 * This component is deliberately UI-only: it contains no module-specific logic and is
 * driven entirely by props so it can be reused across modules.
 */
export const LVEWorkspaceLayoutLegacy: React.FC<LVEWorkspaceLayoutLegacyProps> = ({
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
}) => {
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      {/* Global Header */}
      <header className="border-b border-slate-200 bg-white px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTenantClick}
            className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1" />
            {tenantLabel}
          </button>
          <button
            type="button"
            onClick={onStreamClick}
            className="inline-flex items-center px-2 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            {streamLabel}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-sm font-semibold text-slate-800 truncate">
            {headerTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs"
              aria-label="Workspace settings"
            >
              ⚙
            </button>
          )}
        </div>
      </header>

      {/* Tabs Row */}
      {hasTabs && (
        <div className="border-b border-slate-200 bg-slate-50/80 px-2 py-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.isActive;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabSelect?.(tab.id)}
                className={`group inline-flex items-center max-w-xs px-3 py-1.5 rounded-md text-xs border transition-colors ${
                  active
                    ? "bg-white border-indigo-500 text-indigo-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
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
                    className="ml-2 text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-[minmax(200px,240px)_minmax(260px,320px)_minmax(420px,1fr)_minmax(260px,320px)] min-h-0">
        {/* Menu Pane */}
        <section className="border-r border-slate-200 bg-slate-50/70 overflow-y-auto">
          {menuPane ?? (
            <div className="p-4 text-xs text-slate-500">
              Menu Pane — provide module navigation here.
            </div>
          )}
        </section>

        {/* List Pane */}
        <section className="border-r border-slate-200 bg-white overflow-y-auto">
          {listPane ?? (
            <div className="p-4 text-xs text-slate-500">
              List Pane — show record queues and filters here.
            </div>
          )}
        </section>

        {/* Work Window */}
        <section className="border-r border-slate-200 bg-white overflow-y-auto">
          {workPane ?? (
            <div className="h-full flex items-center justify-center px-6 py-8">
              <div className="text-center max-w-sm">
                <div className="mb-3 text-3xl">🧩</div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  LVE Workspace Shell
                </h2>
                <p className="text-xs text-slate-500">
                  Connect this workspace to a core data entity (e.g. Account,
                  Lead, Case) and drive it via configuration—no module-specific
                  logic should live in this layout.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Pop Pane */}
        <section className="bg-slate-50/80 overflow-y-auto">
          {popPane ?? (
            <div className="p-4 text-xs text-slate-500">
              Pop Pane — use this for related context, timelines, or actions.
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500 flex items-center justify-between">
        <span>System status: Connected</span>
        <span>{footer}</span>
      </footer>
    </div>
  );
};
