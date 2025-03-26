
export interface Set {
  id: string;
  reps: string;
  weight: string;
  rpe: string;
  rest: string;
  isCompleted?: boolean;
  actualReps?: string;
  actualWeight?: string;
  notes?: string;
  timestamp?: string;
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
  // New fields for exercise metadata
  exerciseType?: 'strength' | 'cardio' | 'mobility' | 'other';
  targetMuscles?: string[];
  equipment?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
}

export interface Circuit {
  id: string;
  name: string;
  exercises: string[]; // Array of exercise IDs
  rounds?: string;
  restBetweenExercises?: string;
  restBetweenRounds?: string;
  circuitType?: 'standard' | 'superset' | 'emom' | 'amrap' | 'tabata';
  timeLimit?: string; // for EMOM, AMRAP, Tabata
}

export interface WorkoutSession {
  id: string;
  name: string;
  day: number;
  exercises: Exercise[];
  circuits: Circuit[];
  weekId?: string;
  // New fields for session metadata
  duration?: string;
  intensity?: 'light' | 'moderate' | 'high';
  focus?: string[];
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutWeek {
  id: string;
  name: string;
  order: number;
  sessions: string[]; // Array of session IDs
  // New fields for week metadata
  focus?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  sessions: WorkoutSession[];
  weeks: WorkoutWeek[];
  // New fields for program metadata
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string; // e.g., "4 weeks"
  goals?: string[];
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Library item interfaces (used for saving to library)
export interface LibraryItem {
  id: string;
  name: string;
  type: 'exercise' | 'workout' | 'week' | 'program';
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExerciseLibraryItem extends LibraryItem {
  type: 'exercise';
  data: Exercise;
}

export interface WorkoutLibraryItem extends LibraryItem {
  type: 'workout';
  data: WorkoutSession;
}

export interface WeekLibraryItem extends LibraryItem {
  type: 'week';
  data: WorkoutWeek;
}

export interface ProgramLibraryItem extends LibraryItem {
  type: 'program';
  data: WorkoutProgram;
}

export type LibraryItemType = ExerciseLibraryItem | WorkoutLibraryItem | WeekLibraryItem | ProgramLibraryItem;

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'rpe' | 'rest' | 'notes';
export type ExerciseCellType = 'name' | 'notes';
export type SetCellType = 'reps' | 'weight' | 'rpe' | 'rest';

export type WorkoutType = 'standard' | 'circuit' | 'superset' | 'emom' | 'amrap' | 'tabata';
