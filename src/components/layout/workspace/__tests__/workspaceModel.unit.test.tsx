/**
 * Unit Tests for workspaceModel.ts Helper Functions
 *
 * Feature: lve-workspace-shell-refinement
 * Task: 15.1 - Write unit tests for workspaceModel.ts helpers
 *
 * These tests validate the helper functions that support workspace functionality.
 * Tests cover:
 * - Tab ID conversion functions
 * - Persistence logic resolution
 * - Tab state management
 * - Record filtering and searching
 * - Tab building logic
 * - Error message conversion
 *
 * Requirements: 9.2, 9.3, 12.1, 12.2, 12.3
 */

import {
  toRecordTabId,
  toRecordIdFromTabId,
  isModuleRootTabId,
  resolveShouldPersistLocalRecords,
  resolveStoredActiveRecordId,
  resolveNextOpenRecordIds,
  resolveRouteBackedActiveTabId,
  resolveRecordTabClose,
  filterRecords,
  buildRecordTabs,
  loadStoredModuleRecords,
  toErrorMessage,
  MODULE_ROOT_TAB_ID,
  RECORD_TAB_PREFIX,
} from "../workspaceModel";
import { LVEListPaneConfig } from "../types";

// ============================================================================
// Test Setup
// ============================================================================

interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

