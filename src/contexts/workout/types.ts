
import { Exercise as LibraryExercise } from '@/types/exercise';
import {
  WorkoutProgram,
  Workout,
  Exercise,
  WorkoutWeek,
  Circuit,
  Set,
} from "@/types/workout";

export interface WorkoutContextProps {
  program: WorkoutProgram | null;
  activeWorkoutId: string | null;
  activeWeekId: string | null;
  setActiveWorkoutId: (workoutId: string | null) => void;
  setActiveWeekId: (weekId: string | null) => void;
  setProgram: (program: WorkoutProgram | null) => void;
  addWorkout: (weekId: string) => string;
  addWeek: () => string;
  addCircuit: (workoutId: string) => void;
  addExercise: (workoutId: string, libraryExerciseId?: string) => void;
  addExerciseToWorkout: (workoutId: string) => void;
  duplicateExercise: (workoutId: string, exerciseId: string) => void;
  addSet: (workoutId: string, exerciseId: string) => void;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  deleteWorkout: (weekId: string, workoutId: string) => void;
  updateProgram: (updater: (draft: WorkoutProgram) => void) => void;
  updateWorkout: (workoutId: string, updater: (draft: Workout) => void) => void;
  updateWeek: (weekId: string, updater: (draft: WorkoutWeek) => void) => void;
  updateExercise: (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  getExerciseDetails: (exerciseId: string) => (Exercise & { libraryData?: LibraryExercise }) | null;
  moveWorkout: (workoutId: string, weekId: string, newWeekId: string) => void;
  moveWeek: (weekId: string, newIndex: number) => void;
  createCircuit: (workoutId: string) => void;
  createSuperset: (workoutId: string) => void;
  createEMOM: (workoutId: string) => void;
  createAMRAP: (workoutId: string) => void;
  createTabata: (workoutId: string) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  saveWorkoutToLibrary: (workoutId: string, name: string) => void;
  saveWeekToLibrary: (weekId: string, name: string) => void;
  saveProgramToLibrary: (name: string) => void;
  loadWorkoutFromLibrary: (workoutIdOrObj: string | Workout, weekId: string, dayNumber?: number) => void;
  loadWeekFromLibrary: (week: WorkoutWeek) => void;
  loadProgramFromLibrary: (program: WorkoutProgram) => void;
  getWorkoutLibrary: () => Workout[];
  getWeekLibrary: () => WorkoutWeek[];
  getProgramLibrary: () => WorkoutProgram[];
  removeWorkoutFromLibrary: (id: string) => void;
  removeWeekFromLibrary: (id: string) => void;
  removeProgramFromLibrary: (id: string) => void;
  updateWorkoutName: (workoutId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
}
