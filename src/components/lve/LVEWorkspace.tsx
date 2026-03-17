import { useCallback, useEffect, useRef, useState } from "react";
import { LVERecord, LVETab, LVEWorkspaceProps, LVEWorkspaceState } from "./types";
import { LVEWorkspaceLayout } from "./LVEWorkspaceLayout";
import { LVETabsBar } from "./components/LVETabsBar";
import { LVEListPane } from "./components/LVEListPane";
import { LVEWorkPane } from "./components/LVEWorkPane";
import { LVEPopPane } from "./components/LVEPopPane";

const RECORD_TAB_PREFIX = "__record__:";
const EMPTY_TABS: LVETab[] = [];

const toRecordTabId = (recordId: string) => `${RECORD_TAB_PREFIX}${recordId}`;

const isRecordTabId = (tabId?: string) =>
  Boolean(tabId?.startsWith(RECORD_TAB_PREFIX));

const getRecordIdFromTabId = (tabId: string) => tabId.slice(RECORD_TAB_PREFIX.length);

const areStringArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const getDefaultRecordLabel = <T extends LVERecord>(
  record: T,
  fallbackField?: string,
) => {
  const labelCandidates = [
    record.name,
    record.title,
    record.label,
    record.fullName,
    record.displayName,
    [record.firstName, record.lastName].filter(Boolean).join(" ").trim(),
    record.email,
    record.company,
    fallbackField ? record[fallbackField] : undefined,
  ];

  const label = labelCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );

  return label ?? `Record ${record.id}`;
};

