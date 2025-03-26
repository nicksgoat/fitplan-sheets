
import { WorkoutProgram, WorkoutSession, WorkoutWeek } from "@/types/workout";

// Local storage keys
const PROGRAM_PRESETS_KEY = "fitplan-program-presets";
const WEEK_PRESETS_KEY = "fitplan-week-presets";
const SESSION_PRESETS_KEY = "fitplan-session-presets";

// Save presets to local storage
export function saveSessionPreset(preset: WorkoutSession): void {
  const presets = getSessionPresets();
  presets.push(preset);
  localStorage.setItem(SESSION_PRESETS_KEY, JSON.stringify(presets));
}

export function saveWeekPreset(preset: WorkoutWeek): void {
  const presets = getWeekPresets();
  presets.push(preset);
  localStorage.setItem(WEEK_PRESETS_KEY, JSON.stringify(presets));
}

export function saveProgramPreset(preset: WorkoutProgram): void {
  const presets = getProgramPresets();
  presets.push(preset);
  localStorage.setItem(PROGRAM_PRESETS_KEY, JSON.stringify(presets));
}

// Get presets from local storage
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

// Delete presets
export function deleteSessionPreset(presetId: string): void {
  const presets = getSessionPresets().filter(p => p.id !== presetId);
  localStorage.setItem(SESSION_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteWeekPreset(presetId: string): void {
  const presets = getWeekPresets().filter(p => p.id !== presetId);
  localStorage.setItem(WEEK_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteProgramPreset(presetId: string): void {
  const presets = getProgramPresets().filter(p => p.id !== presetId);
  localStorage.setItem(PROGRAM_PRESETS_KEY, JSON.stringify(presets));
}
