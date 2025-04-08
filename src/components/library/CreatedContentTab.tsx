
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import { ItemType } from '@/lib/types';

interface CreatedContentTabProps {
  isLoadingCustom: boolean;
  filteredCustomExercises: ItemType[];
}

const CreatedContentTab = ({ isLoadingCustom, filteredCustomExercises }: CreatedContentTabProps) => {
  const navigate = useNavigate();
  
  if (isLoadingCustom) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
      </div>
    );
  }
  
  if (filteredCustomExercises && filteredCustomExercises.length > 0) {
    return <ContentGrid items={filteredCustomExercises} />;
  }
  
  return (
    <div className="text-center py-10">
      <p className="text-gray-400">You haven't created any content yet.</p>
      <Button 
        className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
        onClick={() => navigate('/create-exercise')}
      >
        Create Content
      </Button>
    </div>
  );
};

export default CreatedContentTab;
