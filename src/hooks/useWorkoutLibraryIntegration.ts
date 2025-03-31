
import { useEffect, useState } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useExercise } from '@/hooks/useExerciseLibrary';
import { Exercise as LibraryExercise } from '@/types/exercise';
import { Exercise as WorkoutExercise, Workout } from '@/types/workout';
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

/**
 * Deep validation of a workout loaded from the library to ensure it has all necessary data
 * This is a more thorough validation than what we had before
 */
export function validateWorkoutData(workout: any): boolean {
  if (!workout) {
    console.error('Workout is null or undefined');
    return false;
  }
  
  // Check for minimum expected properties
  if (!workout.id || !workout.name || !Array.isArray(workout.exercises)) {
    console.error('Workout is missing essential properties', workout);
    return false;
  }
  
  // Check exercises deeply
  for (const exercise of workout.exercises) {
    if (!exercise.id || !exercise.name) {
      console.error('Exercise is missing essential properties', exercise);
      return false;
    }
    
    // Ensure sets array exists
    if (!Array.isArray(exercise.sets)) {
      console.error('Exercise sets is not an array', exercise);
      return false;
    }
    
    // Check each set
    for (const set of exercise.sets) {
      if (!set.id) {
        console.error('Set is missing id', set);
        return false;
      }
      
      // Ensure all set properties exist, even if empty strings
      if (typeof set.reps !== 'string' || 
          typeof set.weight !== 'string' || 
          typeof set.intensity !== 'string' || 
          typeof set.rest !== 'string') {
        console.error('Set is missing required properties', set);
        return false;
      }
    }
    
    // Ensure notes exists even if empty
    if (typeof exercise.notes !== 'string') {
      console.error('Exercise notes is missing', exercise);
      return false;
    }
  }
  
  // Ensure circuits array exists
  if (!Array.isArray(workout.circuits)) {
    console.error('Workout circuits is not an array', workout);
    return false;
  }
  
  return true;
}

/**
 * Compare a saved workout from library with current workout
 * This helps detect if the workout was properly loaded with all data
 */
export function checkWorkoutLoaded(libraryWorkout: Workout, currentWorkout: Workout | null): boolean {
  if (!currentWorkout) {
    console.error('Current workout is null, loading failed');
    return false;
  }
  
  // Check if exercises match in number
  if (libraryWorkout.exercises.length !== currentWorkout.exercises.length) {
    console.error('Exercise count mismatch', {
      libraryCount: libraryWorkout.exercises.length,
      currentCount: currentWorkout.exercises.length
    });
    return false;
  }
  
  // Check if exercises have the same names - a basic check
  const libraryNames = libraryWorkout.exercises.map(e => e.name.toLowerCase().trim());
  const currentNames = currentWorkout.exercises.map(e => e.name.toLowerCase().trim());
  
  if (JSON.stringify(libraryNames) !== JSON.stringify(currentNames)) {
    console.error('Exercise names mismatch', {
      libraryNames,
      currentNames
    });
    return false;
  }
  
  // Check if the first exercise has the same number of sets
  if (libraryWorkout.exercises[0] && currentWorkout.exercises[0]) {
    if (libraryWorkout.exercises[0].sets.length !== currentWorkout.exercises[0].sets.length) {
      console.error('First exercise sets count mismatch', {
        librarySets: libraryWorkout.exercises[0].sets.length,
        currentSets: currentWorkout.exercises[0].sets.length
      });
      return false;
    }
  }
  
  return true;
}

/**
 * Helper function to ensure workout has all required data structures
 * even if some parts are empty/default
 */
export function ensureCompleteWorkoutStructure(workout: Workout): Workout {
  // Create a deep copy to avoid reference issues
  const completeWorkout = JSON.parse(JSON.stringify(workout));
  
  // Ensure circuits exists
  if (!Array.isArray(completeWorkout.circuits)) {
    completeWorkout.circuits = [];
  }
  
  // Ensure each exercise has complete structure
  completeWorkout.exercises = completeWorkout.exercises.map((exercise: WorkoutExercise) => {
    return {
      id: exercise.id,
      name: exercise.name || "",
      sets: Array.isArray(exercise.sets) ? exercise.sets.map(set => ({
        id: set.id,
        reps: set.reps || "",
        weight: set.weight || "",
        intensity: set.intensity || "",
        rest: set.rest || "",
        intensityType: set.intensityType,
        weightType: set.weightType
      })) : [],
      notes: exercise.notes || "",
      libraryExerciseId: exercise.libraryExerciseId,
      repType: exercise.repType,
      intensityType: exercise.intensityType,
      weightType: exercise.weightType,
      isCircuit: !!exercise.isCircuit,
      isInCircuit: !!exercise.isInCircuit,
      circuitId: exercise.circuitId,
      circuitOrder: exercise.circuitOrder,
      isGroup: !!exercise.isGroup,
      groupId: exercise.groupId
    };
  });
  
  return completeWorkout;
}
