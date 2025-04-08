
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LibraryHeaderProps {
  handleCreateButtonClick: () => void;
}

const LibraryHeader = ({ handleCreateButtonClick }: LibraryHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">My Library</h1>
        <Button 
          className="bg-fitbloom-purple hover:bg-opacity-90" 
          onClick={handleCreateButtonClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      {!user && (
        <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-md mb-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            You are not logged in. Items you create will be stored locally. 
            <Button 
              variant="link" 
              className="text-amber-800 dark:text-amber-200 underline p-0 h-auto font-semibold"
              onClick={() => navigate('/auth')}
            >
              Log in
            </Button> to save them to your account.
          </p>
        </div>
      )}
    </>
  );
};

export default LibraryHeader;
