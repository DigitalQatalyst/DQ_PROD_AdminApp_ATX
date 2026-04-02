import { LVETab } from "../types";
import { cn } from "../../../utils/cn";
import { X } from "lucide-react";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVETabsBar from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

interface LVETabsBarProps {
  tabs: LVETab[];
  onTabSelect?: (tabId: string, tab?: LVETab) => void;
  onTabClose?: (tabId: string, tab?: LVETab) => void;
}

/**
 * @deprecated This component is deprecated. Use the canonical workspace components from @/components/layout/workspace instead.
 */
export const LVETabsBar = ({
  tabs,
  onTabSelect,
  onTabClose,
}: LVETabsBarProps) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto px-2 py-1"
      role="tablist"
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group inline-flex max-w-xs items-center rounded-md border transition-colors",
            tab.isActive
              ? "border-primary bg-card text-primary shadow-sm"
              : "border-border bg-muted text-muted-foreground hover:bg-card",
          )}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab.isActive}
            title={tab.description ?? tab.label}
            onClick={() => onTabSelect?.(tab.id, tab)}
            className="inline-flex min-w-0 items-center px-3 py-1.5 text-xs"
          >
            <span className="truncate">{tab.label}</span>
            {tab.isDirty && (
              <span
                className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500"
                aria-hidden="true"
              />
            )}
          </button>
          {tab.canClose !== false && onTabClose && (
            <button
              type="button"
              aria-label={`Close ${tab.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onTabClose(tab.id, tab);
              }}
              className="px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
