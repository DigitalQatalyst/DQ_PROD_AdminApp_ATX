import React from "react";
import { LVETab } from "../types";
import { cn } from "../../../utils/cn";
import { X } from "lucide-react";

interface LVETabsBarProps {
  tabs: LVETab[];
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

export const LVETabsBar: React.FC<LVETabsBarProps> = ({
  tabs,
  onTabSelect,
  onTabClose,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="px-2 py-1 flex items-center gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabSelect?.(tab.id)}
          className={cn(
            "group inline-flex items-center max-w-xs px-3 py-1.5 rounded-md text-xs border transition-colors",
            tab.isActive
              ? "bg-card border-primary text-primary shadow-sm"
              : "bg-muted border-border text-muted-foreground hover:bg-card",
          )}
        >
          <span className="truncate">{tab.label}</span>
          {tab.isDirty && (
            <span className="ml-1 text-[10px] text-amber-500">●</span>
          )}
          {tab.canClose !== false && onTabClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </button>
      ))}
    </div>
  );
};
