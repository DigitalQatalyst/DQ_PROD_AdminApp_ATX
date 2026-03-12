import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  ChevronDown,
  Info,
  CheckCircle,
  BarChart3,
  Settings,
  Check,
  FileCheck,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// DEVELOP-V1: Home icon removed (dashboard disabled)
// DEVELOP-V1: Unused imports commented out (features disabled)
// import { Users, UserCheck, Package, FolderOpen, MapPin, TrendingUp, FileCheck, Flag, Shield, Activity, FileText, MessageSquare, HelpCircle, Bell, Tags } from 'lucide-react';
interface Company {
  id: string;
  name: string;
  role: string;
  isActive?: boolean;
  badge?: string;
}
interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  onboardingComplete?: boolean;
  companies?: Company[];
  onCompanyChange?: (companyId: string) => void;
  onAddNewEnterprise?: () => void;
  isLoggedIn?: boolean;
  "data-id"?: string;
}
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen = true,
  onClose,
  activeSection = "dashboard",
  onSectionChange,
  onboardingComplete = false,
  companies = [],
  onCompanyChange,
  onAddNewEnterprise,
  isLoggedIn = true,
  "data-id": dataId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSegment } = useAuth();
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      const menuItems = getAdminMenuItems().filter(
        (item: any) => item.category !== "category"
      );
      switch (event.key) {
        case "Escape":
          if (companyDropdownOpen) {
            setCompanyDropdownOpen(false);
          } else {
            onClose?.();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedMenuIndex((prev) => {
            const next = prev < menuItems.length - 1 ? prev + 1 : 0;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedMenuIndex((prev) => {
            const next = prev > 0 ? prev - 1 : menuItems.length - 1;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, companyDropdownOpen, onClose, isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }
  const getAdminMenuItems = () => {
    const items: any[] = [];
    // DEVELOP-V1: Dashboard removed - only analytics dashboards enabled
    if (!onboardingComplete) {
      items.push({
        id: "onboarding",
        label: "Platform Setup",
        icon: <Settings size={20} />,
        path: "/onboarding",
      });
      return items;
    }
    // Note: Dashboard removed in v1 - users are redirected to analytics

    // Analytics & Monitoring - Enabled in v1
    // Show dashboards based on user segment
    const showAnalyticsSection =
      userSegment === "internal" || userSegment === "partner";

    if (showAnalyticsSection) {
      items.push({
        id: "analytics-monitoring",
        label: "ANALYTICS & MONITORING",
        category: "category",
      });

      // Only show Experience Analytics for Partners
      if (userSegment === "partner") {
        items.push({
          id: "experience-analytics",
          label: "Experience Analytics",
          icon: <BarChart3 size={20} />,
          path: "/ejp-transaction-dashboard",
        });
     
      }

      // Only show Service Delivery for Staff (internal)
      if (userSegment === "internal") {
        items.push({
          id: "service-delivery",
          label: "Service Delivery",
          icon: <CheckCircle size={20} />,
          path: "/service-delivery-overview",
        });
       
      }
    }

    // Content & Data - enable Content Management
    if (userSegment === "internal") {
      items.push(
        {
          id: "content-data",
          label: "CONTENT & DATA",
          category: "category",
        },
        {
          id: "content-management",
          label: "Content Management",
          icon: <FileCheck size={20} />,
          path: "/content-management",
        },
        {
          id: "accounts",
          label: "Accounts (LVE Shell)",
          icon: <Briefcase size={20} />,
          path: "/accounts",
        }
      );
    }
    //Chat Support
    if (userSegment === "partner") {
      items.push({
        id: "chat-support",
        label: "Chat Support",
        icon: <MessageSquare size={20} />,
        path: "/chat-support",
      });
    }

    // DEVELOP-V1: All other features disabled
    /*
    items.push({
      id: 'activity-center',
      label: 'Activity Center',
      icon: <Bell size={20} />,
      path: '/activity-center'
    }, {
      id: 'user-management',
      label: 'USER MANAGEMENT',
      category: 'category'
    }, {
      id: 'users',
      label: 'Users',
      icon: <Users size={20} />,
      path: '/users'
    }, {
      id: 'partners',
      label: 'Partners',
      icon: <UserCheck size={20} />,
      path: '/partners'
    }, {
      id: 'enterprises',
      label: 'Enterprises',
      icon: <Package size={20} />,
      path: '/enterprises'
    }, {
      id: 'content-data',
      label: 'CONTENT & DATA',
      category: 'category'
    }, {
      id: 'content-taxonomy',
      label: 'Taxonomy Manager',
      icon: <Tags size={20} />,
      path: '/taxonomy-manager?scope=Content'
    }, {
      id: 'business-directory',
      label: 'Business Directory',
      icon: <FolderOpen size={20} />,
      path: '/business-directory'
    }, {
      id: 'zones-clusters',
      label: 'Zones & Clusters',
      icon: <MapPin size={20} />,
      path: '/zones-clusters'
    }, {
      id: 'growth-areas',
      label: 'Growth Areas',
      icon: <TrendingUp size={20} />,
      path: '/growth-areas'
    }, {
      id: 'marketplace-hub',
      label: 'MARKETPLACE HUB',
      category: 'category'
    }, {
      id: 'marketplace-taxonomy',
      label: 'Taxonomy Manager',
      icon: <Tags size={20} />,
      path: '/taxonomy-manager?scope=Marketplace'
    }, {
      id: 'service-management',
      label: 'Service Management',
      icon: <CheckCircle size={20} />,
      path: '/service-management'
    }, {
      id: 'content-management',
      label: 'Content Management',
      icon: <FileCheck size={20} />,
      path: '/content-management'
    }, {
      id: 'community-moderation',
      label: 'COMMUNITY MODERATION',
      category: 'category'
    }, {
      id: 'moderation-reports',
      label: 'Moderation Reports',
      icon: <Flag size={20} />,
      path: '/moderation-reports'
    }, {
      id: 'community-admin',
      label: 'Community Admin',
      icon: <Shield size={20} />,
      path: '/community-admin'
    }, {
      id: 'reports',
      label: 'Reports',
      icon: <FileText size={20} />,
      path: '/reports'
    }, {
      id: 'support',
      label: 'SUPPORT',
      category: 'category'
    }, {
      id: 'support-tickets',
      label: 'Support Tickets',
      icon: <MessageSquare size={20} />,
      path: '/support-tickets'
    }, {
      id: 'help-center',
      label: 'Help Center',
      icon: <HelpCircle size={20} />,
      path: '/help-center'
    });
    */
    return items;
  };
  return (
    <div
      className={`fixed lg:static top-0 left-0 bottom-0 lg:h-full z-30 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:w-60 overflow-y-auto flex-shrink-0 lg:min-h-full`}
      data-id={dataId}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <button className="lg:hidden text-gray-500" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-full flex items-center justify-between text-left p-3 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCompanyDropdownOpen(!companyDropdownOpen);
              } else if (e.key === "Escape") {
                setCompanyDropdownOpen(false);
              }
            }}
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-blue-800 font-bold text-lg leading-tight truncate">
                {userSegment === "internal"
                  ? "Platform Admin"
                  : "Partner Admin"}
              </h2>
              <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                {userSegment === "internal" ? "Super Admin" : "Partner"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${
                companyDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {companyDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {userSegment === "internal"
                        ? "Platform Admin"
                        : "Partner Admin"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userSegment === "internal" ? "Super Admin" : "Partner"}
                    </div>
                  </div>
                  <Check size={16} className="text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {!onboardingComplete && (
        <div className="bg-amber-50 p-3 m-3 rounded-md border border-amber-200">
          <div className="flex items-start">
            <Info
              size={16}
              className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
            />
            <p className="text-xs text-amber-700">
              Complete the platform setup to unlock all administrative sections.
            </p>
          </div>
        </div>
      )}
      <nav className="py-2">
        {getAdminMenuItems().map((item: any, index: number) => {
          if (item.category === "category") {
            return (
              <div key={item.id} className="px-4 pt-6 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
                  {item.label}
                </div>
              </div>
            );
          }
          
          const isActive = activeSection === item.id;
          const menuItemIndex = getAdminMenuItems()
            .filter((i: any) => i.category !== "category")
            .findIndex((i: any) => i.id === item.id);
          const handleClick = () => {
            if (item.path) {
              navigate(item.path);
            }
            onSectionChange?.(item.id);
          };

          return (
            <div
              key={item.id}
              ref={(el) => (menuItemsRef.current[menuItemIndex] = el)}
              className={`flex items-center px-4 py-3 relative transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-gray-700 hover:bg-gray-200 cursor-pointer"
              }`}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="w-8 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              <span className="flex-1 ml-3">{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
