
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're in a club detail view to hide sidebar completely
  const isInClubDetailView = location.pathname.match(/^\/clubs\/[a-zA-Z0-9-]+$/);
  
  // If we're in a club detail view, render only the Outlet without the main layout
  if (isInClubDetailView) {
    return <>{children || <Outlet />}</>;
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <Sidebar />
        )}
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
          {children || <Outlet />}
        </main>
      </div>
      {isMobile && <MobileNavbar />}
    </div>
  );
};

export default MainLayout;
