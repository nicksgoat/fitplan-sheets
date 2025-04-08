
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ContentGrid from '@/components/ui/ContentGrid';
import { ItemType } from '@/lib/types';

interface ExercisesTabProps {
  isLoading: boolean;
  error: any;
  filteredExercises: ItemType[];
  activeCategory: string | null;
}

const ExercisesTab = ({ isLoading, error, filteredExercises, activeCategory }: ExercisesTabProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400">Failed to load exercises. Using local data.</p>
        {filteredExercises.length > 0 ? (
          <div className="mt-4">
            <ContentGrid items={filteredExercises} />
          </div>
        ) : (
          <p className="text-gray-400 mt-2">No exercises available.</p>
        )}
      </div>
    );
  }
  
  if (filteredExercises.length > 0) {
    return <ContentGrid items={filteredExercises} />;
  }
  
  return (
    <div className="text-center py-10">
      <p className="text-gray-400">No exercises found.</p>
      <Button 
        className="mt-4 bg-fitbloom-purple hover:bg-opacity-90 text-sm"
        onClick={() => navigate('/create-exercise')}
      >
        Create Exercise
      </Button>
    </div>
  );
};

export default ExercisesTab;
