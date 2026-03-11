import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AdminSidebar } from './AppSidebar';
import { SearchBar } from './SearchBar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { QuickActionsMenu } from './QuickActionsMenu';

// Mock data - to be replaced with actual database calls
const companies: any[] = [];
type AppLayoutProps = {
  children: React.ReactNode;
  activeSection: string;
};
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeSection
}) => {
  const navigate = useNavigate();
  // Sidebar should be closed by default on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    // Handle taxonomy manager sections with scope filtering
    if (sectionId === 'content-taxonomy') {
      navigate('/taxonomy-manager?scope=Content');
    } else if (sectionId === 'marketplace-taxonomy') {
      navigate('/taxonomy-manager?scope=Marketplace');
    } else {
      // Handle other sections - you can add more routing logic here
      console.log('Navigate to:', sectionId);
    }
  };

  const mockUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator'
  };
  return <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
        <div className="flex items-center space-x-4">
          <SearchBar />
          <NotificationsDropdown />
          <UserProfileDropdown user={mockUser} />
        </div>
      </Header>
      
      {/* Mobile Menu Button - Just below header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-20">
        <button
          onClick={toggleSidebar}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {sidebarOpen ? 'Close Menu' : 'Menu'}
          </span>
        </button>
      </div>
      
      <div className="flex flex-1 relative overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSection={activeSection} onSectionChange={handleSectionChange} onboardingComplete={true} companies={companies} onCompanyChange={id => console.log('Company changed:', id)} onAddNewEnterprise={() => console.log('Add new enterprise')} isLoggedIn={true} />
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 overflow-y-auto">
          {children}
          <Footer isLoggedIn={true} />
        </main>
      </div>
      <QuickActionsMenu />
    </div>;
};