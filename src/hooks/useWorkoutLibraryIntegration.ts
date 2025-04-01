
import { useEffect, useState } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useExercise } from '@/hooks/useExerciseLibrary';
import { Exercise as LibraryExercise } from '@/types/exercise';
import { Exercise as WorkoutExercise, Workout } from '@/types/workout';
import { toast } from 'sonner';
import { addWorkoutToLibrary, getWorkoutLibrary } from '@/utils/presets';
import { ItemType } from '@/lib/types';

/**
 * Hook to get library exercise data for a workout exercise
 */
export function useWorkoutExerciseLibraryData(workoutExerciseId: string) {
  const { getExerciseDetails } = useWorkout();
  const [libraryExerciseId, setLibraryExerciseId] = useState<string | null>(null);
  
  // Get workout exercise details with potential library ID
  const exerciseDetails = getExerciseDetails(workoutExerciseId);
  
  // Fetch library data when available
  useEffect(() => {
    if (exerciseDetails?.libraryExerciseId) {
      setLibraryExerciseId(exerciseDetails.libraryExerciseId);
    } else {
      setLibraryExerciseId(null);
    }
  }, [exerciseDetails]);
  
  // Use the library hook if we have an ID
  const { data: libraryExercise, isLoading, error } = useExercise(
    libraryExerciseId || ''
  );
  
  // Log errors but don't show toast to user to avoid spamming
  useEffect(() => {
    if (error) {
      console.error('Error fetching library exercise:', error);
    }
  }, [error]);
  
  return {
    workoutExercise: exerciseDetails,
    libraryExercise: libraryExerciseId ? libraryExercise : null,
    isLoading,
    hasLibraryData: !!libraryExerciseId
  };
}

/**
 * Get all library exercises available for a workout
 */
export function useWorkoutLibraryExercises(workoutId: string) {
  const { program } = useWorkout();
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  
  useEffect(() => {
    if (program) {
      const workout = program.workouts.find(w => w.id === workoutId);
      if (workout) {
        setWorkoutExercises(workout.exercises);
      }
    }
  }, [program, workoutId]);
  
  return {
    workoutExercises,
    hasWorkout: !!workoutExercises.length
  };
}

/**
 * Hook to get all public workout library items
 */
export function usePublicWorkoutLibrary() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutItems, setWorkoutItems] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPublicWorkouts = () => {
      setIsLoading(true);
      try {
        // Get all workouts from the library
        const allWorkouts = getWorkoutLibrary();
        
        // Filter for public workouts
        const publicWorkouts = allWorkouts.filter(workout => workout.isPublic === true);
        
        setWorkouts(publicWorkouts);
        
        // Convert workouts to ItemType format for ContentCard component
        const items = publicWorkouts.map(workout => ({
          id: workout.id,
          title: workout.name,
          type: 'workout' as const,
          creator: workout.creator || 'Anonymous',
          imageUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=2070',
          tags: ['Workout', `${workout.exercises.length} exercises`],
          duration: workout.exercises.length > 0 ? `${workout.exercises.length * 5} min` : 'N/A',
          difficulty: 'intermediate' as const,
          isFavorite: false,
          description: `Workout with ${workout.exercises.length} exercises`,
          savedAt: workout.savedAt,
          lastModified: workout.lastModified
        }));
        
        setWorkoutItems(items);
      } catch (error) {
        console.error('Error fetching public workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicWorkouts();
  }, []);
  
  const saveWorkout = (workout: Workout) => {
    try {
      // Save workout to personal library (makes a copy)
      const workoutCopy = { ...workout, isPublic: false } as Workout;
      addWorkoutToLibrary(workoutCopy);
      toast.success('Workout saved to your library');
      return true;
    } catch (error) {
      console.error('Error saving workout to library:', error);
      toast.error('Failed to save workout to your library');
      return false;
    }
  };
  
  return {
    workouts,
    workoutItems,
    isLoading,
    saveWorkout
  };
}
