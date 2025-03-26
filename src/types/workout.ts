
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rpe: string;
  rest: string;
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
