import { 
  WorkoutProgram, 
  WorkoutSession, 
  WorkoutWeek,
  LibraryItemType,
  ExerciseLibraryItem,
  WorkoutLibraryItem,
  WeekLibraryItem, 
  ProgramLibraryItem,
  Exercise
} from "@/types/workout";

// Library storage keys
const EXERCISE_LIBRARY_KEY = "fitplan-exercise-library";
const WORKOUT_LIBRARY_KEY = "fitplan-workout-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";

// Legacy storage keys - for backward compatibility
const SESSION_LIBRARY_KEY = "fitplan-workout-library"; // Old name
const PROGRAM_PRESETS_KEY = "fitplan-program-presets";
const WEEK_PRESETS_KEY = "fitplan-week-presets";
const SESSION_PRESETS_KEY = "fitplan-session-presets";

// Get timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Save to exercise library
export function addExerciseToLibrary(exercise: Exercise): void {
  const library = getExerciseLibrary();
  const libraryItem: ExerciseLibraryItem = {
    id: exercise.id,
    name: exercise.name,
    type: 'exercise',
    tags: [],
    createdAt: getTimestamp(),
    data: exercise
  };
  library.push(libraryItem);
  localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(library));
}

// Save to workout library (renamed from session)
export function addWorkoutToLibrary(workout: WorkoutSession): void {
  const library = getWorkoutLibrary();
  const libraryItem: WorkoutLibraryItem = {
    id: workout.id,
    name: workout.name,
    type: 'workout',
    tags: workout.tags || [],
    createdAt: workout.createdAt || getTimestamp(),
    updatedAt: workout.updatedAt,
    data: workout
  };
  library.push(libraryItem);
  localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
}

// Save to week library
export function addWeekToLibrary(week: WorkoutWeek): void {
  const library = getWeekLibrary();
  const libraryItem: WeekLibraryItem = {
    id: week.id,
    name: week.name,
    type: 'week',
    tags: week.tags || [],
    createdAt: week.createdAt || getTimestamp(),
    updatedAt: week.updatedAt,
    data: week
  };
  library.push(libraryItem);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

// Save to program library
export function addProgramToLibrary(program: WorkoutProgram): void {
  const library = getProgramLibrary();
  const libraryItem: ProgramLibraryItem = {
    id: program.id,
    name: program.name,
    type: 'program',
    tags: program.tags || [],
    createdAt: program.createdAt || getTimestamp(),
    updatedAt: program.updatedAt,
    data: program
  };
  library.push(libraryItem);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Get from library
export function getExerciseLibrary(): ExerciseLibraryItem[] {
  const data = localStorage.getItem(EXERCISE_LIBRARY_KEY);
  return data ? JSON.parse(data) : [];
}

export function getWorkoutLibrary(): WorkoutLibraryItem[] {
  const data = localStorage.getItem(WORKOUT_LIBRARY_KEY);
  
  // Handle legacy data
  if (!data && localStorage.getItem(SESSION_LIBRARY_KEY)) {
    const legacyData = localStorage.getItem(SESSION_LIBRARY_KEY);
    const sessions = legacyData ? JSON.parse(legacyData) : [];
    
    // Convert legacy sessions to the new format
    const workouts: WorkoutLibraryItem[] = sessions.map((session: WorkoutSession) => ({
      id: session.id,
      name: session.name,
      type: 'workout',
      tags: [],
      createdAt: getTimestamp(),
      data: session
    }));
    
    // Save the converted data
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(workouts));
    return workouts;
  }
  
  return data ? JSON.parse(data) : [];
}

export function getWeekLibrary(): WeekLibraryItem[] {
  const data = localStorage.getItem(WEEK_LIBRARY_KEY);
  
  // Handle legacy data
  if (!data && localStorage.getItem(WEEK_LIBRARY_KEY)) {
    const legacyData = localStorage.getItem(WEEK_LIBRARY_KEY);
    const weeks = legacyData ? JSON.parse(legacyData) : [];
    
    // Convert legacy weeks to the new format
    const weekItems: WeekLibraryItem[] = weeks.map((week: WorkoutWeek) => ({
      id: week.id,
      name: week.name,
      type: 'week',
      tags: [],
      createdAt: getTimestamp(),
      data: week
    }));
    
    // Save the converted data
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(weekItems));
    return weekItems;
  }
  
  return data ? JSON.parse(data) : [];
}

export function getProgramLibrary(): ProgramLibraryItem[] {
  const data = localStorage.getItem(PROGRAM_LIBRARY_KEY);
  
  // Handle legacy data
  if (!data && localStorage.getItem(PROGRAM_LIBRARY_KEY)) {
    const legacyData = localStorage.getItem(PROGRAM_LIBRARY_KEY);
    const programs = legacyData ? JSON.parse(legacyData) : [];
    
    // Convert legacy programs to the new format
    const programItems: ProgramLibraryItem[] = programs.map((program: WorkoutProgram) => ({
      id: program.id,
      name: program.name,
      type: 'program',
      tags: [],
      createdAt: getTimestamp(),
      data: program
    }));
    
    // Save the converted data
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(programItems));
    return programItems;
  }
  
  return data ? JSON.parse(data) : [];
}

// Remove from library
export function removeExerciseFromLibrary(exerciseId: string): void {
  const library = getExerciseLibrary().filter(item => item.id !== exerciseId);
  localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(library));
}

export function removeWorkoutFromLibrary(workoutId: string): void {
  const library = getWorkoutLibrary().filter(item => item.id !== workoutId);
  localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
}

