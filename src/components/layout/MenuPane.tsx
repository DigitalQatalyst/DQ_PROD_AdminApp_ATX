import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  Target,
  User,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { ScrollArea } from "../ui/scroll-area";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiredSegments?: string[];
}

interface NavigationSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavigationItem[];
}

interface MenuPaneProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationSections: NavigationSection[] = [
  {
    id: "crm",
    name: "CRM Modules",
    icon: Briefcase,
    children: [
      {
        id: "contacts",
        name: "Contacts",
        icon: User,
        path: "/contacts",
        requiredSegments: ["internal"],
      },
      {
        id: "leads",
        name: "Leads",
        icon: Target,
        path: "/leads",
        requiredSegments: ["internal"],
      },
      {
        id: "accounts",
        name: "Accounts",
        icon: Building,
        path: "/accounts",
        requiredSegments: ["internal"],
      },
    ],
  },
  {
    id: "support",
    name: "Support",
    icon: MessageSquare,
    children: [
      {
        id: "chat-support",
        name: "Chat Support",
        icon: MessageSquare,
        path: "/chat-support",
        requiredSegments: ["partner"],
      },
    ],
  },
];

export function MenuPane({
  collapsed = false,
  onToggleCollapse,
}: MenuPaneProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userSegment } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "crm",
    "support",
  ]);

  const visibleSections = useMemo(() => {
    return navigationSections
      .map((section) => ({
        ...section,
        children: section.children.filter((item) => {
          if (!item.requiredSegments) {
            return true;
          }

          if (!userSegment) {
            return false;
          }

          return item.requiredSegments.includes(userSegment);
        }),
      }))
      .filter((section) => section.children.length > 0);
  }, [userSegment]);

  const visibleModules = useMemo(
    () => visibleSections.flatMap((section) => section.children),
    [visibleSections],
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

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
                Module navigation
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
            {visibleModules.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex w-full items-center justify-center rounded-lg border px-0 py-3 transition-all duration-200",
                    isActive
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                  )}
                  title={item.name}
                  aria-label={item.name}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="space-y-4 p-3">
            {visibleSections.map((section) => (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{section.name}</span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {expandedSections.includes(section.id) && (
                  <div className="mt-1 space-y-1">
                    {section.children.map((item) => {
                      const isActive = location.pathname === item.path;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.path)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
                            isActive
                              ? "border border-primary/20 bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
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
