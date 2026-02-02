import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown, Info, Lock, Home, Users, UserCheck, Package, FolderOpen, MapPin, TrendingUp, CheckCircle, FileCheck, Flag, Shield, BarChart3, Activity, FileText, MessageSquare, HelpCircle, Settings, Check, Bell, Tags, CalendarDays, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
interface Company {
  id: string
  name: string
  role: string
  isActive?: boolean
  badge?: string
}
interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  onboardingComplete?: boolean
  companies?: Company[]
  onCompanyChange?: (companyId: string) => void
  onAddNewEnterprise?: () => void
  isLoggedIn?: boolean
  'data-id'?: string
}
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen = true,
  onClose,
  activeSection = 'dashboard',
  onSectionChange,
  onboardingComplete = false,
  companies = [],
  onCompanyChange,
  onAddNewEnterprise,
  isLoggedIn = true,
  'data-id': dataId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userSegment } = useAuth();
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  if (!isLoggedIn) {
    return null
  }

  // Menu items visibility based on user segment
  // Admin (internal): Sees everything
  // Partner: Can see enterprises and other functionalities (but not content management)
  // Enterprise (customer): Can only see services (view only, no creation)

  const isItemVisible = (itemId: string): boolean => {
    // Admin (internal) sees everything
    if (userSegment === 'internal') {
      if (itemId === 'lead-management') {
        return role === 'admin';
      }
      return true;
    }

    // Enterprise (customer) restrictions
    if (userSegment === 'customer') {
      // Enterprise can only see:
      // - Dashboard
      // - Service Management (view only - they can see services they've applied for)
      // - Business Directory (view only)
      // - Zones & Clusters (view only)
      // - Growth Areas (view only)
      // - Service Requests (view their own submissions)
      const enterpriseAllowedItems = [
        'dashboard',
        'activity-center',
        // 'service-management', // HIDDEN: View only - restricted
        'business-directory',
        'zones-clusters',
        'growth-areas',
        'service-requests', // View their own service requests
        'experience-analytics',
        'activity-logs',
        'reports',
        'support-tickets',
        'help-center'
      ];
      return enterpriseAllowedItems.includes(itemId);
    }

    // Partner restrictions
    if (userSegment === 'partner') {
      // Partner can see:
      // - Everything except some admin-only items
      // - Partners CAN see content-management and events (they can create content that needs approval)
      const partnerRestrictedItems = [
        'content-taxonomy',
        'lead-management'
      ];
      return !partnerRestrictedItems.includes(itemId);
    }

    // Default: show all for other segments
    return true;
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCompanyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      const menuItems = getAdminMenuItems().filter(
        (item: any) => item.category !== 'category',
      )
      switch (event.key) {
        case 'Escape':
          if (companyDropdownOpen) {
            setCompanyDropdownOpen(false)
          } else {
            onClose?.()
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedMenuIndex((prev) => {
            const next = prev < menuItems.length - 1 ? prev + 1 : 0
            menuItemsRef.current[next]?.focus()
            return next
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedMenuIndex((prev) => {
            const next = prev > 0 ? prev - 1 : menuItems.length - 1
            menuItemsRef.current[next]?.focus()
            return next
          })
          break
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, companyDropdownOpen, onClose])
  const getAdminMenuItems = () => {
    const items: any[] = []
    if (!onboardingComplete) {
      items.push({
        id: 'onboarding',
        label: 'Platform Setup',
        icon: <Settings size={20} />,
        path: '/onboarding'
      });
    } else {
      items.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home size={20} />,
        path: '/'
      });
    }
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
    });

    // Enterprises - hidden for viewers
    if (isItemVisible('enterprises')) {
      items.push({
        id: 'enterprises',
        label: 'Enterprises',
        icon: <Package size={20} />,
        path: '/enterprises'
      });
    }

    items.push({
      id: 'content-data',
      label: 'CONTENT & DATA',
      category: 'category'
    });

    // Content Taxonomy - hidden for viewers
    if (isItemVisible('content-taxonomy')) {
      items.push({
        id: 'content-taxonomy',
        label: 'Taxonomy Manager',
        icon: <Tags size={20} />,
        path: '/taxonomy-manager?scope=Content'
      });
    }

    items.push({
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
    });

    // Marketplace Taxonomy - hidden for viewers
    if (isItemVisible('marketplace-taxonomy')) {
      items.push({
        id: 'marketplace-taxonomy',
        label: 'Taxonomy Manager',
        icon: <Tags size={20} />,
        path: '/taxonomy-manager?scope=Marketplace'
      });
    }

    // Service Management - hidden for viewers
    if (isItemVisible('service-management')) {
      items.push({
        id: 'service-management',
        label: 'Service Management',
        icon: <CheckCircle size={20} />,
        path: '/service-management'
      });
    }

    if (isItemVisible('lead-management')) {
      items.push({
        id: 'lead-management',
        label: 'Lead Management',
        icon: <ClipboardList size={20} />,
        path: '/lead-management'
      });
    }

    const ENABLE_CRM_SERVICE_REQUESTS = true; // TODO: disable after testing
    if (ENABLE_CRM_SERVICE_REQUESTS && isItemVisible('crm-service-requests')) {
      items.push({
        id: 'crm-service-requests',
        label: 'Service Requests',
        icon: <ClipboardList size={20} />,
        path: '/crm-service-requests'
      });
    }

    // Service Forms - hidden for viewers
    if (isItemVisible('service-forms')) {
      items.push({
        id: 'service-forms',
        label: 'Service Forms',
        icon: <FileText size={20} />,
        path: '/service-forms'
      });
    }

    // Content Management - hidden for viewers
    if (isItemVisible('content-management')) {
      items.push({
        id: 'content-management',
        label: 'Content Management',
        icon: <FileCheck size={20} />,
        path: '/content-management'
      });
    }

    // Events - visible to admin and partners
    if (isItemVisible('events')) {
      items.push({
        id: 'events',
        label: 'Events',
        icon: <CalendarDays size={20} />,
        path: '/events'
      });
    }

    // Services Hub section - visible to all user segments
    items.push({
      id: 'services-hub',
      label: 'SERVICES HUB',
      category: 'category'
    });

    // Service Requests - visible to all (filtered by role in page component)
    if (isItemVisible('service-requests')) {
      items.push({
        id: 'service-requests',
        label: 'Service Requests',
        icon: <ClipboardList size={20} />,
        path: '/service-requests'
      });
    }

    // Community Moderation section - only show if at least one item is visible
    const hasCommunityItems = isItemVisible('moderation-reports') || isItemVisible('community-admin');
    if (hasCommunityItems) {
      items.push({
        id: 'community-moderation',
        label: 'COMMUNITY MODERATION',
        category: 'category'
      });

      // Moderation Reports - hidden for viewers
      if (isItemVisible('moderation-reports')) {
        items.push({
          id: 'moderation-reports',
          label: 'Moderation Reports',
          icon: <Flag size={20} />,
          path: '/moderation-reports'
        });
      }

      // Community Admin - hidden for viewers
      if (isItemVisible('community-admin')) {
        items.push({
          id: 'community-admin',
          label: 'Community Admin',
          icon: <Shield size={20} />,
          path: '/community-admin'
        });
      }
    }

    items.push({
      id: 'analytics-monitoring',
      label: 'ANALYTICS & MONITORING',
      category: 'category'
    }, {
      id: 'experience-analytics',
      label: 'Experience Analytics',
      icon: <BarChart3 size={20} />,
      path: '/ejp-transaction-dashboard'
    }, {
      id: 'activity-logs',
      label: 'Activity Logs',
      icon: <Activity size={20} />,
      path: '/activity-logs'
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

    // Filter out items that should be hidden
    return items.filter(item => {
      if (item.category === 'category') {
        // For category headers, check if there are any visible items after this category
        const categoryIndex = items.indexOf(item);
        const itemsAfterCategory = items.slice(categoryIndex + 1);
        const nextCategoryIndex = itemsAfterCategory.findIndex(i => i.category === 'category');
        const itemsInCategory = nextCategoryIndex === -1
          ? itemsAfterCategory
          : itemsAfterCategory.slice(0, nextCategoryIndex);
        // Show category if at least one item in category is visible
        return itemsInCategory.some(i => !i.category && isItemVisible(i.id));
      }
      return isItemVisible(item.id);
    });
  };
  return <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:w-60 overflow-y-auto`} data-id={dataId}>
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <button className="lg:hidden text-gray-500" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button className="w-full flex items-center justify-between text-left p-3 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCompanyDropdownOpen(!companyDropdownOpen);
          } else if (e.key === 'Escape') {
            setCompanyDropdownOpen(false);
          }
        }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-blue-800 font-bold text-lg leading-tight truncate">
              Platform Admin
            </h2>
            <span className="text-xs text-gray-500 font-medium mt-0.5 block">
              Super Admin
            </span>
          </div>
          <ChevronDown size={18} className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${companyDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {companyDropdownOpen && <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  Platform Admin
                </div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
              <Check size={16} className="text-blue-600" />
            </button>
          </div>
        </div>}
      </div>
    </div>
    {!onboardingComplete && <div className="bg-amber-50 p-3 m-3 rounded-md border border-amber-200">
      <div className="flex items-start">
        <Info size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Complete the platform setup to unlock all administrative sections.
        </p>
      </div>
    </div>}
    <nav className="py-2">
      {getAdminMenuItems().map((item: any, index: number) => {
        if (item.category === 'category') {
          return <div key={item.id} className="px-4 pt-6 pb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
              {item.label}
            </div>
          </div>;
        }
        const isDisabled = !onboardingComplete && item.id !== 'onboarding';
        const isActive = activeSection === item.id;
        const menuItemIndex = getAdminMenuItems().filter((i: any) => i.category !== 'category').findIndex((i: any) => i.id === item.id);
        const handleClick = () => {
          if (isDisabled) return;
          if (item.path) {
            navigate(item.path);
          }
          onSectionChange?.(item.id);
        };

        return <div key={item.id} ref={el => menuItemsRef.current[menuItemIndex] = el} className={`flex items-center px-4 py-3 relative transition-colors ${isActive ? 'bg-blue-700 text-white' : isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 cursor-pointer'}`} onClick={handleClick} onMouseEnter={() => isDisabled && setTooltipItem(item.id)} onMouseLeave={() => setTooltipItem(null)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }} tabIndex={0} role="button" aria-label={`Navigate to ${item.label}`} aria-disabled={isDisabled}>
          <span className="w-8 flex items-center justify-center flex-shrink-0">
            {isDisabled && !isActive ? <div className="relative">
              {item.icon}
              <Lock size={10} className="absolute -top-1 -right-1 text-gray-400" />
            </div> : item.icon}
          </span>
          <span className="flex-1 ml-3">{item.label}</span>
          {tooltipItem === item.id && <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs py-2 px-3 rounded-md w-48 z-50">
            Complete platform setup to unlock this section
            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
          </div>}
        </div>;
      })}
    </nav>
  </div>;
};