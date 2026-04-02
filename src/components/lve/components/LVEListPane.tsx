import React, { useMemo, useState } from "react";
import { LVERecord, LVEColumn, LVEFilter, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { Search, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVEListPane from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

interface LVEListPaneProps<T extends LVERecord> {
  records: T[];
  columns: LVEColumn[];
  selectedRecord?: T;
  filters?: LVEFilter[];
  config?: LVEPaneConfig;
  loading?: boolean;
  error?: string;
  searchable?: boolean;
  onRecordSelect?: (record: T) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSort?: (field: string, direction: "asc" | "desc") => void;
}

const toSearchableText = (value: unknown): string => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSearchableText(item)).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => toSearchableText(item))
      .join(" ");
  }

  return "";
};

/**
 * @deprecated This component is deprecated. Use DefaultListPane from @/components/layout/workspace instead.
 */
export const LVEListPane = <T extends LVERecord>({
  records,
  columns,
  selectedRecord,
  filters = [],
  loading = false,
  error,
  searchable = true,
  onRecordSelect,
}: LVEListPaneProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const primaryColumn =
    columns.find((column) =>
      ["name", "firstName", "title", "label"].includes(column.field),
    ) ?? columns[0];
  const statusColumn = columns.find((column) => column.field === "status");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const visibleRecords = useMemo(() => {
    if (!normalizedSearchTerm) {
      return records;
    }

    return records.filter((record) => {
      const columnValues = columns.map((column) =>
        toSearchableText(record[column.field]),
      );
      const recordValues = Object.values(record).map((value) =>
        toSearchableText(value),
      );
      const haystack = [...columnValues, ...recordValues]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearchTerm);
    });
  }, [columns, normalizedSearchTerm, records]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-border p-3">
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {filters.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Filter className="h-3 w-3" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {visibleRecords.length} result
              {visibleRecords.length === 1 ? "" : "s"}
            </span>
          )}

          {filters.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {visibleRecords.length} result
              {visibleRecords.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {showFilters && filters.length > 0 && (
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Filter controls are not configured yet for the default list pane.
          </div>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {visibleRecords.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {normalizedSearchTerm
                ? `No records match "${searchTerm}".`
                : "No records found"}
            </div>
          ) : (
            visibleRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => onRecordSelect?.(record)}
                className={cn(
                  "cursor-pointer rounded-md border p-3 transition-colors",
                  selectedRecord?.id === record.id
                    ? "border-primary/25 bg-muted/60 shadow-sm ring-1 ring-inset ring-primary/15"
                    : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-sm font-medium">
                    {primaryColumn?.render
                      ? primaryColumn.render(
                          record[primaryColumn.field],
                          record,
                        )
                      : record[primaryColumn?.field]}
                  </div>
                  {statusColumn && (
                    <div className="shrink-0 text-sm">
                      {statusColumn.render
                        ? statusColumn.render(
                            record[statusColumn.field],
                            record,
                          )
                        : record[statusColumn.field]}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
