
export interface WorkoutLogExercise {
  id: string;
  name: string;
  sets: WorkoutLogSet[];
  notes?: string;
  isCircuit?: boolean;
  circuitId?: string;
  isInCircuit?: boolean;
}

export interface WorkoutLogSet {
  id: string;
  reps: string;
  weight: string;
  rest?: string;
  completed: boolean;
}

export interface WorkoutLogData {
  id: string;
  workoutId?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutLogExercise[];
}
