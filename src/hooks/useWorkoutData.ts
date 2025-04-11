
// Export specific hooks from their respective files to avoid naming conflicts
import { useAddWorkout, useUpdateWorkout, useDeleteWorkout } from './workout/useWorkoutOperations';
import { 
  usePrograms, 
  useProgram, 
  useCreateProgram, 
  useUpdateProgram, 
  useDeleteProgram, 
  useUpdateProgramVisibility, 
  useCloneProgram,
  useUpdateProgramPrice,
  useHasUserPurchasedProgram,
  useUserPurchasedPrograms 
} from './workout/useProgramOperations';
import { useAddWeek, useUpdateWeek, useDeleteWeek } from './workout/useWeekOperations';
import { 
  useAddExercise, 
  useUpdateExercise, 
  useDeleteExercise 
} from './workout/useExerciseOperations';
import { useAddSet, useUpdateSet, useDeleteSet } from './workout/useSetOperations';
import { 
  useAddCircuit, 
  useUpdateCircuit, 
  useDeleteCircuit, 
  useAddExerciseToCircuit, 
  useRemoveExerciseFromCircuit 
} from './workout/useCircuitOperations';

// Export all workout hooks - using explicit exports to avoid conflicts
export {
  // Program operations
  usePrograms, 
  useProgram, 
  useCreateProgram, 
  useUpdateProgram, 
  useDeleteProgram, 
  useUpdateProgramVisibility, 
  useCloneProgram,
  useUpdateProgramPrice,
  useHasUserPurchasedProgram,
  useUserPurchasedPrograms,
  
  // Week operations
  useAddWeek,
  useUpdateWeek,
  useDeleteWeek,
  
  // Workout operations
  useAddWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
  useUpdateWorkoutPrice,
  useHasUserPurchasedWorkout,
  useUserPurchasedWorkouts,
  
  // Exercise operations
  useAddExercise,
  useUpdateExercise,
  useDeleteExercise,
  
  // Set operations
  useAddSet,
  useUpdateSet,
  useDeleteSet,
  
  // Circuit operations
  useAddCircuit,
  useUpdateCircuit,
  useDeleteCircuit,
  useAddExerciseToCircuit,
  useRemoveExerciseFromCircuit
};

// Import the types that aren't directly imported above
import { 
  useUpdateWorkoutPrice, 
  useHasUserPurchasedWorkout, 
  useUserPurchasedWorkouts 
} from './workout/useWorkoutOperations';
