
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ClubList from '@/components/clubs/ClubList';
import ClubHeader from '@/components/clubs/ClubHeader';
import CreateClubForm from '@/components/clubs/CreateClubForm';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ClubLayout from '@/components/clubs/ClubLayout';

const Clubs: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const location = useLocation();
  const { currentClub, setCurrentClub, clubs, loadingClubs } = useClub();
  const navigate = useNavigate();
  
  // Check if the current path is the create club path
  const isCreatePath = location.pathname.endsWith('/create');
  
  useEffect(() => {
    if (clubId && !isCreatePath) {
      // Load specific club
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        setCurrentClub(club);
      } else if (!loadingClubs) {
        // Club not found and not loading, redirect to clubs list
        navigate('/clubs');
      }
    } else if (!clubId && !isCreatePath) {
      // Clubs list, clear current club
      setCurrentClub(null);
    }
  }, [clubId, isCreatePath, clubs, loadingClubs]);
  
  const renderContent = () => {
    if (isCreatePath) {
      return <CreateClubForm />;
    } else if (clubId && currentClub) {
      return <ClubLayout clubId={clubId} />;
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
    <div className="container mx-auto py-6 px-0 max-w-full">
      {renderContent()}
    </div>
  );
};

export default Clubs;
