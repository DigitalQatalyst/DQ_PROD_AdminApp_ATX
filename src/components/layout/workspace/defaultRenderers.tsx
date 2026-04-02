import { useEffect, useState } from "react";
import { ChevronDown, Filter, Search, SlidersHorizontal } from "lucide-react";
import Input from "../../ui/InputComponent";
import Button from "../../ui/ButtonComponent";
import { cn } from "../../../utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/DropdownMenu";
import {
  LVEActionDefinition,
  LVEContextSection,
  LVEInnerWorkspaceTab,
  LVEListPaneConfig,
  LVEWorkSection,
} from "./types";

interface DefaultActionButtonsProps<TRecord> {
  actions?: LVEActionDefinition<TRecord>[];
  onAction: (action: LVEActionDefinition<TRecord>) => void;
  size?: "sm" | "default";
}

export function DefaultActionButtons<TRecord>({
  actions,
  onAction,
  size = "sm",
}: DefaultActionButtonsProps<TRecord>) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          size={size}
          variant={action.variant ?? "outline"}
          disabled={action.disabled}
          onClick={() => onAction(action)}
          className="border-border bg-background hover:bg-secondary hover:text-foreground"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

interface DefaultListPaneProps<TRecord> {
  config: LVEListPaneConfig<TRecord>;
  filteredRecords: TRecord[];
  selectedRecordId?: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectRecord: (record: TRecord) => void;
  onAction: (action: LVEActionDefinition<TRecord>) => void;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
}

