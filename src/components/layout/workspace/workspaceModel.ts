import { LVEListPaneConfig, LVETab } from "./types";

export const RECORD_TAB_PREFIX = "record:";
export const MODULE_ROOT_TAB_ID = "module-root";
export const RECORDS_STORAGE_KEY = "atx:lve-workspace-records";
export const RECORDS_VERSION_KEY = "v2"; // Increment this to force refresh of cached records

export const toRecordTabId = (recordId: string) => `${RECORD_TAB_PREFIX}${recordId}`;

export const toRecordIdFromTabId = (tabId: string) =>
  tabId.startsWith(RECORD_TAB_PREFIX)
    ? tabId.slice(RECORD_TAB_PREFIX.length)
    : undefined;

export const isModuleRootTabId = (tabId: string) => tabId === MODULE_ROOT_TAB_ID;

export const resolveShouldPersistLocalRecords = (
  hasControlledRecords: boolean,
  persistLocalRecords?: boolean,
) => persistLocalRecords ?? !hasControlledRecords;

export const loadStoredModuleRecords = <TRecord,>(
  storageKey: string,
  defaultRecords: TRecord[],
) => {
  if (typeof window === "undefined") {
    return defaultRecords;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return defaultRecords;
    }

    const parsed = JSON.parse(stored) as { version?: string; records: TRecord[] };
    
    // Check if stored data has version and if it matches current version
    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && 'records' in parsed) {
      if (parsed.version === RECORDS_VERSION_KEY && Array.isArray(parsed.records)) {
        return parsed.records;
      }
    }
    
    // Legacy format or version mismatch - return default records
    return defaultRecords;
  } catch (error) {
    console.error("Failed to load stored LVE module records", error);
    return defaultRecords;
  }
};

export const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "The action could not be completed.";

export const resolveStoredActiveRecordId = <TRecord>(
  activeTabId: string,
  recordById: Record<string, TRecord>,
) => {
  const storedActiveRecordId = toRecordIdFromTabId(activeTabId);
  return storedActiveRecordId && recordById[storedActiveRecordId]
    ? storedActiveRecordId
    : undefined;
};

export const resolveNextOpenRecordIds = <TRecord>({
  routeRecordId,
  recordById,
  openRecordIds,
}: {
  routeRecordId?: string;
  recordById: Record<string, TRecord>;
  openRecordIds: string[];
}) => {
  if (
    routeRecordId &&
    recordById[routeRecordId] &&
    !openRecordIds.includes(routeRecordId)
  ) {
    return [...openRecordIds, routeRecordId];
  }

  return openRecordIds;
};

export const resolveRouteBackedActiveTabId = <TRecord>({
  routeRecordId,
  recordById,
  storedActiveRecordId,
}: {
  routeRecordId?: string;
  recordById: Record<string, TRecord>;
  storedActiveRecordId?: string;
}) =>
  routeRecordId && recordById[routeRecordId]
    ? toRecordTabId(routeRecordId)
    : storedActiveRecordId
      ? toRecordTabId(storedActiveRecordId)
      : MODULE_ROOT_TAB_ID;

export const resolveRecordTabClose = ({
  activeTabId,
  closingRecordId,
  openRecordIds,
  selectedRecordId,
}: {
  activeTabId: string;
  closingRecordId: string;
  openRecordIds: string[];
  selectedRecordId?: string;
}) => {
  const remainingRecordIds = openRecordIds.filter(
    (recordId) => recordId !== closingRecordId,
  );
  const isClosingActiveTab = selectedRecordId === closingRecordId;
  const fallbackRecordId = remainingRecordIds[remainingRecordIds.length - 1];

  return {
    remainingRecordIds,
    fallbackRecordId,
    nextActiveTabId: isClosingActiveTab
      ? fallbackRecordId
        ? toRecordTabId(fallbackRecordId)
        : MODULE_ROOT_TAB_ID
      : activeTabId,
  };
};

export const filterRecords = <TRecord>(
  records: TRecord[],
  searchQuery: string,
  config: Pick<LVEListPaneConfig<TRecord>, "columns" | "getSearchText">,
) => {
  if (!searchQuery.trim()) {
    return records;
  }

  const normalizedSearch = searchQuery.toLowerCase();
  return records.filter((record) => {
    const customSearchText = config.getSearchText?.(record);
    if (customSearchText) {
      return customSearchText.toLowerCase().includes(normalizedSearch);
    }

    return config.columns.some((column) => {
      if (column.searchable === false) {
        return false;
      }

      const renderedValue = column.render(record);
      if (typeof renderedValue === "string" || typeof renderedValue === "number") {
        return String(renderedValue).toLowerCase().includes(normalizedSearch);
      }

      return false;
    });
  });
};

export const buildRecordTabs = <TRecord>({
  getRecordId,
  getRecordLabel,
  modulePluralLabel,
  openRecordIds,
  recordById,
  selectedRecordId,
}: {
  getRecordId: (record: TRecord) => string;
  getRecordLabel: (record: TRecord) => string;
  modulePluralLabel: string;
  openRecordIds: string[];
  recordById: Record<string, TRecord>;
  selectedRecordId?: string;
}): LVETab[] => [
  {
    id: MODULE_ROOT_TAB_ID,
    label: modulePluralLabel,
    isActive: !selectedRecordId,
    canClose: false,
  },
  ...openRecordIds
    .map((openRecordId) => recordById[openRecordId])
    .filter(Boolean)
    .map((record) => {
      const recordId = getRecordId(record);
      return {
        id: toRecordTabId(recordId),
        label: getRecordLabel(record),
        isActive: selectedRecordId === recordId,
        canClose: true,
      };
    }),
];
