import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Settings,
  BarChart3,
  FileCheck,
  Briefcase,
  MessageSquare,
  User,
  Target,
  Building,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { ScrollArea } from "../ui/scroll-area";

interface NavigationItem {
  id: string;
  name: string;
  icon: any;
  path?: string;
  children?: NavigationItem[];
  requiredSegments?: string[];
}

export function MenuPane() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userSegment } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "crm",
    "analytics",
  ]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const navigationItems: NavigationItem[] = [
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
      id: "analytics",
      name: "Analytics & Monitoring",
      icon: BarChart3,
      children: [
        {
          id: "experience-analytics",
          name: "Experience Analytics",
          icon: BarChart3,
          path: "/ejp-transaction-dashboard",
          requiredSegments: ["partner", "internal"],
        },
      ],
    },
    {
      id: "content",
      name: "Content & Data",
      icon: FileCheck,
      children: [
        {
          id: "content-management",
          name: "Content Management",
          icon: FileCheck,
          path: "/content-management",
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

  const isItemVisible = (item: NavigationItem) => {
    if (!item.requiredSegments) return true;
    return item.requiredSegments.includes(userSegment);
  };

  const isItemActive = (path: string) => location.pathname === path;
  const isSectionActive = (section: NavigationItem) =>
    section.children?.some(
      (child) => child.path && location.pathname === child.path,
    ) || false;

  return (
    <aside className="w-64 bg-pane-menu border-r border-border flex flex-col shrink-0">
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navigationItems.map((section) => {
            const visibleChildren =
              section.children?.filter(isItemVisible) || [];
            if (visibleChildren.length === 0) return null;

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                    isSectionActive(section)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <section.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-sm font-medium truncate">
                    {section.name}
                  </span>
                  {visibleChildren.length > 0 &&
                    (expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    ))}
                </button>

                {/* Section Items */}
                {expandedSections.includes(section.id) && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {visibleChildren.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => item.path && navigate(item.path)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all duration-200",
                          item.path && isItemActive(item.path)
                            ? "bg-primary/15 text-primary border-l-2 border-primary -ml-[2px]"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                        )}
                      >
                        {item.icon && <item.icon className="w-3.5 h-3.5" />}
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Settings at Bottom */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200",
            location.pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </aside>
  );
}
