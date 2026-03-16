import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Briefcase,
  MessageSquare,
  User,
  Target,
  Building,
  Plus,
  Upload,
  Zap,
  Filter,
  Clock,
  TrendingUp,
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
  actions?: NavigationAction[];
}

interface NavigationAction {
  id: string;
  name: string;
  icon?: any;
  onClick?: () => void;
}

export function MenuPane() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userSegment } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "crm",
    "support",
    "demo", // Include demo section
  ]);
  const [expandedActions, setExpandedActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const toggleActions = (itemId: string) => {
    const isCurrentlyExpanded = expandedActions.includes(itemId);

    setExpandedActions((prev) =>
      isCurrentlyExpanded
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );

    // If collapsing actions, clear selected action ONLY if it belongs to this module
    if (isCurrentlyExpanded && selectedAction) {
      const activeModule = navigationItems
        .flatMap((section) => section.children || [])
        .find((item) => item.id === itemId);

      const actionBelongsToModule = activeModule?.actions?.some(
        (action) => action.id === selectedAction,
      );

      if (actionBelongsToModule) {
        setSelectedAction(null);
      }
    }
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
          actions: [
            {
              id: "all-contacts",
              name: "All Contacts",
              onClick: () => navigate("/lve-demo?module=contacts&filter=all"),
            },
            {
              id: "new-contact",
              name: "New Contact",
              icon: Plus,
              onClick: () => console.log("Create new contact"),
            },
            {
              id: "import-contacts",
              name: "Import Contacts",
              icon: Upload,
              onClick: () => console.log("Import contacts"),
            },
            {
              id: "quick-create",
              name: "Quick Create",
              icon: Zap,
              onClick: () => console.log("Quick create contact"),
            },
            {
              id: "active-contacts",
              name: "Active Contacts",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=contacts&filter=active"),
            },
            {
              id: "inactive-contacts",
              name: "Inactive Contacts",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=contacts&filter=inactive"),
            },
            {
              id: "prospect-contacts",
              name: "Prospects",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=contacts&filter=prospects"),
            },
            {
              id: "recent-contacts",
              name: "Recent Activity",
              icon: Clock,
              onClick: () =>
                navigate("/lve-demo?module=contacts&filter=recent"),
            },
          ],
        },
        {
          id: "leads",
          name: "Leads",
          icon: Target,
          path: "/leads",
          requiredSegments: ["internal"],
          actions: [
            {
              id: "all-leads",
              name: "All Leads",
              onClick: () => navigate("/lve-demo?module=leads&filter=all"),
            },
            {
              id: "new-lead",
              name: "New Lead",
              icon: Plus,
              onClick: () => console.log("Create new lead"),
            },
            {
              id: "import-leads",
              name: "Import Leads",
              icon: Upload,
              onClick: () => console.log("Import leads"),
            },
            {
              id: "lead-conversion",
              name: "Lead Conversion",
              icon: TrendingUp,
              onClick: () => console.log("Lead conversion tools"),
            },
            {
              id: "qualified",
              name: "Qualified",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=leads&filter=qualified"),
            },
            {
              id: "contacted",
              name: "Contacted",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=leads&filter=contacted"),
            },
            {
              id: "opportunity",
              name: "Opportunity",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=leads&filter=opportunity"),
            },
            {
              id: "new-leads",
              name: "New Leads",
              icon: Filter,
              onClick: () => navigate("/lve-demo?module=leads&filter=new"),
            },
            {
              id: "closed-leads",
              name: "Closed Leads",
              icon: Filter,
              onClick: () => navigate("/lve-demo?module=leads&filter=closed"),
            },
            {
              id: "high-value-leads",
              name: "High Value",
              icon: TrendingUp,
              onClick: () =>
                navigate("/lve-demo?module=leads&filter=highValue"),
            },
            {
              id: "recent-leads",
              name: "Recent Activity",
              icon: Clock,
              onClick: () => navigate("/lve-demo?module=leads&filter=recent"),
            },
          ],
        },
        {
          id: "accounts",
          name: "Accounts",
          icon: Building,
          path: "/accounts",
          requiredSegments: ["internal"],
          actions: [
            {
              id: "all-accounts",
              name: "All Accounts",
              onClick: () => navigate("/lve-demo?module=accounts&filter=all"),
            },
            {
              id: "new-account",
              name: "New Account",
              icon: Plus,
              onClick: () => console.log("Create new account"),
            },
            {
              id: "import-accounts",
              name: "Import Accounts",
              icon: Upload,
              onClick: () => console.log("Import accounts"),
            },
            {
              id: "customer-accounts",
              name: "Customers",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=customers"),
            },
            {
              id: "prospect-accounts",
              name: "Prospects",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=prospects"),
            },
            {
              id: "partner-accounts",
              name: "Partners",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=partners"),
            },
            {
              id: "active-accounts",
              name: "Active Accounts",
              icon: Filter,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=active"),
            },
            {
              id: "recent-activity",
              name: "Recent Activity",
              icon: Clock,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=recent"),
            },
            {
              id: "high-value",
              name: "High Value",
              icon: TrendingUp,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=highValue"),
            },
            {
              id: "enterprise-accounts",
              name: "Enterprise",
              icon: Building,
              onClick: () =>
                navigate("/lve-demo?module=accounts&filter=enterprise"),
            },
            {
              id: "large-accounts",
              name: "Large Accounts",
              icon: Building,
              onClick: () => navigate("/lve-demo?module=accounts&filter=large"),
            },
          ],
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
          requiredSegments: ["internal"],
        },
      ],
    },
    {
      id: "demo",
      name: "Demo",
      icon: Building,
      children: [
        {
          id: "lve-demo",
          name: "LVE Demo",
          icon: Building,
          path: "/lve-demo",
          requiredSegments: ["internal", "partner"],
        },
      ],
    },
  ];

  const isItemVisible = (item: NavigationItem) => {
    if (!item.requiredSegments) return true;
    if (!userSegment) return false;
    return item.requiredSegments.includes(userSegment);
  };

  const isItemActive = (path: string) => location.pathname === path;

  // Check if section is active - only true if the section itself is active, not its children
  const isSectionActive = (section: NavigationItem) => {
    // Only highlight section if it has a direct path that matches current location
    return section.path ? isItemActive(section.path) : false;
  };

  // Auto-expand actions for the currently active module and set selected action
  React.useEffect(() => {
    const activeItem = navigationItems
      .flatMap((section) => section.children || [])
      .find((item) => item.path && isItemActive(item.path));

    if (activeItem && activeItem.actions) {
      // Auto-expand only if not already expanded (to allow manual collapse)
      setExpandedActions((prev) =>
        prev.includes(activeItem.id) ? prev : [...prev, activeItem.id],
      );

      // Only set default selected action if no action is currently selected
      // or if the currently selected action doesn't belong to the active module
      const currentActionBelongsToActiveModule = activeItem.actions.some(
        (action) => action.id === selectedAction,
      );

      if (!selectedAction || !currentActionBelongsToActiveModule) {
        const defaultAction = activeItem.actions[0];
        if (defaultAction) {
          setSelectedAction(defaultAction.id);
        }
      }
    }
  }, [location.pathname]); // Only re-run when navigating to a different page

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
                      <div key={item.id}>
                        {/* Main Navigation Item */}
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              if (item.path) navigate(item.path);
                              if (item.actions) toggleActions(item.id);
                            }}
                            className={cn(
                              "flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all duration-200",
                              // Only highlight parent if this specific item is active AND no actions are selected
                              item.path &&
                                isItemActive(item.path) &&
                                (!expandedActions.includes(item.id) ||
                                  !selectedAction)
                                ? "bg-primary/15 text-primary border-l-2 border-primary -ml-[2px]"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                            )}
                          >
                            {item.icon && <item.icon className="w-3.5 h-3.5" />}
                            <span className="truncate">{item.name}</span>
                          </button>

                          {/* Actions Toggle - Show when module has actions */}
                          {item.actions && (
                            <button
                              onClick={() => toggleActions(item.id)}
                              className="p-2.5 rounded hover:bg-secondary/30 text-muted-foreground/60 hover:text-foreground transition-colors"
                            >
                              {expandedActions.includes(item.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Module Actions - Show when expanded */}
                        {item.actions && expandedActions.includes(item.id) && (
                          <div className="ml-2 mt-1 space-y-0.5">
                            {item.actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={() => {
                                  setSelectedAction(action.id);
                                  action.onClick?.();
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all duration-200",
                                  selectedAction === action.id
                                    ? "bg-primary/15 text-primary border-l-2 border-primary -ml-[2px]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                                )}
                              >
                                {action.icon && (
                                  <action.icon className="w-3.5 h-3.5" />
                                )}
                                <span className="truncate">{action.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