const appendRecordTab = (
  openRecordTabIds: string[],
  recordId: string,
  maxOpen?: number,
) => {
  const nextOpenRecordTabIds = openRecordTabIds.filter((openId) => openId !== recordId);
  nextOpenRecordTabIds.push(recordId);

  if (!maxOpen || nextOpenRecordTabIds.length <= maxOpen) {
    return nextOpenRecordTabIds;
  }

  return nextOpenRecordTabIds.slice(nextOpenRecordTabIds.length - maxOpen);
};

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
  onRecordClear,
  onRecordUpdate,
  onTabSelect,
  onTabClose,
  onFilterChange,
  onSort,
  overrides,
}: LVEWorkspaceProps<T>) => {
  const baseTabs = config.tabs ?? EMPTY_TABS;
  const selectedRecordId = selectedRecord?.id;
  const defaultBaseTabId = baseTabs.find((tab) => tab.isActive)?.id ?? baseTabs[0]?.id;
  const recordTabsEnabled = config.recordTabs?.enabled ?? true;
  const recordTabMaxOpen = config.recordTabs?.maxOpen;
  const recordTabsClosable = config.recordTabs?.canClose ?? true;
  const popPaneCollapsedByDefault = config.popPane?.config?.collapsed ?? false;
  const previousModuleIdRef = useRef(config.moduleId);

  const [state, setState] = useState<LVEWorkspaceState>({
    selectedRecordId: selectedRecord?.id,
    activeTabId: selectedRecordId && recordTabsEnabled
      ? toRecordTabId(selectedRecordId)
      : defaultBaseTabId,
    activeBaseTabId: defaultBaseTabId,
    openRecordTabIds:
      selectedRecordId && recordTabsEnabled ? [selectedRecordId] : [],
    filters: {},
    collapsedPanes: popPaneCollapsedByDefault ? ["popPane"] : [],
    collapsedSections: [],
  });

  const findRecordById = useCallback(
    (recordId?: string) => {
      if (!recordId) {
        return undefined;
      }

      return (
        records.find((record) => record.id === recordId) ??
        (selectedRecord?.id === recordId ? selectedRecord : undefined)
      );
    },
    [records, selectedRecord],
  );

  useEffect(() => {
    const moduleChanged = previousModuleIdRef.current !== config.moduleId;
    previousModuleIdRef.current = config.moduleId;

    setState((prev) => {
      const availableRecordIds = new Set(records.map((record) => record.id));
      const nextActiveBaseTabId =
        baseTabs.some((tab) => tab.id === prev.activeBaseTabId)
          ? prev.activeBaseTabId
          : defaultBaseTabId;

      let nextSelectedRecordId =
        moduleChanged || !prev.selectedRecordId || !availableRecordIds.has(prev.selectedRecordId)
          ? undefined
          : prev.selectedRecordId;

      let nextOpenRecordTabIds =
        moduleChanged || !recordTabsEnabled
          ? []
          : prev.openRecordTabIds.filter((recordId) => availableRecordIds.has(recordId));

      if (selectedRecordId && availableRecordIds.has(selectedRecordId)) {
        nextSelectedRecordId = selectedRecordId;
        if (recordTabsEnabled) {
          nextOpenRecordTabIds = appendRecordTab(
            nextOpenRecordTabIds,
            selectedRecordId,
            recordTabMaxOpen,
          );
        }
      }

      let nextActiveTabId = moduleChanged ? nextActiveBaseTabId : prev.activeTabId;

      if (selectedRecordId && recordTabsEnabled) {
        nextActiveTabId = toRecordTabId(selectedRecordId);
      } else if (nextActiveTabId && isRecordTabId(nextActiveTabId)) {
        const activeRecordId = getRecordIdFromTabId(nextActiveTabId);
        if (!nextOpenRecordTabIds.includes(activeRecordId)) {
          nextActiveTabId = nextActiveBaseTabId;
        }
      } else if (nextActiveTabId && !baseTabs.some((tab) => tab.id === nextActiveTabId)) {
        nextActiveTabId = nextActiveBaseTabId;
      } else if (!nextActiveTabId && nextSelectedRecordId && recordTabsEnabled) {
        nextActiveTabId = toRecordTabId(nextSelectedRecordId);
      } else if (!nextActiveTabId) {
        nextActiveTabId = nextActiveBaseTabId;
      }

      if (
        prev.selectedRecordId === nextSelectedRecordId &&
        prev.activeTabId === nextActiveTabId &&
        prev.activeBaseTabId === nextActiveBaseTabId &&
        areStringArraysEqual(prev.openRecordTabIds, nextOpenRecordTabIds)
      ) {
        return prev;
      }

      return {
        ...prev,
        selectedRecordId: nextSelectedRecordId,
        activeTabId: nextActiveTabId,
        activeBaseTabId: nextActiveBaseTabId,
        openRecordTabIds: nextOpenRecordTabIds,
      };
    });
  }, [
    baseTabs,
    config.moduleId,
    defaultBaseTabId,
    recordTabMaxOpen,
    recordTabsEnabled,
    records,
    selectedRecordId,
  ]);

  const selectedRecordFromState = findRecordById(state.selectedRecordId);
  const activeRecordId = isRecordTabId(state.activeTabId)
    ? getRecordIdFromTabId(state.activeTabId)
    : state.selectedRecordId;
  const activeRecord = findRecordById(activeRecordId);
  const currentSelectedRecord = activeRecord ?? selectedRecordFromState;

  const workspaceTabs: LVETab[] = [
    ...baseTabs.map((tab) => ({
      ...tab,
      kind: tab.kind ?? "module",
      isActive: state.activeTabId === tab.id,
      canClose: tab.canClose ?? false,
    })),
    ...state.openRecordTabIds
      .map((recordId) => {
        const record = findRecordById(recordId);
        if (!record) {
          return null;
        }

        return {
          id: toRecordTabId(record.id),
          label:
            config.recordTabs?.getLabel?.(record) ??
            getDefaultRecordLabel(record, config.listPane.columns[0]?.field),
          kind: "record" as const,
          recordId: record.id,
          isActive: state.activeTabId === toRecordTabId(record.id),
          isDirty: config.recordTabs?.getIsDirty?.(record) ?? false,
          canClose: recordTabsClosable,
        };
      })
      .filter((tab): tab is LVETab => Boolean(tab)),
  ];

  const handleRecordSelect = useCallback(
    (record: T) => {
      setState((prev) => ({
        ...prev,
        selectedRecordId: record.id,
        activeTabId: recordTabsEnabled ? toRecordTabId(record.id) : prev.activeTabId,
        openRecordTabIds: recordTabsEnabled
          ? appendRecordTab(prev.openRecordTabIds, record.id, recordTabMaxOpen)
          : prev.openRecordTabIds,
      }));
      onRecordSelect?.(record);
    },
    [onRecordSelect, recordTabMaxOpen, recordTabsEnabled],
  );

  const handleTabSelect = useCallback(
    (tabId: string, tab?: LVETab) => {
      if (isRecordTabId(tabId)) {
        const record = findRecordById(getRecordIdFromTabId(tabId));
        if (!record) {
          return;
        }

        setState((prev) => ({
          ...prev,
          selectedRecordId: record.id,
          activeTabId: tabId,
        }));

        onRecordSelect?.(record);
        onTabSelect?.(tabId, tab);
        return;
      }

      setState((prev) => ({
        ...prev,
        activeTabId: tabId,
        activeBaseTabId: tabId,
      }));
      onTabSelect?.(tabId, tab);
    },
    [findRecordById, onRecordSelect, onTabSelect],
  );

  const handleTabClose = useCallback(
    (tabId: string, tab?: LVETab) => {
      if (!isRecordTabId(tabId)) {
        onTabClose?.(tabId, tab);
        return;
      }

      const closedRecordId = getRecordIdFromTabId(tabId);
      let nextSelectedRecord: T | undefined;
      let shouldClearRecord = false;

      setState((prev) => {
        const closedIndex = prev.openRecordTabIds.indexOf(closedRecordId);
        const nextOpenRecordTabIds = prev.openRecordTabIds.filter(
          (recordId) => recordId !== closedRecordId,
        );

        let nextSelectedRecordId = prev.selectedRecordId;
        let nextActiveTabId = prev.activeTabId;

        if (prev.selectedRecordId === closedRecordId || prev.activeTabId === tabId) {
          const fallbackRecordId =
            nextOpenRecordTabIds[closedIndex] ??
            nextOpenRecordTabIds[closedIndex - 1];

          if (fallbackRecordId) {
            nextSelectedRecord = findRecordById(fallbackRecordId);
            nextSelectedRecordId = fallbackRecordId;
            nextActiveTabId = toRecordTabId(fallbackRecordId);
          } else {
            nextSelectedRecordId = undefined;
            nextActiveTabId = prev.activeBaseTabId;
            shouldClearRecord = true;
          }
        }

        return {
          ...prev,
          selectedRecordId: nextSelectedRecordId,
          activeTabId: nextActiveTabId,
          openRecordTabIds: nextOpenRecordTabIds,
        };
      });

      if (nextSelectedRecord) {
        onRecordSelect?.(nextSelectedRecord);
      } else if (shouldClearRecord) {
        onRecordClear?.();
      }

      onTabClose?.(tabId, tab);
    },
    [findRecordById, onRecordClear, onRecordSelect, onTabClose],
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

  const isPopPaneCollapsed = state.collapsedPanes.includes("popPane");

  const handlePopPaneToggle = useCallback(() => {
    setState((prev) => {
      const nextCollapsedPanes = prev.collapsedPanes.includes("popPane")
        ? prev.collapsedPanes.filter((paneId) => paneId !== "popPane")
        : [...prev.collapsedPanes, "popPane"];

      return {
        ...prev,
        collapsedPanes: nextCollapsedPanes,
      };
    });
  }, []);

  const renderTabs = () => {
    if (overrides?.tabsBar) {
      return overrides.tabsBar;
    }

    if (workspaceTabs.length === 0) {
      return null;
    }

    return (
      <LVETabsBar
        tabs={workspaceTabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
      />
    );
  };

  const renderListPane = () => {
    if (overrides?.listPane) {
      return overrides.listPane;
    }

    return (
      <LVEListPane
        records={records}
        columns={config.listPane.columns}
        selectedRecord={currentSelectedRecord}
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
    if (overrides?.workPane) {
      return overrides.workPane;
    }

    return (
      <LVEWorkPane
        selectedRecord={currentSelectedRecord}
        sections={config.workPane.sections}
        actions={config.workPane.actions}
        config={config.workPane.config}
        onRecordUpdate={onRecordUpdate}
      />
    );
  };

  const renderPopPane = () => {
    if (overrides?.popPane) {
      return overrides.popPane;
    }

    if (!config.popPane) {
      return null;
    }

    return (
      <LVEPopPane
        selectedRecord={currentSelectedRecord}
        sections={config.popPane.sections}
        config={config.popPane.config}
        onCollapse={handlePopPaneToggle}
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
      popPaneCollapsed={isPopPaneCollapsed}
      onPopPaneToggle={handlePopPaneToggle}
      footer={`${config.moduleId} workspace`}
    />
  );
};
