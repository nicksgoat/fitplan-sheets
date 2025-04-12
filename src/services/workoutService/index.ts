
// Import all workout service functions from their respective files
import * as programOps from './programOperations';
import * as weekOps from './weekOperations';
import * as workoutOps from './workoutOperations';
import * as exerciseOps from './exerciseOperations';
import * as setOps from './setOperations';
import * as circuitOps from './circuitOperations';
import * as mappers from './mappers';

// Export all workout service functions, resolving naming conflicts
export const {
  // programOperations exports (excluding conflicting functions)
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  updateProgramVisibility,
  cloneProgram,
  updateProgramPrice,
  hasUserPurchasedProgram,
  getUserPurchasedPrograms
} = programOps;

export const {
  // workoutOperations exports
  addWorkout,
  updateWorkout,
  deleteWorkout,
  updateWorkoutPrice,
  hasUserPurchasedWorkout,
  getUserPurchasedWorkouts
} = workoutOps;

export const {
  // weekOperations exports
  addWeek,
  updateWeek,
  deleteWeek
} = weekOps;

export const {
  // exerciseOperations exports
  addExercise,
  updateExercise,
  deleteExercise
} = exerciseOps;

export const {
  // setOperations exports
  addSet,
  updateSet,
  deleteSet
} = setOps;

export const {
  // circuitOperations exports
  addCircuit,
  updateCircuit,
  deleteCircuit,
  addExerciseToCircuit,
  removeExerciseFromCircuit
} = circuitOps;

// Export mappers directly
export * from './mappers';
