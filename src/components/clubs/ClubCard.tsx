
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Club } from '@/types/club';
import { formatDistanceToNow } from 'date-fns';
import { useClub } from '@/contexts/ClubContext';
import { useNavigate } from 'react-router-dom';

interface ClubCardProps {
  club: Club;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const { isUserClubMember } = useClub();
  const navigate = useNavigate();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };
  
  const membershipStatus = isUserClubMember(club.id) 
    ? 'Member' 
    : club.membership_type === 'premium' 
      ? 'Premium' 
      : 'Free';
      
  const cardStyle = isUserClubMember(club.id)
    ? 'bg-dark-200 border-fitbloom-purple/50'
    : 'bg-dark-200 border-dark-300';
  
  const handleClick = () => {
    navigate(`/clubs/${club.id}`);
  };

  return (
    <Card 
      className={`${cardStyle} hover:border-fitbloom-purple/80 transition-all cursor-pointer relative overflow-hidden`}
      onClick={handleClick}
    >
      {club.banner_url && (
        <div 
          className="h-20 w-full absolute top-0 left-0 opacity-30 bg-center bg-cover" 
          style={{ backgroundImage: `url(${club.banner_url})` }}
        />
      )}
      
      <CardHeader className="pb-2 pt-4 relative">
        <div className="flex items-center space-x-3">
          {club.logo_url && (
            <div 
              className="h-10 w-10 rounded-full bg-center bg-cover border border-dark-300" 
              style={{ backgroundImage: `url(${club.logo_url})` }}
            />
          )}
          <CardTitle className="text-lg font-semibold">{club.name}</CardTitle>
        </div>
        <Badge 
          className={`absolute top-3 right-4 ${
            membershipStatus === 'Member' 
              ? 'bg-fitbloom-purple/70' 
              : membershipStatus === 'Premium' 
                ? 'bg-amber-500/70' 
                : 'bg-green-500/70'
          }`}
        >
          {membershipStatus}
        </Badge>
      </CardHeader>
      
      <CardContent className="pb-2 text-sm text-gray-400">
        <p className="line-clamp-2">{club.description || 'No description'}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Members</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Created {formatDate(club.created_at)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
