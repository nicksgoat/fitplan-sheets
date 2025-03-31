import { WorkoutProgram, Workout, WorkoutWeek } from "@/types/workout";
import { Exercise as LibraryExercise } from "@/types/exercise";
import { v4 as uuidv4 } from "uuid";

// Local storage keys
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const WORKOUT_LIBRARY_KEY = "fitplan-workout-library";

// Preset keys - for backward compatibility
const PROGRAM_PRESETS_KEY = "fitplan-program-presets";
const WEEK_PRESETS_KEY = "fitplan-week-presets";
const WORKOUT_PRESETS_KEY = "fitplan-workout-presets";

// Save to library
export function addWorkoutToLibrary(workout: Workout): void {
  try {
    // Create a deep copy to avoid reference issues
    const workoutToSave = JSON.parse(JSON.stringify(workout));
    
    // Add metadata for tracking
    workoutToSave.savedAt = new Date().toISOString();
    workoutToSave.lastModified = new Date().toISOString();
    
    // Ensure all exercises have consistent data
    workoutToSave.exercises = workoutToSave.exercises.map((exercise: any) => {
      // If an exercise already has a libraryExerciseId, keep it
      if (!exercise.libraryExerciseId) {
        // In the future, we'd look up in the Supabase database to find matching exercises
        exercise.libraryExerciseId = null;
      }
      
      // Ensure all properties exist to prevent loading issues
      return {
        ...exercise,
        sets: exercise.sets.map((set: any) => ({
          id: set.id || uuidv4(),
          reps: set.reps || "",
          weight: set.weight || "",
          intensity: set.intensity || "",
          rest: set.rest || "",
          intensityType: set.intensityType || undefined,
          weightType: set.weightType || undefined
        })),
        notes: exercise.notes || "",
        repType: exercise.repType || undefined,
        intensityType: exercise.intensityType || undefined,
        weightType: exercise.weightType || undefined,
        isCircuit: !!exercise.isCircuit,
        isInCircuit: !!exercise.isInCircuit,
        circuitId: exercise.circuitId || undefined,
        circuitOrder: exercise.circuitOrder || undefined,
        isGroup: !!exercise.isGroup,
        groupId: exercise.groupId || undefined
      };
    });
    
    console.log('Saving workout to library:', workoutToSave);
    
    const library = getWorkoutLibrary();
    library.push(workoutToSave);
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
  } catch (error) {
    console.error('Error saving workout to library:', error);
    throw new Error('Failed to save workout to library');
  }
}

