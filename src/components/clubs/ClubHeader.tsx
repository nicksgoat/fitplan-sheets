
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  Users, 
  Hash, 
  Bell,
  BellOff,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClubHeaderProps {
  clubId: string;
  activeView?: string;
}

const ClubHeader: React.FC<ClubHeaderProps> = ({ clubId, activeView }) => {
  const { 
    currentClub, 
    members, 
    joinCurrentClub, 
    isUserClubMember,
    refreshClubs,
    refreshMembers,
  } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!currentClub) return null;
  
  const isMember = isUserClubMember(clubId);
  console.log("ClubHeader - Is member:", isMember);
  
  const handleJoinClick = async () => {
    if (!user) {
      toast.error('You need to log in to join this club');
      navigate('/auth');
      return;
    }
    
    try {
      console.log("Joining club:", clubId);
      await joinCurrentClub(); // This was likely the problematic method
      
      // Refresh data to update UI state
      await refreshClubs();
      await refreshMembers();
      
      toast.success(`You've joined ${currentClub.name}`);
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join club. Please try again.');
    }
  };
  
  const viewTitle = () => {
    switch (activeView) {
      case 'chat':
        return '#general';
      case 'feed':
        return 'Feed';
      case 'events':
        return 'Events';
      case 'members':
        return 'Members';
      default:
        return currentClub.name;
    }
  };
  
  const viewIcon = () => {
    switch (activeView) {
      case 'chat':
        return <Hash className="h-5 w-5 mr-2 text-gray-400" />;
      case 'feed':
        return <FileText className="h-5 w-5 mr-2 text-gray-400" />;
      case 'events':
        return <Calendar className="h-5 w-5 mr-2 text-gray-400" />;
      case 'members':
        return <Users className="h-5 w-5 mr-2 text-gray-400" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="h-14 min-h-14 border-b border-dark-400 px-4 flex items-center justify-between bg-dark-300">
      <div className="flex items-center">
        {viewIcon()}
        <h2 className="font-semibold flex items-center">
          {viewTitle()}
          {currentClub.membership_type === 'premium' && (
            <Badge className="ml-2 bg-amber-500 text-xs">Premium</Badge>
          )}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Only show notification and search buttons if the user is a member */}
        {!isMember ? (
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            size="sm"
            onClick={handleJoinClick}
          >
            Join Club
          </Button>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white hover:bg-dark-400"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white hover:bg-dark-400"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubHeader;
