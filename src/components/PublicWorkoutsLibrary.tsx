
import React, { useState } from 'react';
import { usePublicWorkoutLibrary } from '@/hooks/useWorkoutLibraryIntegration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Clock, Dumbbell } from 'lucide-react';
import { Workout } from '@/types/workout';
import { useWorkout } from '@/contexts/WorkoutContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const PublicWorkoutsLibrary: React.FC = () => {
  const { workouts, isLoading, saveWorkout } = usePublicWorkoutLibrary();
  const { loadWorkoutFromLibrary } = useWorkout();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredWorkouts = workouts.filter(
    workout => workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUseWorkout = (workout: Workout) => {
    // First, save the workout to user's personal library
    saveWorkout(workout);
    
    // Navigate to sheets page and load the workout
    navigate('/sheets');
    
    // Toast notification
    toast.success(`"${workout.name}" added to your workout program`);
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
      
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No public workouts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map(workout => (
            <Card key={workout.id} className="bg-dark-200 border-dark-300 hover:border-fitbloom-purple transition-colors">
              <CardHeader>
                <CardTitle className="text-white">{workout.name}</CardTitle>
                <CardDescription className="flex items-center text-gray-400">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  {workout.exercises.length} exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Created by: {workout.creator || 'Anonymous'}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(workout.savedAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 line-clamp-2">
                    {workout.exercises.slice(0, 3).map(e => e.name).join(', ')}
                    {workout.exercises.length > 3 ? '...' : ''}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                  onClick={() => handleUseWorkout(workout)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Use This Workout
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicWorkoutsLibrary;
