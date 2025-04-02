
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import ClubCard from './ClubCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ClubList: React.FC = () => {
  const { clubs, loadingClubs } = useClub();
  const navigate = useNavigate();

  if (loadingClubs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-dark-200 rounded-md p-4 space-y-2">
            <Skeleton className="h-10 w-3/4 bg-dark-300" />
            <Skeleton className="h-4 w-full bg-dark-300" />
            <Skeleton className="h-4 w-full bg-dark-300" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-1/4 bg-dark-300" />
              <Skeleton className="h-4 w-1/4 bg-dark-300" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clubs</h2>
        <Button 
          onClick={() => navigate('/clubs/create')}
          className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Club
        </Button>
      </div>
      
      {clubs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">No clubs found. Create a new club or join an existing one!</p>
          <Button 
            onClick={() => navigate('/clubs/create')}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Club
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubList;
