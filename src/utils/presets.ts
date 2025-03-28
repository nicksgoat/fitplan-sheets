
import { WorkoutProgram, Workout, WorkoutWeek } from "@/types/workout";

// Local storage keys
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const WORKOUT_LIBRARY_KEY = "fitplan-workout-library"; // Updated name

// Preset keys - for backward compatibility
const PROGRAM_PRESETS_KEY = "fitplan-program-presets";
const WEEK_PRESETS_KEY = "fitplan-week-presets";
const WORKOUT_PRESETS_KEY = "fitplan-workout-presets";

// Save to library
export function addWorkoutToLibrary(workout: Workout): void {
  const library = getWorkoutLibrary();
  library.push(workout);
  localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(library));
}

export function addWeekToLibrary(week: WorkoutWeek): void {
  const library = getWeekLibrary();
  library.push(week);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

export function addProgramToLibrary(program: WorkoutProgram): void {
  const library = getProgramLibrary();
  library.push(program);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Get from library
export function getWorkoutLibrary(): Workout[] {
  const data = localStorage.getItem(WORKOUT_LIBRARY_KEY);
  return data ? JSON.parse(data) : [];
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
