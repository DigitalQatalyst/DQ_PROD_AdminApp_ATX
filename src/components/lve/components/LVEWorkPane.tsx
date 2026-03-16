import React, { useState } from "react";
import { LVERecord, LVESection, LVEAction, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import Button from "../../ui/ButtonComponent";

interface LVEWorkPaneProps<T extends LVERecord> {
  selectedRecord?: T;
  sections: LVESection[];
  actions?: LVEAction[];
  config?: LVEPaneConfig;
  onRecordUpdate?: (record: T) => void;
}

export const LVEWorkPane = <T extends LVERecord>({
  selectedRecord,
  sections,
  actions = [],
  config,
  onRecordUpdate,
}: LVEWorkPaneProps<T>) => {
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
      <div className="flex items-center justify-center h-full px-6 py-8">
        <div className="text-center max-w-sm">
          <div className="mb-3 text-3xl">📋</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Record Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a record from the list to view and edit details here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Actions Bar */}
      {actions.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "secondary"}
                size="sm"
                onClick={() => action.onClick(selectedRecord)}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.includes(section.id);

            return (
              <div key={section.id} className="border border-border rounded-lg">
                {/* Section Header */}
                <div
                  className={cn(
                    "flex items-center justify-between p-3 border-b border-border bg-muted/50",
                    section.collapsible && "cursor-pointer hover:bg-muted",
                  )}
                  onClick={
                    section.collapsible
                      ? () => toggleSection(section.id)
                      : undefined
                  }
                >
                  <h4 className="font-medium text-foreground">
                    {section.title}
                  </h4>
                  {section.collapsible &&
                    (isCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>

                {/* Section Content */}
                {!isCollapsed && (
                  <div className="p-3 space-y-3">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </label>
                        <div className="text-sm text-muted-foreground">
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
