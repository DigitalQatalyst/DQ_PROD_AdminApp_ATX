import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { ScrollArea } from "../ui/scroll-area";
import { getLveModulesForSegment } from "./workspace/moduleRegistry";

interface MenuPaneProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MenuPane({
  collapsed = false,
  onToggleCollapse,
}: MenuPaneProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userSegment } = useAuth();
  const visibleModules = getLveModulesForSegment(userSegment);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-pane-menu transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-b border-border",
          collapsed ? "px-3 py-3" : "px-4 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between gap-3",
          )}
        >
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Modules
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered workspace modules
              </p>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={collapsed ? "Expand menu pane" : "Collapse menu pane"}
              title={collapsed ? "Expand menu pane" : "Collapse menu pane"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {collapsed ? (
          <nav className="space-y-2 p-3">
            {visibleModules.map((module) => {
              const isActive = location.pathname.startsWith(module.routes.base);

              return (
                <button
                  key={module.metadata.id}
                  type="button"
                  onClick={() => navigate(module.routes.base)}
                  className={cn(
                    "flex w-full items-center justify-center rounded-lg border px-0 py-3 transition-all duration-200",
                    isActive
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                  )}
                  title={module.metadata.label}
                  aria-label={module.metadata.label}
                >
                  <module.metadata.icon className="h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="space-y-2 p-3">
            {visibleModules.map((module) => {
              const isActive = location.pathname.startsWith(module.routes.base);

              return (
                <button
                  key={module.metadata.id}
                  type="button"
                  onClick={() => navigate(module.routes.base)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
                    isActive
                      ? "border border-primary/20 bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                  )}
                >
                  <module.metadata.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{module.metadata.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </ScrollArea>

      {!collapsed && (
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200",
              location.pathname === "/settings"
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </aside>
  );
}
