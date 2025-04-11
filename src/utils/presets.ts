
import { v4 as uuidv4 } from 'uuid';
import { Exercise, Workout, WorkoutProgram, WorkoutWeek } from '@/types/workout';

// Create a library workout from exercises
export function createLibraryWorkout(name: string, exercises: Exercise[], options?: { price?: number, isPurchasable?: boolean }) {
  const workout: Workout = {
    id: uuidv4(),
    name: name,
    day: 1,
    exercises: exercises.map(e => ({
      ...e,
      id: uuidv4(),
      sets: e.sets.map(s => ({
        ...s,
        id: uuidv4(),
      })),
    })),
    circuits: [],
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  
  // Add pricing information if provided
  if (options?.price !== undefined) workout.price = options.price;
  if (options?.isPurchasable !== undefined) workout.isPurchasable = options.isPurchasable;
  
  return workout;
}

// Create a library week from workout IDs
export function createLibraryWeek(name: string, workoutIds: string[]) {
  return {
    id: uuidv4(),
    name: name,
    order: 0,
    workouts: [...workoutIds],
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
}

// Create a library program from workouts and weeks
export function createLibraryProgram(
  name: string, 
  workouts: Workout[], 
  weeks: WorkoutWeek[],
  options?: { price?: number, isPurchasable?: boolean, isPublic?: boolean }
) {
  const program: WorkoutProgram = {
    id: uuidv4(),
    name: name,
    workouts: workouts.map(w => ({
      ...w,
      id: uuidv4(),
      exercises: w.exercises.map(e => ({
        ...e,
        id: uuidv4(),
        sets: e.sets.map(s => ({
          ...s,
          id: uuidv4(),
        })),
      })),
      circuits: w.circuits.map(c => ({
        ...c,
        id: uuidv4(),
      })),
    })),
    weeks: weeks.map((week, index) => ({
      ...week,
      id: uuidv4(),
      order: index,
      workouts: [...week.workouts],
    })),
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isPublic: options?.isPublic ?? false,
  };
  
  // Add pricing information if provided
  if (options?.price !== undefined) program.price = options.price;
  if (options?.isPurchasable !== undefined) program.isPurchasable = options.isPurchasable;
  
  return program;
}
