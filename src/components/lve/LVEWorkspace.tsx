import React, { useState, useCallback } from "react";
import { LVERecord, LVEWorkspaceProps, LVEWorkspaceState } from "./types";
import { LVEWorkspaceLayout } from "./LVEWorkspaceLayout";
import { LVETabsBar } from "./components/LVETabsBar";
import { LVEListPane } from "./components/LVEListPane";
import { LVEWorkPane } from "./components/LVEWorkPane";
import { LVEPopPane } from "./components/LVEPopPane";

/**
 * LVEWorkspace - Smart config-driven orchestrator
 *
 * Handles all business logic, state management, and data flow.
 * Renders the dumb shell with configured components.
 */
export const LVEWorkspace = <T extends LVERecord>({
  config,
  records,
  selectedRecord,
  loading = false,
  error,
  onRecordSelect,
  onRecordUpdate,
  onTabSelect,
  onTabClose,
  onFilterChange,
  onSort,
  overrides,
}: LVEWorkspaceProps<T>) => {
  const [state, setState] = useState<LVEWorkspaceState>({
    selectedRecordId: selectedRecord?.id,
    activeTabId: config.tabs?.find((t) => t.isActive)?.id,
    filters: {},
    collapsedPanes: [],
    collapsedSections: [],
  });

  const handleRecordSelect = useCallback(
    (record: T) => {
      setState((prev) => ({ ...prev, selectedRecordId: record.id }));
      onRecordSelect?.(record);
    },
    [onRecordSelect],
  );

  const handleTabSelect = useCallback(
    (tabId: string) => {
      setState((prev) => ({ ...prev, activeTabId: tabId }));
      onTabSelect?.(tabId);
    },
    [onTabSelect],
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      onTabClose?.(tabId);
    },
    [onTabClose],
  );

  const handleFilterChange = useCallback(
    (filters: Record<string, any>) => {
      setState((prev) => ({ ...prev, filters }));
      onFilterChange?.(filters);
    },
    [onFilterChange],
  );

  const handleSort = useCallback(
    (field: string, direction: "asc" | "desc") => {
      setState((prev) => ({
        ...prev,
        sortField: field,
        sortDirection: direction,
      }));
      onSort?.(field, direction);
    },
    [onSort],
  );

  // Render components
  const renderTabs = () => {
    if (overrides?.tabsBar) return overrides.tabsBar;
    if (!config.tabs || config.tabs.length === 0) return null;

    return (
      <LVETabsBar
        tabs={config.tabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
      />
    );
  };

  const renderListPane = () => {
    if (overrides?.listPane) return overrides.listPane;

    return (
      <LVEListPane
        records={records}
        columns={config.listPane.columns}
        selectedRecord={selectedRecord}
        filters={config.listPane.filters}
        config={config.listPane.config}
        loading={loading}
        error={error}
        searchable={config.listPane.searchable}
        onRecordSelect={handleRecordSelect}
        onFilterChange={handleFilterChange}
        onSort={handleSort}
      />
    );
  };

  const renderWorkPane = () => {
    if (overrides?.workPane) return overrides.workPane;

    return (
      <LVEWorkPane
        selectedRecord={selectedRecord}
        sections={config.workPane.sections}
        actions={config.workPane.actions}
        config={config.workPane.config}
        onRecordUpdate={onRecordUpdate}
      />
    );
  };

  const renderPopPane = () => {
    if (overrides?.popPane) return overrides.popPane;
    if (!config.popPane) return null;

    return (
      <LVEPopPane
        selectedRecord={selectedRecord}
        sections={config.popPane.sections}
        config={config.popPane.config}
      />
    );
  };

  return (
    <LVEWorkspaceLayout
      headerTitle={config.title}
      tabs={renderTabs()}
      listPane={renderListPane()}
      workPane={renderWorkPane()}
      popPane={renderPopPane()}
      footer={`${config.moduleId} workspace`}
    />
  );
};
