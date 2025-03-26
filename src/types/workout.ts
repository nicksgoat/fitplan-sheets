
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

export interface WorkoutSession {
  id: string;
  name: string;
  day: number;
  exercises: Exercise[];
  circuits: Circuit[];
  weekId?: string; // New field to associate session with a week
}

export interface WorkoutWeek {
  id: string;
  name: string;
  order: number;
  sessions: string[]; // Array of session IDs
}

export interface WorkoutProgram {
  id: string;
  name: string;
  sessions: WorkoutSession[];
  weeks: WorkoutWeek[]; // New weeks array
}

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'rpe' | 'rest' | 'notes';
export type ExerciseCellType = 'name' | 'notes';
export type SetCellType = 'reps' | 'weight' | 'rpe' | 'rest';

export type WorkoutType = 'standard' | 'circuit' | 'superset' | 'emom' | 'amrap' | 'tabata';
