
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClubList from '@/components/clubs/ClubList';
import ClubHeader from '@/components/clubs/ClubHeader';
import ClubTabs from '@/components/clubs/ClubTabs';
import CreateClubForm from '@/components/clubs/CreateClubForm';
import { useClub } from '@/contexts/ClubContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Clubs: React.FC = () => {
  const { clubId, action } = useParams<{ clubId: string; action?: string }>();
  const { currentClub, setCurrentClub, clubs, loadingClubs } = useClub();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (clubId && !action) {
      // Load specific club
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        setCurrentClub(club);
      } else if (!loadingClubs) {
        // Club not found and not loading, redirect to clubs list
        navigate('/clubs');
      }
    } else if (!clubId && !action) {
      // Clubs list, clear current club
      setCurrentClub(null);
    }
  }, [clubId, action, clubs, loadingClubs]);
  
  const renderContent = () => {
    if (action === 'create') {
      return <CreateClubForm />;
    } else if (clubId && currentClub) {
      return (
        <div>
          <ClubHeader clubId={clubId} />
          <ClubTabs clubId={clubId} />
        </div>
      );
    } else if (clubId && !currentClub && !loadingClubs) {
      return (
        <div className="text-center py-16">
          <h2 className="text-xl mb-4">Club not found</h2>
          <Button 
            onClick={() => navigate('/clubs')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      );
    } else {
      return <ClubList />;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      {renderContent()}
    </div>
  );
};

export default Clubs;
