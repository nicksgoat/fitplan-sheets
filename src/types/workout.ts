
export interface Set {
  id: string;
  reps: string;
  weight: string;
  rpe: string;
  rest: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes: string;
  isCircuit?: boolean;
  isInCircuit?: boolean;
  circuitId?: string;
  circuitOrder?: number;
  isGroup?: boolean;
  groupId?: string;
}

export interface Circuit {
  id: string;
  name: string;
  exercises: string[]; // Array of exercise IDs
  rounds?: string;
  restBetweenExercises?: string;
  restBetweenRounds?: string;
}

export interface WorkoutWeek {
  id: string;
  weekNumber: number;
  name: string;
  sessions: WorkoutSession[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  day: number;
  exercises: Exercise[];
  circuits: Circuit[];
  weekId?: string; // Reference to parent week
}

export interface WorkoutProgram {
  id: string;
  name: string;
  image?: string;
  weeks: WorkoutWeek[]; // Instead of sessions directly
  sessions: WorkoutSession[]; // Keep for backward compatibility
  // Add settings
  settings?: WorkoutSettings;
}

export interface WorkoutSettings {
  weightUnit?: 'lbs' | 'kgs';
  effortUnit?: 'rpe' | 'rir';
  showWeight?: boolean;
  showEffort?: boolean;
  showRest?: boolean;
  showNotes?: boolean;
}

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'rpe' | 'rest' | 'notes';
export type ExerciseCellType = 'name' | 'notes';
export type SetCellType = 'reps' | 'weight' | 'rpe' | 'rest';

export type WorkoutType = 'standard' | 'circuit' | 'superset' | 'emom' | 'amrap' | 'tabata';
