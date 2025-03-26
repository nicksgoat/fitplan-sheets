
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
  isGroup?: boolean;
  groupId?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  day: number;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  sessions: WorkoutSession[];
}

export type CellType = 'name' | 'sets' | 'reps' | 'weight' | 'rpe' | 'rest' | 'notes';
export type ExerciseCellType = 'name' | 'notes';
export type SetCellType = 'reps' | 'weight' | 'rpe' | 'rest';
