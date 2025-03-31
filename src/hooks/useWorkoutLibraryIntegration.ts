
import { useEffect, useState } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useExercise } from '@/hooks/useExerciseLibrary';
import { Exercise as LibraryExercise } from '@/types/exercise';
import { Exercise as WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';

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
