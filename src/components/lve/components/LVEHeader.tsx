import React from "react";
import { LVEAction } from "../types";
import Button from "../../ui/ButtonComponent";

// Log deprecation warning once
if (typeof window !== "undefined") {
  console.warn(
    "[DEPRECATED] LVEHeader from @/components/lve is deprecated. " +
      "Please migrate to the canonical workspace at @/components/layout/workspace. " +
      "See MIGRATION.md at src/components/layout/workspace/MIGRATION.md for guidance.",
  );
}

interface LVEHeaderProps {
  title: string;
  actions?: LVEAction[];
}

/**
 * @deprecated This component is deprecated. Use the canonical workspace components from @/components/layout/workspace instead.
 */
export const LVEHeader: React.FC<LVEHeaderProps> = ({
  title,
  actions = [],
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "secondary"}
              size="sm"
              onClick={() => action.onClick()}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-1" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
