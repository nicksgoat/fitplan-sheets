
import { WorkoutProgram, WorkoutSession, WorkoutWeek } from "@/types/workout";

// Local storage keys
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const SESSION_LIBRARY_KEY = "fitplan-session-library";

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
