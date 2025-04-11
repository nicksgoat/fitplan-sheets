
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, FileSpreadsheet, Calendar, Users, Award } from 'lucide-react';
import { ExpandableTabs, type TabItem } from '@/components/ui/expandable-tabs';

const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define navigation tabs with correct type
  const tabs: TabItem[] = [
    { title: 'Home', icon: Home },
    { title: 'Search', icon: Search },
    { title: 'Library', icon: Library },
    { title: 'Clubs', icon: Users },
    { type: "separator" },
    { title: 'Schedule', icon: Calendar },
    { title: 'Leaderboards', icon: Award },
    { title: 'Liked', icon: Heart },
    { title: 'Sheets', icon: FileSpreadsheet },
  ];
  
  // Handle tab selection
  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    // Map the tab index to the corresponding route
    const routes = ['/explore', '/search', '/library', '/clubs', '', '/schedule', '/leaderboards', '/liked', '/sheets'];
    // Skip separators when mapping (index 4 is a separator in our tabs array)
    const routeIndex = index >= 4 ? index + 1 : index;
    
    if (routes[routeIndex]) {
      navigate(routes[routeIndex]);
    }
  };
  
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <ExpandableTabs 
        tabs={tabs}
        activeColor="text-fitbloom-purple"
        className="border-dark-300 bg-dark-300/80 backdrop-blur-md w-full"
        onChange={handleTabChange}
      />
    </div>
  );
};

export default MobileNavbar;