export function removeWeekFromLibrary(weekId: string): void {
  const library = getWeekLibrary().filter(item => item.id !== weekId);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

export function removeProgramFromLibrary(programId: string): void {
  const library = getProgramLibrary().filter(item => item.id !== programId);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Update library items
export function updateExerciseInLibrary(exercise: Exercise): void {
  const library = getExerciseLibrary();
  const index = library.findIndex(item => item.id === exercise.id);
  
  if (index !== -1) {
    library[index] = {
      ...library[index],
      name: exercise.name,
      updatedAt: getTimestamp(),
      data: exercise
    };
    localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(library));
  }
}

export function updateWorkoutInLibrary(workout: WorkoutSession): void {
  const library = getWorkoutLibrary();
  const index = library.findIndex(item => item.id === workout.id);
  
  if (index !== -1) {
    library[index] = {
      ...library[index],
      name: workout.name,
      tags: workout.tags || library[index].tags,
      updatedAt: getTimestamp(),
      data: workout
    };
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
  }
}

export function updateWeekInLibrary(week: WorkoutWeek): void {
  const library = getWeekLibrary();
  const index = library.findIndex(item => item.id === week.id);
  
  if (index !== -1) {
    library[index] = {
      ...library[index],
      name: week.name,
      tags: week.tags || library[index].tags,
      updatedAt: getTimestamp(),
      data: week
    };
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
  }
}

export function updateProgramInLibrary(program: WorkoutProgram): void {
  const library = getProgramLibrary();
  const index = library.findIndex(item => item.id === program.id);
  
  if (index !== -1) {
    library[index] = {
      ...library[index],
      name: program.name,
      tags: program.tags || library[index].tags,
      updatedAt: getTimestamp(),
      data: program
    };
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
  }
}

// Compatibility functions - maintain old names for backward compatibility
export function getSessionLibrary(): WorkoutSession[] {
  return getWorkoutLibrary().map(item => item.data);
}

export function getWeekLibrary(): WeekLibraryItem[] {
  const data = localStorage.getItem(WEEK_LIBRARY_KEY);
  
  // Handle legacy data
  if (!data && localStorage.getItem(WEEK_LIBRARY_KEY)) {
    const legacyData = localStorage.getItem(WEEK_LIBRARY_KEY);
    const weeks = legacyData ? JSON.parse(legacyData) : [];
    
    // Convert legacy weeks to the new format
    const weekItems: WeekLibraryItem[] = weeks.map((week: WorkoutWeek) => ({
      id: week.id,
      name: week.name,
      type: 'week',
      tags: [],
      createdAt: getTimestamp(),
      data: week
    }));
    
    // Save the converted data
    localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(weekItems));
    return weekItems;
  }
  
  return data ? JSON.parse(data) : [];
}

export function getProgramLibrary(): ProgramLibraryItem[] {
  const data = localStorage.getItem(PROGRAM_LIBRARY_KEY);
  
  // Handle legacy data
  if (!data && localStorage.getItem(PROGRAM_LIBRARY_KEY)) {
    const legacyData = localStorage.getItem(PROGRAM_LIBRARY_KEY);
    const programs = legacyData ? JSON.parse(legacyData) : [];
    
    // Convert legacy programs to the new format
    const programItems: ProgramLibraryItem[] = programs.map((program: WorkoutProgram) => ({
      id: program.id,
      name: program.name,
      type: 'program',
      tags: [],
      createdAt: getTimestamp(),
      data: program
    }));
    
    // Save the converted data
    localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(programItems));
    return programItems;
  }
  
  return data ? JSON.parse(data) : [];
}

export function addSessionToLibrary(session: WorkoutSession): void {
  addWorkoutToLibrary(session);
}

export function removeSessionFromLibrary(sessionId: string): void {
  removeWorkoutFromLibrary(sessionId);
}

// Preset system functions (legacy support)
export function saveSessionPreset(session: WorkoutSession): void {
  const presets = getSessionPresets();
  presets.push(session);
  localStorage.setItem(SESSION_PRESETS_KEY, JSON.stringify(presets));
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

export function getSessionPresets(): WorkoutSession[] {
  const data = localStorage.getItem(SESSION_PRESETS_KEY);
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

export function deleteSessionPreset(sessionId: string): void {
  const presets = getSessionPresets().filter(p => p.id !== sessionId);
  localStorage.setItem(SESSION_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteWeekPreset(weekId: string): void {
  const presets = getWeekPresets().filter(p => p.id !== weekId);
  localStorage.setItem(WEEK_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteProgramPreset(programId: string): void {
  const presets = getProgramPresets().filter(p => p.id !== programId);
  localStorage.setItem(PROGRAM_PRESETS_KEY, JSON.stringify(presets));
}

// Data validation utilities
export function validateWorkout(workout: WorkoutSession): boolean {
  if (!workout || !workout.id || !workout.name) return false;
  if (!Array.isArray(workout.exercises)) return false;
  return true;
}

export function validateWeek(week: WorkoutWeek): boolean {
  if (!week || !week.id || !week.name) return false;
  if (!Array.isArray(week.sessions)) return false;
  return true;
}

export function validateProgram(program: WorkoutProgram): boolean {
  if (!program || !program.id || !program.name) return false;
  if (!Array.isArray(program.weeks) || !Array.isArray(program.sessions)) return false;
  return true;
}

// Helper to get all library items
export function getAllLibraryItems(): LibraryItemType[] {
  return [
    ...getExerciseLibrary(),
    ...getWorkoutLibrary(),
    ...getWeekLibrary(),
    ...getProgramLibrary()
  ];
}

// Search library
export function searchLibrary(query: string, type?: 'exercise' | 'workout' | 'week' | 'program'): LibraryItemType[] {
  const allItems = getAllLibraryItems();
  const filteredByType = type ? allItems.filter(item => item.type === type) : allItems;
  
  if (!query) return filteredByType;
  
  const lowerQuery = query.toLowerCase();
  return filteredByType.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) || 
    (item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
}
