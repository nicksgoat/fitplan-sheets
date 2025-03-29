
import { Exercise as WorkoutExercise, Set } from '@/types/workout';
import { Exercise as LibraryExercise } from '@/types/exercise';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert a library exercise to a workout exercise
 */
export function libraryToWorkoutExercise(
  libraryExercise: LibraryExercise,
  existingExercise?: Partial<WorkoutExercise>
): WorkoutExercise {
  // Create a default set if none exist
  const defaultSet: Set = {
    id: uuidv4(),
    reps: '',
    weight: '',
    intensity: '',
    rest: ''
  };

  return {
    id: existingExercise?.id || uuidv4(),
    name: libraryExercise.name,
    sets: existingExercise?.sets || [defaultSet],
    notes: existingExercise?.notes || libraryExercise.description || '',
    isCircuit: existingExercise?.isCircuit || false,
    isInCircuit: existingExercise?.isInCircuit || false,
    circuitId: existingExercise?.circuitId,
    circuitOrder: existingExercise?.circuitOrder,
    isGroup: existingExercise?.isGroup || false,
    groupId: existingExercise?.groupId,
    // Map library exercise properties to workout exercise
    repType: existingExercise?.repType || 'fixed',
    intensityType: existingExercise?.intensityType || 'rpe',
    weightType: existingExercise?.weightType || 'pounds',
    // Store reference to the original library exercise for enrichment
    libraryExerciseId: libraryExercise.id
  };
}

/**
 * Enrich a workout exercise with data from a library exercise
 */
export function enrichWorkoutExercise(
  workoutExercise: WorkoutExercise,
  libraryExercise: LibraryExercise
): WorkoutExercise {
  return {
    ...workoutExercise,
    // We only update the name and notes if they're empty
    name: workoutExercise.name || libraryExercise.name,
    notes: workoutExercise.notes || libraryExercise.description || '',
    // Store reference to the library exercise
    libraryExerciseId: libraryExercise.id
  };
}

/**
 * Get default exercise configuration based on category
 */
export function getDefaultExerciseConfig(category?: string): {
  repType: 'fixed' | 'range' | 'time';
  weightType: 'pounds' | 'kilos' | 'distance-m';
  intensityType: 'rpe' | 'percent' | 'absolute';
} {
  // Default configurations based on exercise category
  switch (category?.toLowerCase()) {
    case 'cardio':
      return {
        repType: 'time',
        weightType: 'distance-m',
        intensityType: 'absolute'
      };
    case 'bodyweight':
      return {
        repType: 'range',
        weightType: 'pounds', // Often bodyweight exercises don't use weights
        intensityType: 'rpe'
      };
    default:
      return {
        repType: 'fixed',
        weightType: 'pounds',
        intensityType: 'rpe'
      };
  }
}
