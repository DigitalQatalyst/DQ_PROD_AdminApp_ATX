import React, { useState } from "react";
import { LVERecord, LVEColumn, LVEFilter, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { Search, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

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

export const LVEListPane = <T extends LVERecord>({
  records,
  columns,
  selectedRecord,
  filters = [],
  config,
  loading = false,
  error,
  searchable = true,
  onRecordSelect,
  onFilterChange,
  onSort,
}: LVEListPaneProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-3 border-b border-border space-y-2">
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background"
            />
          </div>
        )}

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Filter className="w-3 h-3" />
            Filters
            {showFilters ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Records List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No records found
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                onClick={() => onRecordSelect?.(record)}
                className={cn(
                  "p-3 rounded-md border cursor-pointer transition-colors",
                  selectedRecord?.id === record.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:bg-accent",
                )}
              >
                {columns.slice(0, 3).map((column) => (
                  <div key={column.id} className="text-sm">
                    <span className="font-medium">
                      {column.render
                        ? column.render(record[column.field], record)
                        : record[column.field]}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
