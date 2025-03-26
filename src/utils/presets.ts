
import { WorkoutProgram, WorkoutSession, WorkoutWeek } from "@/types/workout";

// Local storage keys
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const SESSION_LIBRARY_KEY = "fitplan-session-library";

// Preset keys - for backward compatibility
const PROGRAM_PRESETS_KEY = "fitplan-program-presets";
const WEEK_PRESETS_KEY = "fitplan-week-presets";
const SESSION_PRESETS_KEY = "fitplan-session-presets";

// Save to library
export function addSessionToLibrary(session: WorkoutSession): void {
  const library = getSessionLibrary();
  library.push(session);
  localStorage.setItem(SESSION_LIBRARY_KEY, JSON.stringify(library));
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
export function getSessionLibrary(): WorkoutSession[] {
  const data = localStorage.getItem(SESSION_LIBRARY_KEY);
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
export function removeSessionFromLibrary(sessionId: string): void {
  const library = getSessionLibrary().filter(p => p.id !== sessionId);
  localStorage.setItem(SESSION_LIBRARY_KEY, JSON.stringify(library));
}

export function removeWeekFromLibrary(weekId: string): void {
  const library = getWeekLibrary().filter(p => p.id !== weekId);
  localStorage.setItem(WEEK_LIBRARY_KEY, JSON.stringify(library));
}

export function removeProgramFromLibrary(programId: string): void {
  const library = getProgramLibrary().filter(p => p.id !== programId);
  localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify(library));
}

// Preset system functions - for compatibility with existing code
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
