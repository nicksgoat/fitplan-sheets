import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Settings, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ClubHeaderProps {
  clubId: string;
}

const ClubHeader: React.FC<ClubHeaderProps> = ({ clubId }) => {
  const { 
    currentClub, 
    members, 
    joinCurrentClub, 
    leaveCurrentClub, 
    isUserClubMember,
    isUserClubCreator,
    events
  } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!currentClub) return null;
  
  const isCreator = isUserClubCreator(clubId);
  const isMember = isUserClubMember(clubId);
  
  const handleJoinClick = async () => {
    if (!user) {
      toast.error('You need to log in to join this club');
      navigate('/auth');
      return;
    }
    
    try {
      await joinCurrentClub();
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };
  
  const handleLeaveClick = async () => {
    try {
      await leaveCurrentClub();
    } catch (error) {
      console.error('Error leaving club:', error);
    }
  };
  
  return (
    <div className="relative">
      {/* Banner */}
      <div 
        className="h-48 w-full bg-dark-300 bg-center bg-cover"
        style={{ 
          backgroundImage: currentClub.banner_url 
            ? `url(${currentClub.banner_url})` 
            : 'linear-gradient(to right, #4f46e5, #7c3aed)' 
        }}
      >
        {isCreator && (
          <Button 
            variant="ghost" 
            size="sm"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => navigate(`/clubs/${clubId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      {/* Logo and Title Area */}
      <div className="bg-dark-200 p-6 pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex">
            <div 
              className="h-20 w-20 rounded-full bg-dark-300 border-4 border-dark-200 absolute -top-10 bg-center bg-cover"
              style={{ 
                backgroundImage: currentClub.logo_url 
                  ? `url(${currentClub.logo_url})` 
                  : 'linear-gradient(to right, #4f46e5, #7c3aed)' 
              }}
            />
            <div className="ml-24">
              <h1 className="text-2xl font-bold flex items-center">
                {currentClub.name}
                {currentClub.membership_type === 'premium' && (
                  <Badge className="ml-2 bg-amber-500">Premium</Badge>
                )}
              </h1>
              <p className="text-gray-400 mt-1">{currentClub.description}</p>
            </div>
          </div>
          
          <div>
            {isMember ? (
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={handleLeaveClick}
              >
                Leave Club
              </Button>
            ) : (
              <Button 
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                onClick={handleJoinClick}
              >
                Join Club
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex mt-6 border-t border-dark-300 pt-4">
          <div className="flex items-center mr-6">
            <Users className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{members.length} members</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-fitbloom-purple" />
            <span>{events.length} events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubHeader;
