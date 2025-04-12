
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Library,
  Clock,
  CalendarRange,
  User,
  Dumbbell,
  Medal,
  Heart,
  Users,
  Award,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const linkClasses =
  'flex items-center rounded-md mb-1 p-2 w-full text-foreground hover:bg-accent transition-colors duration-200';
const activeLinkClasses = 'bg-accent/50';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="py-4 h-full flex flex-col">
      <div className="p-2">
        <h2 className="mb-2 font-medium text-lg px-2">Navigation</h2>
        <NavLink
          to="/"
          className={cn(linkClasses, isActive('/') && activeLinkClasses)}
        >
          <Home className="w-5 h-5 mr-3" /> Home
        </NavLink>
        <NavLink
          to="/search"
          className={cn(linkClasses, isActive('/search') && activeLinkClasses)}
        >
          <Search className="w-5 h-5 mr-3" /> Search
        </NavLink>
        <NavLink
          to="/library"
          className={cn(linkClasses, isActive('/library') && activeLinkClasses)}
        >
          <Library className="w-5 h-5 mr-3" /> Library
        </NavLink>
        <NavLink
          to="/liked"
          className={cn(linkClasses, isActive('/liked') && activeLinkClasses)}
        >
          <Heart className="w-5 h-5 mr-3" /> Liked
        </NavLink>
      </div>

      <div className="p-2 mt-5">
        <h2 className="mb-2 font-medium text-lg px-2">Community</h2>
        <NavLink
          to="/clubs"
          className={cn(linkClasses, isActive('/clubs') && activeLinkClasses)}
        >
          <Users className="w-5 h-5 mr-3" /> Clubs
        </NavLink>
        <NavLink
          to="/leaderboards"
          className={cn(linkClasses, isActive('/leaderboards') && activeLinkClasses)}
        >
          <Medal className="w-5 h-5 mr-3" /> Leaderboards
        </NavLink>
      </div>

      {user && (
        <>
          <div className="p-2 mt-5">
            <h2 className="mb-2 font-medium text-lg px-2">Personal</h2>
            <NavLink
              to="/schedule"
              className={cn(linkClasses, isActive('/schedule') && activeLinkClasses)}
            >
              <CalendarRange className="w-5 h-5 mr-3" /> Schedule
            </NavLink>
            <NavLink
              to="/sheets"
              className={cn(linkClasses, isActive('/sheets') && activeLinkClasses)}
            >
              <Clock className="w-5 h-5 mr-3" /> Sheets
            </NavLink>
            <NavLink
              to="/profile"
              className={cn(linkClasses, isActive('/profile') && activeLinkClasses)}
            >
              <User className="w-5 h-5 mr-3" /> Profile
            </NavLink>
          </div>

          <div className="p-2 mt-5">
            <h2 className="mb-2 font-medium text-lg px-2">Creator Tools</h2>
            <NavLink
              to="/exercises/create"
              className={cn(linkClasses, isActive('/exercises/create') && activeLinkClasses)}
            >
              <Dumbbell className="w-5 h-5 mr-3" /> Create Exercise
            </NavLink>
            <NavLink
              to="/creator"
              className={cn(linkClasses, isActive('/creator') && activeLinkClasses)}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" /> Creator Dashboard
            </NavLink>
          </div>
        </>
      )}

      <div className="mt-auto p-4 text-center">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
