import React, { useState } from 'react';
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
  Search,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClubHeaderProps {
  clubId: string;
  activeView?: string;
  onBack?: () => void;
}

const ClubHeader: React.FC<ClubHeaderProps> = ({ clubId, activeView, onBack }) => {
  const { 
    currentClub, 
    members, 
    joinCurrentClub, 
    isUserClubMember,
    refreshClubs,
    refreshMembers,
    userClubs
  } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  
  if (!currentClub) return null;
  
  const isMember = isUserClubMember(clubId);
  console.log("[ClubHeader] ClubId:", clubId, "User:", user?.id, "isMember:", isMember);
  console.log("[ClubHeader] UserClubs:", userClubs);
  console.log("[ClubHeader] Current club:", currentClub);
  
  const handleJoinClick = async () => {
    if (!user) {
      toast.error('You need to log in to join this club');
      navigate('/auth');
      return;
    }
    
    try {
      console.log("[ClubHeader] Starting join process");
      setJoining(true);
      toast.loading('Joining club...');
      
      console.log("[ClubHeader] Joining club:", clubId);
      console.log("[ClubHeader] Current user:", user.id);
      console.log("[ClubHeader] Current userClubs:", userClubs);
      
      const membership = await joinCurrentClub();
      
      console.log("[ClubHeader] Join result:", membership);
      toast.dismiss();
      toast.success(`You've joined ${currentClub.name}`);
      
      console.log("[ClubHeader] Join completed, refreshing data...");
      await Promise.all([
        refreshClubs(),
        refreshMembers()
      ]);
      
      console.log("[ClubHeader] Data refreshed, checking membership status...");
      const newIsMember = isUserClubMember(clubId);
      console.log("[ClubHeader] After join, isMember:", newIsMember);
      
      if (!newIsMember) {
        console.log("[ClubHeader] Membership still not showing up, forcing page reload");
        window.location.reload();
      }
    } catch (error) {
      console.error('[ClubHeader] Error joining club:', error);
      toast.dismiss();
      toast.error('Failed to join club. Please try again.');
    } finally {
      setJoining(false);
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
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 text-gray-400 hover:text-white hover:bg-dark-400"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {viewIcon()}
        <h2 className="font-semibold flex items-center">
          {viewTitle()}
          {currentClub.membership_type === 'premium' && (
            <Badge className="ml-2 bg-amber-500 text-xs">Premium</Badge>
          )}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        {!isMember ? (
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            size="sm"
            onClick={handleJoinClick}
            disabled={joining}
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Club'
            )}
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
