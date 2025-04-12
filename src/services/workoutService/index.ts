
// Export specific functions from each module to avoid naming conflicts
export {
  // From workoutOperations.ts
  addWorkout,
  updateWorkout,
  deleteWorkout,
  updateWorkoutPrice,
  hasUserPurchasedWorkout,
  getUserPurchasedWorkouts
} from './workoutOperations';

export {
  // From programOperations.ts
  createProgram,
  updateProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  updateProgramVisibility,
  cloneProgram,
  updateProgramPrice,
  hasUserPurchasedProgram,
  getUserPurchasedPrograms
} from './programOperations';

export {
  // From publicWorkouts.ts
  fetchPublicWorkouts,
  fetchPublicPrograms,
  fetchCreatorProfile
} from './publicWorkouts';

// From weekOperations.ts
export {
  addWeek,
  updateWeek,
  deleteWeek
} from './weekOperations';

// From exerciseOperations.ts
export {
  addExercise,
  updateExercise,
  deleteExercise
} from './exerciseOperations';

// From setOperations.ts
export {
  addSet,
  updateSet,
  deleteSet
} from './setOperations';

// From circuitOperations.ts
export {
  addCircuit,
  updateCircuit,
  deleteCircuit,
  addExerciseToCircuit,
  removeExerciseFromCircuit
} from './circuitOperations';
