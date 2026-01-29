import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AdminSidebar } from './AppSidebar';
import { SearchBar } from './SearchBar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { QuickActionsMenu } from './QuickActionsMenu';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/supabaseAuth';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    logout();
    navigate('/login');
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

  return <div className="flex flex-col min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}>
        <div className="flex items-center space-x-4">
          <SearchBar />
          <NotificationsDropdown />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
          <UserProfileDropdown />
        </div>
      </Header>
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSection={activeSection} onSectionChange={handleSectionChange} onboardingComplete={true} companies={companies} onCompanyChange={id => console.log('Company changed:', id)} onAddNewEnterprise={() => console.log('Add new enterprise')} isLoggedIn={true} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Footer isLoggedIn={true} />
      <QuickActionsMenu />
    </div>;
};