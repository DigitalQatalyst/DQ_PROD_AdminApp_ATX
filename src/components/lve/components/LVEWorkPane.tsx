import React, { useState } from "react";
import { LVERecord, LVESection, LVEAction, LVEPaneConfig } from "../types";
import { cn } from "../../../utils/cn";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import Button from "../../ui/ButtonComponent";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVEWorkPane from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

interface LVEWorkPaneProps<T extends LVERecord> {
  selectedRecord?: T;
  sections: LVESection[];
  actions?: LVEAction[];
  config?: LVEPaneConfig;
  onRecordUpdate?: (record: T) => void;
}

/**
 * @deprecated This component is deprecated. Use DefaultWorkPane from @/components/layout/workspace instead.
 */
export const LVEWorkPane = <T extends LVERecord>({
  selectedRecord,
  sections,
  actions = [],
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
      <div className="flex h-full items-center justify-center px-6 py-8">
        <div className="max-w-sm text-center">
          <div className="mb-3 flex justify-center text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
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
    <div className="flex h-full flex-col">
      {actions.length > 0 && (
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "secondary"}
                size="sm"
                onClick={() => action.onClick(selectedRecord)}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-4">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.includes(section.id);

            return (
              <div key={section.id} className="rounded-lg border border-border">
                <div
                  className={cn(
                    "flex items-center justify-between border-b border-border bg-muted/50 p-3",
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
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 p-3">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && (
                            <span className="ml-1 text-destructive">*</span>
                          )}
                        </label>
                        <div className="text-sm text-muted-foreground">
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
    </div>
  );
};
