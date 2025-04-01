
import React, { useState } from 'react';
import { usePublicWorkoutLibrary } from '@/hooks/useWorkoutLibraryIntegration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Loader2 } from 'lucide-react';
import { Workout } from '@/types/workout';
import { useWorkout } from '@/contexts/WorkoutContext';
import { toast } from 'sonner';
import ContentGrid from '@/components/ui/ContentGrid';

const PublicWorkoutsLibrary: React.FC = () => {
  const { workouts, workoutItems, isLoading, saveWorkout } = usePublicWorkoutLibrary();
  const { loadWorkoutFromLibrary } = useWorkout();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredWorkoutItems = workoutItems.filter(
    item => item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUseWorkout = (workoutId: string) => {
    // Find the original workout
    const workout = workouts.find(w => w.id === workoutId);
    
    if (workout) {
      // First, save the workout to user's personal library
      saveWorkout(workout);
      
      // Navigate to sheets page and load the workout
      navigate('/sheets');
      
      // Toast notification
      toast.success(`"${workout.name}" added to your workout program`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search public workouts..."
            className="pl-10 bg-dark-300 border-dark-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredWorkoutItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No public workouts found.</p>
        </div>
      ) : (
        <div>
          <ContentGrid items={filteredWorkoutItems} />
          
          {/* Additional button for quick actions */}
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              className="border-fitbloom-purple text-fitbloom-purple hover:bg-fitbloom-purple/10"
              onClick={() => navigate('/sheets')}
            >
              <Download className="h-4 w-4 mr-2" />
              Create Your Own Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicWorkoutsLibrary;
