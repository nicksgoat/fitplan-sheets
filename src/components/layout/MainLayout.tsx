
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Check if we're in a club detail view to hide sidebar completely
  const isInClubDetailView = location.pathname.match(/^\/clubs\/[a-zA-Z0-9-]+$/);
  
  // Set sidebar to collapsed by default on sheets page
  useEffect(() => {
    if (location.pathname === '/sheets') {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setCollapsed(prev => !prev);
  };
  
  // If we're in a club detail view, render only the Outlet without the main layout
  if (isInClubDetailView) {
    return <>{children || <Outlet />}</>;
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <Sidebar 
            collapsed={collapsed} 
            onToggleCollapse={handleToggleCollapse} 
          />
        )}
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5">
          {children || <Outlet />}
        </main>
      </div>
      {isMobile && (
        <div className="bg-gray-900 border-t border-gray-800">
          <Sidebar mobileFooter />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
