import React, { useEffect, useState } from 'react';
import { ExploreDropdown } from './components/ExploreDropdown';
import { DemoMobileDrawer } from './components/DemoMobileDrawer';
interface DemoHeaderProps {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
  'data-id'?: string;
}
export function DemoHeader({
  toggleSidebar,
  sidebarOpen,
  'data-id': dataId
}: DemoHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <>
      <header className={`flex items-center w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg backdrop-blur-sm bg-gradient-to-r from-teal-500/95 via-blue-500/95 to-purple-600/95' : 'relative bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600'}`} data-id={dataId}>
        {/* Logo Section */}
        <div className={`bg-gradient-to-r from-teal-600 to-teal-500 text-white py-2 px-4 flex items-center transition-all duration-300 ${isSticky ? 'h-12' : 'h-16'}`}>
          <img 
            src="/assets/qdb-logo.svg" 
            alt="Qatar Development Bank" 
            className={`transition-all duration-300 ${isSticky ? 'h-8' : 'h-12'}`}
          />
        </div>
        {/* Main Navigation */}
        <div className={`flex-1 flex justify-between items-center bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 text-white px-4 transition-all duration-300 ${isSticky ? 'h-12' : 'h-16'}`}>
          {/* Left Navigation - Desktop and Tablet */}
          <div className="hidden md:flex items-center space-x-8">
            <ExploreDropdown isCompact={isSticky} />
            <div className={`hover:text-gray-200 transition-colors duration-200 cursor-pointer ${isSticky ? 'text-sm' : ''}`}>
              Discover Qatar
            </div>
          </div>
          {/* Right Side - CTAs without authentication */}
          <div className="flex items-center ml-auto space-x-2 relative">
            {/* Desktop CTAs (≥1024px) */}
            <div className="hidden lg:flex items-center space-x-3">
              <button className={`px-4 py-2 text-white border border-white/30 rounded-md hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isSticky ? 'text-sm px-3 py-1.5' : ''}`} onClick={() => console.log('Become a Partner clicked')}>
                Become a Partner
              </button>
              <button className={`px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium ${isSticky ? 'text-sm px-3 py-1.5' : ''}`} onClick={() => console.log('Make an Enquiry clicked')}>
                Make an Enquiry
              </button>
            </div>
            {/* Tablet Enquiry Button (768px - 1023px) */}
            <div className="hidden md:flex lg:hidden items-center">
              <button className={`px-3 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium ${isSticky ? 'text-sm px-2 py-1.5' : 'text-sm'}`} onClick={() => console.log('Make an Enquiry clicked')}>
                Enquiry
              </button>
            </div>
            {/* Mobile and Tablet Drawer - Show for screens <1024px */}
            <DemoMobileDrawer isCompact={isSticky} />
          </div>
        </div>
      </header>
      {/* Spacer for sticky header */}
      {isSticky && <div className="h-12"></div>}
    </>;
}