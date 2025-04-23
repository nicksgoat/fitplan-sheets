
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { Club } from '@/types/club';
import { useNavigate } from 'react-router-dom';

interface ClubDetailHeaderProps {
  club: Club;
  isUserClubMember: boolean;
  onJoinClub: () => Promise<void>;
  joiningClub: boolean;
}

const ClubDetailHeader: React.FC<ClubDetailHeaderProps> = ({
  club,
  isUserClubMember,
  onJoinClub,
  joiningClub
}) => {
  const navigate = useNavigate();
  const defaultBannerUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  const defaultLogoUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

  return (
    <div className="mb-6">
      <div className="h-48 bg-cover bg-center relative w-full rounded-t-lg"
        style={{ backgroundImage: `url(${club?.banner_url || defaultBannerUrl})` }}
      />
      
      <div className="px-6 py-4 relative flex flex-wrap items-start">
        <div className="absolute -top-12 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
          <img 
            src={club?.logo_url || defaultLogoUrl} 
            alt={club?.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex flex-col ml-28 flex-1">
          <h1 className="text-2xl font-bold">{club?.name}</h1>
          <span className="text-sm text-muted-foreground capitalize">
            {club?.club_type || 'Fitness Club'}
          </span>
        </div>
        
        <div>
          {isUserClubMember ? (
            <Button
              variant="outline"
              disabled={joiningClub}
              className="border-primary text-primary"
            >
              Member
            </Button>
          ) : (
            <Button
              onClick={onJoinClub}
              disabled={joiningClub}
            >
              Join Club
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetailHeader;