export function DefaultListPane<TRecord>({
  config,
  filteredRecords,
  selectedRecordId,
  searchQuery,
  setSearchQuery,
  onSelectRecord,
  onAction,
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
}: DefaultListPaneProps<TRecord>) {
  const primaryColumn = config.columns.find(
    (column) => column.slot === "primary",
  );
  const secondaryColumn = config.columns.find(
    (column) => column.slot === "secondary",
  );
  const metaColumn = config.columns.find((column) => column.slot === "meta");
  const badgeColumn = config.columns.find((column) => column.slot === "badge");
  const hasFilterMenu =
    Boolean(config.filterTriggerLabel) ||
    Boolean(config.viewPresets?.length) ||
    Boolean(config.queuePresets?.length);
  const hasSortMenu = Boolean(config.sortTriggerLabel);
  const hasViewsMenu = Boolean(config.viewsTriggerLabel);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={config.searchPlaceholder ?? "Search records"}
              className="h-9 border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {(hasFilterMenu ||
            hasSortMenu ||
            hasViewsMenu ||
            config.listActions?.length) && (
            <div className="flex flex-wrap items-center gap-2">
              {hasFilterMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-2 border-border bg-background px-3 text-xs hover:bg-secondary hover:text-foreground"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {config.filterTriggerLabel ?? "Filters"}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>
                      {config.filterTriggerLabel ?? "Filters"}
                    </DropdownMenuLabel>
                    {config.viewPresets?.length ? (
                      <>
                        <DropdownMenuSeparator />
                        {config.viewPresets.map((preset) => (
                          <DropdownMenuItem key={preset.id}>
                            {preset.label}
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : null}
                    {config.queuePresets?.length ? (
                      <>
                        <DropdownMenuSeparator />
                        {config.queuePresets.map((preset) => (
                          <DropdownMenuItem key={preset.id}>
                            {preset.label}
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {hasSortMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-2 border-border bg-background px-3 text-xs hover:bg-secondary hover:text-foreground"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      {config.sortTriggerLabel}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>
                      {config.sortTriggerLabel}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Placeholder</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {hasViewsMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-2 border-border bg-background px-3 text-xs hover:bg-secondary hover:text-foreground"
                    >
                      {config.viewsTriggerLabel}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>
                      {config.viewsTriggerLabel}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Placeholder</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DefaultActionButtons
                actions={config.listActions}
                onAction={onAction}
              />
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {config.isLoading && (
          <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
            Loading records...
          </div>
        )}

        {config.errorMessage && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {config.errorMessage}
          </div>
        )}

        {!config.isLoading &&
          !config.errorMessage &&
          filteredRecords.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {config.emptyTitle ?? "No records"}
              </p>
              <p className="mt-1">
                {config.emptyDescription ??
                  "No records match the current workspace state."}
              </p>
            </div>
          )}

        {filteredRecords.length > 0 && (
          <div className="space-y-2">
            {filteredRecords.map((record) => {
              const recordId = config.getRecordId(record);
              const isSelected = selectedRecordId === recordId;

              return (
                <button
                  key={recordId}
                  type="button"
                  onClick={() => onSelectRecord(record)}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-background hover:bg-secondary/40",
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {primaryColumn?.render(record) ??
                        config.getRecordLabel(record)}
                    </p>
                    {secondaryColumn && (
                      <p className="truncate text-xs text-muted-foreground">
                        {secondaryColumn.render(record)}
                      </p>
                    )}
                    {metaColumn && (
                      <p className="text-[11px] text-muted-foreground">
                        {metaColumn.render(record)}
                      </p>
                    )}
                  </div>
                  {badgeColumn && (
                    <div className="shrink-0">{badgeColumn.render(record)}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing{" "}
              {filteredRecords.length > 0 ? (currentPage - 1) * 20 + 1 : 0}-
              {Math.min(currentPage * 20, totalRecords)} of {totalRecords}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="h-7 px-2 text-xs"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DefaultWorkPaneProps<TRecord> {
  selectedRecord?: TRecord;
  sections: LVEWorkSection<TRecord>[];
  innerTabs?: LVEInnerWorkspaceTab<TRecord>[];
  emptyTitle: string;
  emptyDescription: string;
  isLoading?: boolean;
  errorMessage?: string;
}

export function DefaultWorkPane<TRecord>({
  selectedRecord,
  sections,
  innerTabs,
  emptyTitle,
  emptyDescription,
  isLoading,
  errorMessage,
}: DefaultWorkPaneProps<TRecord>) {
  const [activeInnerTabId, setActiveInnerTabId] = useState<string | undefined>(
    innerTabs?.[0]?.id,
  );

  useEffect(() => {
    setActiveInnerTabId(innerTabs?.[0]?.id);
  }, [innerTabs, selectedRecord]);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  if (errorMessage) {
    return <div className="p-4 text-sm text-destructive">{errorMessage}</div>;
  }

  if (!selectedRecord) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-8">
        <div className="max-w-md text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {emptyTitle}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  const activeInnerTab =
    innerTabs?.find((tab) => tab.id === activeInnerTabId) ?? innerTabs?.[0];
  const renderedSections = activeInnerTab
    ? activeInnerTab.getSections(selectedRecord)
    : sections;

  return (
    <div className="space-y-4 p-4">
      {innerTabs && innerTabs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {innerTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveInnerTabId(tab.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition-colors",
                activeInnerTab?.id === tab.id
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {renderedSections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-border bg-background p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {section.title}
          </h3>
          <div
            className={cn(
              "mt-3 grid gap-3",
              section.columns === 3 && "md:grid-cols-3",
              section.columns === 2 && "md:grid-cols-2",
            )}
          >
            {section.fields.map((field) => (
              <div key={field.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </p>
                <div className="mt-1 text-sm text-foreground">
                  {field.render(selectedRecord)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DefaultPopPaneProps<TRecord> {
  selectedRecord?: TRecord;
  sections: LVEContextSection<TRecord>[];
  emptyTitle: string;
  emptyDescription: string;
  onAction: (action: LVEActionDefinition<TRecord>) => void;
  quickActions?: LVEActionDefinition<TRecord>[];
  isLoading?: boolean;
  errorMessage?: string;
}

export function DefaultPopPane<TRecord>({
  selectedRecord,
  sections,
  emptyTitle,
  emptyDescription,
  onAction,
  quickActions,
  isLoading,
  errorMessage,
}: DefaultPopPaneProps<TRecord>) {
  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading context...
      </div>
    );
  }

  if (errorMessage) {
    return <div className="p-4 text-sm text-destructive">{errorMessage}</div>;
  }

  if (!selectedRecord) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="max-w-xs text-center">
          <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <DefaultActionButtons actions={quickActions} onAction={onAction} />
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-border bg-background p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <DefaultActionButtons
              actions={section.actions}
              onAction={onAction}
            />
          </div>
          <div className="mt-3 space-y-3">
            {section.items.map((item) => (
              <div key={item.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <div className="mt-1 text-sm text-foreground">
                  {item.render(selectedRecord)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
