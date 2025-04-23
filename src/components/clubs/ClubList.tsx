
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import ClubCard from './ClubCard';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import ClubDetailPage from './ClubDetailPage';

const ClubList: React.FC = () => {
  const { clubs, loadingClubs, userClubs, setCurrentClub } = useClub();
  const navigate = useNavigate();
  const [selectedClubId, setSelectedClubId] = React.useState<string | null>(null);

  if (selectedClubId) {
    return <ClubDetailPage clubId={selectedClubId} onBack={() => setSelectedClubId(null)} />;
  }

  if (loadingClubs) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg p-4 space-y-4 border">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleClubClick = (clubId: string) => {
    setSelectedClubId(clubId);
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      setCurrentClub(club);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Clubs</h2>
        <Button 
          onClick={() => navigate('/clubs/create')}
          className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Club
        </Button>
      </div>
      
      {userClubs && userClubs.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium">Your Clubs</h3>
            {userClubs.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-fitbloom-purple"
                onClick={() => {
                  document.getElementById('all-clubs-section')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userClubs.slice(0, 6).map(club => (
              <ClubCard 
                key={club.id} 
                club={club} 
                isMember={true}
                onClick={() => handleClubClick(club.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg border p-8">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Plus className="h-10 w-10 text-fitbloom-purple" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first club or join an existing one to connect with others and share your fitness journey!
          </p>
          <Button 
            onClick={() => navigate('/clubs/create')}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Club
          </Button>
        </div>
      ) : (
        <div id="all-clubs-section" className="space-y-4">
          <h3 className="text-xl font-medium">Discover Clubs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map(club => (
              <ClubCard 
                key={club.id} 
                club={club} 
                isMember={userClubs?.some(c => c.id === club.id) || false}
                onClick={() => handleClubClick(club.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubList;
