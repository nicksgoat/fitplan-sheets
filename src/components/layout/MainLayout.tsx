
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import MobileNavbar from './MobileNavbar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Home,
  Search,
  Library,
  FileSpreadsheet,
  Calendar,
  Users,
  Award,
  Heart,
  LayoutDashboard,
  Plus,
  DollarSign,
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const library = useLibrary();
  
  // Check if we're in a club detail view to hide sidebar completely
  const isInClubDetailView = location.pathname.match(/^\/clubs\/[a-zA-Z0-9-]+$/);

  // If we're in a club detail view, render only the Outlet without the main layout
  if (isInClubDetailView) {
    return <>{children || <Outlet />}</>;
  }
  
  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Library',
      href: '/library',
      icon: Library,
    },
    {
      name: 'Sheets',
      href: '/sheets',
      icon: FileSpreadsheet,
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: Calendar,
    },
    {
      name: 'Clubs',
      href: '/clubs',
      icon: Users,
    },
    {
      name: 'Leaderboards',
      href: '/leaderboards',
      icon: Award,
    },
    {
      name: 'Liked',
      href: '/liked',
      icon: Heart,
    },
    {
      name: 'Sales Dashboard',
      href: '/sales',
      icon: DollarSign,
    }
  ];
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
        <div className="flex flex-1 overflow-hidden w-full">
          {!isMobile && (
            <Sidebar>
              <SidebarHeader className="px-4 py-2">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-fitbloom-purple">FitBloom</span>
                </div>
              </SidebarHeader>
              
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Menu</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton 
                            asChild
                            isActive={location.pathname === item.href}
                            tooltip={item.name}
                          >
                            <Link to={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                
                {library?.collections && library.collections.length > 0 && (
                  <SidebarGroup>
                    <SidebarGroupLabel>Collections</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {library.collections.map((collection) => (
                          <SidebarMenuItem key={collection.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === `/collection/${collection.id}`}
                            >
                              <Link to={`/collection/${collection.id}`}>
                                <span>{collection.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </SidebarContent>
              
              {user && (
                <SidebarFooter>
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>{user?.user_metadata?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.user_metadata?.name}</p>
                        <button
                          onClick={() => signOut()}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </SidebarFooter>
              )}
            </Sidebar>
          )}
          
          <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
            {children || <Outlet />}
          </main>
        </div>
        {isMobile && <MobileNavbar />}
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
