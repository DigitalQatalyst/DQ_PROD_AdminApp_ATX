import React, { useState } from "react";
import { LVERecord, LVESection, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { ChevronDown, ChevronRight, PanelRight, X } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVEPopPane from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

interface LVEPopPaneProps<T extends LVERecord> {
  selectedRecord?: T;
  sections: LVESection[];
  config?: LVEPaneConfig;
  onCollapse?: () => void;
}

/**
 * @deprecated This component is deprecated. Use DefaultPopPane from @/components/layout/workspace instead.
 */
export const LVEPopPane = <T extends LVERecord>({
  selectedRecord,
  sections,
  config,
  onCollapse,
}: LVEPopPaneProps<T>) => {
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h4 className="text-sm font-medium text-foreground">Context</h4>
        {config?.collapsible && (
          <button
            type="button"
            onClick={onCollapse}
            className="rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {!selectedRecord ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-2 flex justify-center text-muted-foreground">
              <PanelRight className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">
              Context panel will show related information when a record is
              selected.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-3">
            {sections.map((section) => {
              const isCollapsed = collapsedSections.includes(section.id);

              return (
                <div key={section.id} className="rounded border border-border">
                  <div
                    className={cn(
                      "flex items-center justify-between border-b border-border bg-muted/30 p-2 text-xs",
                      section.collapsible && "cursor-pointer hover:bg-muted/50",
                    )}
                    onClick={
                      section.collapsible
                        ? () => toggleSection(section.id)
                        : undefined
                    }
                  >
                    <span className="font-medium text-foreground">
                      {section.title}
                    </span>
                    {section.collapsible &&
                      (isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-2 p-2">
                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <div className="text-xs font-medium text-foreground">
                            {field.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {field.render
                              ? field.render(
                                  selectedRecord[field.field],
                                  selectedRecord,
                                )
                              : selectedRecord[field.field] || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
