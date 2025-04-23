import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, FolderHeart, ClipboardList, Users, Calendar, ChevronLeft, ChevronRight, Settings, Dumbbell, Book, Trophy, UserCircle, LineChart, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}
const Sidebar = ({
  collapsed,
  onToggleCollapse
}: SidebarProps) => {
  const {
    session
  } = useAuth();
  const navItems = [{
    to: '/explore',
    icon: <Home className="h-5 w-5" />,
    text: 'Explore'
  }, {
    to: '/search',
    icon: <Search className="h-5 w-5" />,
    text: 'Search'
  }, {
    to: '/library',
    icon: <FolderHeart className="h-5 w-5" />,
    text: 'Library',
    requiresAuth: true
  }, {
    to: '/sheets',
    icon: <ClipboardList className="h-5 w-5" />,
    text: 'Workout Sheets',
    requiresAuth: true
  }, {
    to: '/clubs',
    icon: <Users className="h-5 w-5" />,
    text: 'Clubs',
    requiresAuth: true
  }, {
    to: '/schedule',
    icon: <Calendar className="h-5 w-5" />,
    text: 'Schedule',
    requiresAuth: true
  }, {
    to: '/ai-workout-generator',
    icon: <Dumbbell className="h-5 w-5" />,
    text: 'AI Workout',
    requiresAuth: true
  }, {
    to: '/analytics',
    icon: <LineChart className="h-5 w-5" />,
    text: 'Analytics',
    requiresAuth: true
  }, {
    to: '/leaderboards',
    icon: <Trophy className="h-5 w-5" />,
    text: 'Leaderboards'
  }, {
    to: '/creator',
    icon: <PlusCircle className="h-5 w-5" />,
    text: 'Create Content',
    requiresAuth: true
  }, {
    to: '/profile/view',
    icon: <UserCircle className="h-5 w-5" />,
    text: 'Profile',
    requiresAuth: true
  }, {
    to: '/profile',
    icon: <Settings className="h-5 w-5" />,
    text: 'Settings',
    requiresAuth: true
  }];
  return <aside className={cn("relative h-full bg-gray-900 flex flex-col border-r border-gray-800 transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center p-4 border-b border-gray-800 bg-black py-[13px]">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
          {!collapsed && <div className="flex items-center gap-2">
              <span className="text-xl font-bold">FitBloom</span>
            </div>}
          {collapsed && <span className="font-bold">FB</span>}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-2 overflow-y-auto bg-black px-0 py-[2px]">
        <nav className="space-y-1">
          {navItems.map(item => {
          // Skip if requires auth and no session
          if (item.requiresAuth && !session) return null;
          return <NavLink key={item.to} to={item.to} className={({
            isActive
          }) => cn("flex items-center py-2 px-3 rounded-md transition-colors", isActive ? "bg-fitbloom-purple/20 text-fitbloom-purple" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50", collapsed ? "justify-center" : "")}>
                {item.icon}
                {!collapsed && <span className="ml-3">{item.text}</span>}
              </NavLink>;
        })}
        </nav>
      </div>
      
      <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="absolute -right-3 top-20 border border-gray-700 bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center">
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>;
};
export default Sidebar;