export function addWeekToLibrary(week: WorkoutWeek): void {
  // Create a deep copy
  const weekToSave = JSON.parse(JSON.stringify(week));
  
  // Add metadata
  weekToSave.savedAt = new Date().toISOString();
  weekToSave.lastModified = new Date().toISOString();
  
  const library = getWeekLibrary();
  library.push(weekToSave);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

export function addProgramToLibrary(program: WorkoutProgram): void {
  // Create a deep copy
  const programToSave = JSON.parse(JSON.stringify(program));
  
  // Add metadata
  programToSave.savedAt = new Date().toISOString();
  programToSave.lastModified = new Date().toISOString();
  
  const library = getProgramLibrary();
  library.push(programToSave);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Get from library
export function getWorkoutLibrary(): Workout[] {
  try {
    const data = localStorage.getItem(WORKOUT_LIBRARY_KEY);
    const workouts = data ? JSON.parse(data) : [];
    return workouts;
  } catch (error) {
    console.error('Error retrieving workout library:', error);
    return [];
  }
}

export function getWeekLibrary(): WorkoutWeek[] {
  const data = localStorage.getItem(WEEK_LIBRARY_KEY);
  return data ? JSON.parse(data) : [];
}

export function getProgramLibrary(): WorkoutProgram[] {
  const data = localStorage.getItem(PROGRAM_LIBRARY_KEY);
  return data ? JSON.parse(data) : [];
}

// Remove from library
export function removeWorkoutFromLibrary(workoutId: string): void {
  const library = getWorkoutLibrary().filter(p => p.id !== workoutId);
  localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
}

export function removeWeekFromLibrary(weekId: string): void {
  const library = getWeekLibrary().filter(p => p.id !== weekId);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

export function removeProgramFromLibrary(programId: string): void {
  const library = getProgramLibrary().filter(p => p.id !== programId);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Update item in library
export function updateWorkoutInLibrary(workout: Workout): void {
  try {
    const library = getWorkoutLibrary();
    const index = library.findIndex(w => w.id === workout.id);
    
    if (index !== -1) {
      // Create a deep copy
      const updatedWorkout = JSON.parse(JSON.stringify(workout));
      updatedWorkout.lastModified = new Date().toISOString();
      
      // Ensure all exercises have consistent data similar to addWorkoutToLibrary
      updatedWorkout.exercises = updatedWorkout.exercises.map((exercise: any) => {
        return {
          ...exercise,
          sets: exercise.sets.map((set: any) => ({
            id: set.id || uuidv4(),
            reps: set.reps || "",
            weight: set.weight || "",
            intensity: set.intensity || "",
            rest: set.rest || "",
            intensityType: set.intensityType || undefined,
            weightType: set.weightType || undefined
          })),
          notes: exercise.notes || "",
          repType: exercise.repType || undefined,
          intensityType: exercise.intensityType || undefined,
          weightType: exercise.weightType || undefined,
          isCircuit: !!exercise.isCircuit,
          isInCircuit: !!exercise.isInCircuit,
          circuitId: exercise.circuitId || undefined,
          circuitOrder: exercise.circuitOrder || undefined,
          isGroup: !!exercise.isGroup,
          groupId: exercise.groupId || undefined
        };
      });
      
      library[index] = updatedWorkout;
      localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
    }
  } catch (error) {
    console.error('Error updating workout in library:', error);
  }
}

export function updateWeekInLibrary(week: WorkoutWeek): void {
  const library = getWeekLibrary();
  const index = library.findIndex(w => w.id === week.id);
  
  if (index !== -1) {
    // Create a deep copy
    const updatedWeek = JSON.parse(JSON.stringify(week));
    updatedWeek.lastModified = new Date().toISOString();
    
    library[index] = updatedWeek;
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
  }
}

export function updateProgramInLibrary(program: WorkoutProgram): void {
  const library = getProgramLibrary();
  const index = library.findIndex(p => p.id === program.id);
  
  if (index !== -1) {
    // Create a deep copy
    const updatedProgram = JSON.parse(JSON.stringify(program));
    updatedProgram.lastModified = new Date().toISOString();
    
    library[index] = updatedProgram;
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
  }
}

// Compatibility functions - maintain old names for backward compatibility
export function getSessionLibrary(): Workout[] {
  return getWorkoutLibrary();
}

export function addSessionToLibrary(workout: Workout): void {
  addWorkoutToLibrary(workout);
}

export function removeSessionFromLibrary(workoutId: string): void {
  removeWorkoutFromLibrary(workoutId);
}

// Preset system functions - for compatibility with existing code
export function saveWorkoutPreset(workout: Workout): void {
  const presets = getWorkoutPresets();
  presets.push(workout);
  localStorage.setItem(WORKOUT_PRESETS_KEY, JSON.stringify(presets));
}

export function saveWeekPreset(week: WorkoutWeek): void {
  const presets = getWeekPresets();
  presets.push(week);
  localStorage.setItem(WEEK_PRESETS_KEY, JSON.stringify(presets));
}

export function saveProgramPreset(program: WorkoutProgram): void {
  const presets = getProgramPresets();
  presets.push(program);
  localStorage.setItem(PROGRAM_PRESETS_KEY, JSON.stringify(program));
}

export function getWorkoutPresets(): Workout[] {
  const data = localStorage.getItem(WORKOUT_PRESETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getWeekPresets(): WorkoutWeek[] {
  const data = localStorage.getItem(WEEK_PRESETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getProgramPresets(): WorkoutProgram[] {
  const data = localStorage.getItem(PROGRAM_PRESETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteWorkoutPreset(workoutId: string): void {
  const presets = getWorkoutPresets().filter(p => p.id !== workoutId);
  localStorage.setItem(WORKOUT_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteWeekPreset(weekId: string): void {
  const presets = getWeekPresets().filter(p => p.id !== weekId);
  localStorage.setItem(WEEK_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteProgramPreset(programId: string): void {
  const presets = getProgramPresets().filter(p => p.id !== programId);
  localStorage.setItem(PROGRAM_PRESETS_KEY, JSON.stringify(presets));
}

// Additional backwards compatibility
export function saveSessionPreset(workout: Workout): void {
  saveWorkoutPreset(workout);
}

export function getSessionPresets(): Workout[] {
  return getWorkoutPresets();
}

export function deleteSessionPreset(workoutId: string): void {
  deleteWorkoutPreset(workoutId);
}

// Functions to create new workout library items with proper structure
export function createLibraryWorkout(name: string, exercises: any[] = []): Workout {
  return {
    id: uuidv4(),
    name,
    day: 1,
    exercises: exercises.map(exercise => ({
      ...exercise,
      id: uuidv4(),
      sets: (exercise.sets || [{ reps: '', weight: '', intensity: '', rest: '' }]).map((set: any) => ({
        ...set,
        id: uuidv4()
      }))
    })),
    circuits: [],
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
}

export function createLibraryWeek(name: string, workouts: string[] = []): WorkoutWeek {
  return {
    id: uuidv4(),
    name,
    order: 0,
    workouts,
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
}

export function createLibraryProgram(name: string, workouts: Workout[] = [], weeks: WorkoutWeek[] = []): WorkoutProgram {
  return {
    id: uuidv4(),
    name,
    workouts,
    weeks,
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
}