const createTestRecords = (count: number): TestRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 1}`,
    name: `Test Record ${i + 1}`,
    email: `test${i + 1}@example.com`,
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

const createListConfig = (): Pick<
  LVEListPaneConfig<TestRecord>,
  "columns" | "getSearchText"
> => ({
  columns: [
    {
      id: "name",
      label: "Name",
      slot: "primary",
      searchable: true,
      render: (record) => record.name,
    },
    {
      id: "email",
      label: "Email",
      slot: "secondary",
      searchable: true,
      render: (record) => record.email,
    },
    {
      id: "status",
      label: "Status",
      slot: "badge",
      searchable: false,
      render: (record) => record.status,
    },
  ],
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// ============================================================================
// Tab ID Conversion Tests
// ============================================================================

describe("Tab ID Conversion Functions", () => {
  describe("toRecordTabId", () => {
    it("should convert record ID to tab ID with prefix", () => {
      expect(toRecordTabId("record-1")).toBe(`${RECORD_TAB_PREFIX}record-1`);
      expect(toRecordTabId("abc-123")).toBe(`${RECORD_TAB_PREFIX}abc-123`);
    });

    it("should handle empty string", () => {
      expect(toRecordTabId("")).toBe(RECORD_TAB_PREFIX);
    });
  });

  describe("toRecordIdFromTabId", () => {
    it("should extract record ID from tab ID", () => {
      expect(toRecordIdFromTabId(`${RECORD_TAB_PREFIX}record-1`)).toBe(
        "record-1",
      );
      expect(toRecordIdFromTabId(`${RECORD_TAB_PREFIX}abc-123`)).toBe(
        "abc-123",
      );
    });

    it("should return undefined for non-record tab IDs", () => {
      expect(toRecordIdFromTabId(MODULE_ROOT_TAB_ID)).toBeUndefined();
      expect(toRecordIdFromTabId("invalid-tab-id")).toBeUndefined();
    });

    it("should handle empty string after prefix", () => {
      expect(toRecordIdFromTabId(RECORD_TAB_PREFIX)).toBe("");
    });
  });

  describe("isModuleRootTabId", () => {
    it("should return true for module root tab ID", () => {
      expect(isModuleRootTabId(MODULE_ROOT_TAB_ID)).toBe(true);
    });

    it("should return false for record tab IDs", () => {
      expect(isModuleRootTabId(`${RECORD_TAB_PREFIX}record-1`)).toBe(false);
    });

    it("should return false for other strings", () => {
      expect(isModuleRootTabId("some-other-id")).toBe(false);
      expect(isModuleRootTabId("")).toBe(false);
    });
  });
});

// ============================================================================
// Persistence Logic Tests
// ============================================================================

describe("Persistence Logic Resolution", () => {
  describe("resolveShouldPersistLocalRecords", () => {
    it("should return false when controlled records exist and persistLocalRecords is undefined", () => {
      expect(resolveShouldPersistLocalRecords(true, undefined)).toBe(false);
    });

    it("should return true when no controlled records and persistLocalRecords is undefined", () => {
      expect(resolveShouldPersistLocalRecords(false, undefined)).toBe(true);
    });

    it("should respect explicit persistLocalRecords=true", () => {
      expect(resolveShouldPersistLocalRecords(true, true)).toBe(true);
      expect(resolveShouldPersistLocalRecords(false, true)).toBe(true);
    });

    it("should respect explicit persistLocalRecords=false", () => {
      expect(resolveShouldPersistLocalRecords(true, false)).toBe(false);
      expect(resolveShouldPersistLocalRecords(false, false)).toBe(false);
    });
  });

  describe("loadStoredModuleRecords", () => {
    beforeEach(() => {
      mockLocalStorage.clear();
    });

    it("should return default records when no stored data", () => {
      const defaultRecords = createTestRecords(3);
      const result = loadStoredModuleRecords("test-key", defaultRecords);
      expect(result).toEqual(defaultRecords);
    });

    it("should load stored records from localStorage", () => {
      const storedRecords = createTestRecords(2);
      mockLocalStorage.setItem("test-key", JSON.stringify(storedRecords));

      const result = loadStoredModuleRecords("test-key", []);
      expect(result).toEqual(storedRecords);
    });

    it("should return default records on parse error", () => {
      mockLocalStorage.setItem("test-key", "invalid-json");
      const defaultRecords = createTestRecords(3);

      const result = loadStoredModuleRecords("test-key", defaultRecords);
      expect(result).toEqual(defaultRecords);
    });

    it("should return default records when stored value is not an array", () => {
      mockLocalStorage.setItem("test-key", JSON.stringify({ not: "array" }));
      const defaultRecords = createTestRecords(3);

      const result = loadStoredModuleRecords("test-key", defaultRecords);
      expect(result).toEqual(defaultRecords);
    });
  });
});

// ============================================================================
// Tab State Management Tests
// ============================================================================

describe("Tab State Management", () => {
  describe("resolveStoredActiveRecordId", () => {
    it("should extract record ID from active tab ID when record exists", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveStoredActiveRecordId(
        toRecordTabId("record-1"),
        recordById,
      );
      expect(result).toBe("record-1");
    });

    it("should return undefined when record does not exist", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveStoredActiveRecordId(
        toRecordTabId("nonexistent"),
        recordById,
      );
      expect(result).toBeUndefined();
    });

    it("should return undefined for module root tab ID", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveStoredActiveRecordId(
        MODULE_ROOT_TAB_ID,
        recordById,
      );
      expect(result).toBeUndefined();
    });
  });

  describe("resolveNextOpenRecordIds", () => {
    it("should add route record ID when not already open", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveNextOpenRecordIds({
        routeRecordId: "record-2",
        recordById,
        openRecordIds: ["record-1"],
      });

      expect(result).toEqual(["record-1", "record-2"]);
    });

    it("should not add duplicate when route record ID already open", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveNextOpenRecordIds({
        routeRecordId: "record-1",
        recordById,
        openRecordIds: ["record-1", "record-2"],
      });

      expect(result).toEqual(["record-1", "record-2"]);
    });

    it("should return unchanged when no route record ID", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveNextOpenRecordIds({
        routeRecordId: undefined,
        recordById,
        openRecordIds: ["record-1"],
      });

      expect(result).toEqual(["record-1"]);
    });

    it("should return unchanged when route record does not exist", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveNextOpenRecordIds({
        routeRecordId: "nonexistent",
        recordById,
        openRecordIds: ["record-1"],
      });

      expect(result).toEqual(["record-1"]);
    });
  });

  describe("resolveRouteBackedActiveTabId", () => {
    it("should return route record tab ID when record exists", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveRouteBackedActiveTabId({
        routeRecordId: "record-2",
        recordById,
        storedActiveRecordId: "record-1",
      });

      expect(result).toBe(toRecordTabId("record-2"));
    });

    it("should fallback to stored active record ID when no route record", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveRouteBackedActiveTabId({
        routeRecordId: undefined,
        recordById,
        storedActiveRecordId: "record-1",
      });

      expect(result).toBe(toRecordTabId("record-1"));
    });

    it("should fallback to module root when no route or stored record", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveRouteBackedActiveTabId({
        routeRecordId: undefined,
        recordById,
        storedActiveRecordId: undefined,
      });

      expect(result).toBe(MODULE_ROOT_TAB_ID);
    });

    it("should fallback when route record does not exist", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = resolveRouteBackedActiveTabId({
        routeRecordId: "nonexistent",
        recordById,
        storedActiveRecordId: "record-1",
      });

      expect(result).toBe(toRecordTabId("record-1"));
    });
  });

  describe("resolveRecordTabClose", () => {
    it("should remove closing record from open records", () => {
      const result = resolveRecordTabClose({
        activeTabId: toRecordTabId("record-1"),
        closingRecordId: "record-2",
        openRecordIds: ["record-1", "record-2", "record-3"],
        selectedRecordId: "record-1",
      });

      expect(result.remainingRecordIds).toEqual(["record-1", "record-3"]);
    });

    it("should select rightmost remaining tab when closing active tab", () => {
      const result = resolveRecordTabClose({
        activeTabId: toRecordTabId("record-2"),
        closingRecordId: "record-2",
        openRecordIds: ["record-1", "record-2", "record-3"],
        selectedRecordId: "record-2",
      });

      expect(result.fallbackRecordId).toBe("record-3");
      expect(result.nextActiveTabId).toBe(toRecordTabId("record-3"));
    });

    it("should navigate to module root when closing last tab", () => {
      const result = resolveRecordTabClose({
        activeTabId: toRecordTabId("record-1"),
        closingRecordId: "record-1",
        openRecordIds: ["record-1"],
        selectedRecordId: "record-1",
      });

      expect(result.remainingRecordIds).toEqual([]);
      expect(result.fallbackRecordId).toBeUndefined();
      expect(result.nextActiveTabId).toBe(MODULE_ROOT_TAB_ID);
    });

    it("should preserve active tab when closing non-active tab", () => {
      const result = resolveRecordTabClose({
        activeTabId: toRecordTabId("record-1"),
        closingRecordId: "record-2",
        openRecordIds: ["record-1", "record-2"],
        selectedRecordId: "record-1",
      });

      expect(result.nextActiveTabId).toBe(toRecordTabId("record-1"));
    });
  });
});

// ============================================================================
// Record Filtering Tests
// ============================================================================

describe("Record Filtering", () => {
  describe("filterRecords", () => {
    it("should return all records when search query is empty", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "", config);
      expect(result).toEqual(records);
    });

    it("should return all records when search query is whitespace", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "   ", config);
      expect(result).toEqual(records);
    });

    it("should filter by searchable column (name)", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "Record 1", config);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Record 1");
    });

    it("should filter by searchable column (email)", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "test2@", config);
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("test2@example.com");
    });

    it("should be case insensitive", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "RECORD 1", config);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Record 1");
    });

    it("should not search non-searchable columns", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      // Status is not searchable
      const result = filterRecords(records, "Active", config);
      expect(result).toHaveLength(0);
    });

    it("should use custom getSearchText when provided", () => {
      const records = createTestRecords(5);
      const config: Pick<
        LVEListPaneConfig<TestRecord>,
        "columns" | "getSearchText"
      > = {
        ...createListConfig(),
        getSearchText: (record) => `${record.name} ${record.status}`,
      };

      const result = filterRecords(records, "Active", config);
      expect(result.length).toBeGreaterThan(0);
      // Verify that custom getSearchText is being used (status is searchable now)
      // Records with "Active" status should be found
      const activeRecords = result.filter((r) => r.status === "Active");
      expect(activeRecords.length).toBeGreaterThan(0);
    });

    it("should handle partial matches", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "Record", config);
      expect(result).toHaveLength(5);
    });

    it("should return empty array when no matches", () => {
      const records = createTestRecords(5);
      const config = createListConfig();

      const result = filterRecords(records, "nonexistent", config);
      expect(result).toHaveLength(0);
    });

    it("should handle numeric render values", () => {
      interface NumericRecord {
        id: string;
        count: number;
      }

      const numericRecords: NumericRecord[] = [
        { id: "1", count: 100 },
        { id: "2", count: 200 },
      ];

      const numericConfig: Pick<
        LVEListPaneConfig<NumericRecord>,
        "columns" | "getSearchText"
      > = {
        columns: [
          {
            id: "count",
            label: "Count",
            searchable: true,
            render: (record) => record.count,
          },
        ],
      };

      const result = filterRecords(numericRecords, "100", numericConfig);
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(100);
    });
  });
});

// ============================================================================
// Tab Building Tests
// ============================================================================

describe("Tab Building", () => {
  describe("buildRecordTabs", () => {
    it("should build module root tab and record tabs", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = buildRecordTabs({
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        modulePluralLabel: "Test Records",
        openRecordIds: ["record-1", "record-2"],
        recordById,
        selectedRecordId: "record-1",
      });

      expect(result).toHaveLength(3); // 1 root + 2 records
      expect(result[0].id).toBe(MODULE_ROOT_TAB_ID);
      expect(result[0].label).toBe("Test Records");
      expect(result[0].isActive).toBe(false);
      expect(result[0].canClose).toBe(false);
    });

    it("should mark selected record tab as active", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = buildRecordTabs({
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        modulePluralLabel: "Test Records",
        openRecordIds: ["record-1", "record-2"],
        recordById,
        selectedRecordId: "record-2",
      });

      const record2Tab = result.find(
        (tab) => tab.id === toRecordTabId("record-2"),
      );
      expect(record2Tab?.isActive).toBe(true);
    });

    it("should mark module root as active when no selected record", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = buildRecordTabs({
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        modulePluralLabel: "Test Records",
        openRecordIds: ["record-1"],
        recordById,
        selectedRecordId: undefined,
      });

      expect(result[0].isActive).toBe(true);
    });

    it("should filter out records that no longer exist", () => {
      const records = createTestRecords(2);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = buildRecordTabs({
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        modulePluralLabel: "Test Records",
        openRecordIds: ["record-1", "nonexistent", "record-2"],
        recordById,
        selectedRecordId: undefined,
      });

      expect(result).toHaveLength(3); // 1 root + 2 existing records
    });

    it("should mark all record tabs as closable", () => {
      const records = createTestRecords(3);
      const recordById = Object.fromEntries(
        records.map((r) => [r.id, r]),
      ) as Record<string, TestRecord>;

      const result = buildRecordTabs({
        getRecordId: (record) => record.id,
        getRecordLabel: (record) => record.name,
        modulePluralLabel: "Test Records",
        openRecordIds: ["record-1", "record-2"],
        recordById,
        selectedRecordId: undefined,
      });

      const recordTabs = result.slice(1); // Skip module root
      expect(recordTabs.every((tab) => tab.canClose)).toBe(true);
    });
  });
});

// ============================================================================
// Error Message Conversion Tests
// ============================================================================

describe("Error Message Conversion", () => {
  describe("toErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Something went wrong");
      expect(toErrorMessage(error)).toBe("Something went wrong");
    });

    it("should return default message for non-Error values", () => {
      expect(toErrorMessage("string error")).toBe(
        "The action could not be completed.",
      );
      expect(toErrorMessage(123)).toBe("The action could not be completed.");
      expect(toErrorMessage(null)).toBe("The action could not be completed.");
      expect(toErrorMessage(undefined)).toBe(
        "The action could not be completed.",
      );
    });

    it("should handle Error with empty message", () => {
      const error = new Error("");
      expect(toErrorMessage(error)).toBe("");
    });
  });
});
