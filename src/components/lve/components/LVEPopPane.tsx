import React, { useState } from "react";
import { LVERecord, LVESection, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";

interface LVEPopPaneProps<T extends LVERecord> {
  selectedRecord?: T;
  sections: LVESection[];
  config?: LVEPaneConfig;
  onCollapse?: () => void;
}

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

  if (!selectedRecord) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="mb-2 text-2xl">📌</div>
          <p className="text-xs text-muted-foreground">
            Context panel will show related information when a record is
            selected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h4 className="font-medium text-foreground text-sm">Context</h4>
        {config?.collapsible && (
          <button
            onClick={onCollapse}
            className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Sections */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.includes(section.id);

            return (
              <div key={section.id} className="border border-border rounded">
                {/* Section Header */}
                <div
                  className={cn(
                    "flex items-center justify-between p-2 border-b border-border bg-muted/30 text-xs",
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
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </div>

                {/* Section Content */}
                {!isCollapsed && (
                  <div className="p-2 space-y-2">
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
                            : selectedRecord[field.field] || "—"}
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
    </div>
  );
};
