
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Library, Compass, Heart, User, Home, FileSpreadsheet, ChevronLeft, ChevronRight, LogOut, Calendar, Users, Award, LayoutDashboard, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  mobileFooter?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ 
  mobileFooter = false, 
  collapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/explore', icon: <Home className="h-5 w-5" /> },
    { name: 'Search', path: '/search', icon: <Search className="h-5 w-5" /> },
    { name: 'My Library', path: '/library', icon: <Library className="h-5 w-5" /> },
    { name: 'Schedule', path: '/schedule', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Clubs', path: '/clubs', icon: <Users className="h-5 w-5" /> },
    { name: 'Leaderboards', path: '/leaderboards', icon: <Award className="h-5 w-5" /> },
    { name: 'Liked', path: '/liked', icon: <Heart className="h-5 w-5" /> },
    { name: 'Sheets', path: '/sheets', icon: <FileSpreadsheet className="h-5 w-5" /> },
  ];
  
  // Creator tools navigation items
  const creatorItems = [
    { name: 'Create Exercise', path: '/exercises/create', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'Creator Dashboard', path: '/creator', icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (mobileFooter) {
    return (
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                location.pathname === item.path ? "text-fitbloom-purple" : "text-gray-400"
              )}
            >
              {item.icon}
            </Button>
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-black h-full flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-6",
        collapsed && "p-4 flex justify-center"
      )}>
        {!collapsed ? (
          <h1 className="text-2xl font-bold flex items-center">
            <span className="text-fitbloom-purple">Fit</span>
            <span className="text-white">Bloom</span>
          </h1>
        ) : (
          <span className="text-2xl font-bold text-fitbloom-purple">F</span>
        )}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-gray-900 hover:text-white",
                    location.pathname === item.path && "bg-gray-900 text-fitbloom-purple font-medium",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Creator Tools Section */}
        {user && (
          <div className="mt-8 space-y-2">
            {!collapsed && <h3 className="px-3 text-xs text-gray-400 uppercase tracking-wider">Creator Tools</h3>}
            <ul className="space-y-2">
              {creatorItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-white hover:bg-gray-900 hover:text-white",
                        location.pathname === item.path && "bg-gray-900 text-fitbloom-purple font-medium",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-3">{item.name}</span>}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link to="/profile">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-white hover:bg-gray-900",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            title={collapsed ? "Profile" : undefined}
          >
            <User className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Profile</span>}
          </Button>
        </Link>
        
        <Button 
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-white hover:bg-gray-900 hover:text-red-400",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
      {onToggleCollapse && (
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            onClick={onToggleCollapse} 
            className="w-full justify-center text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
