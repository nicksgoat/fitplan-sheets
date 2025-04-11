
// Define types for database tables to ensure type safety
export interface DbProgram {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

export interface DbWeek {
  id: string;
  name: string;
  program_id: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface DbWorkout {
  id: string;
  name: string;
  week_id: string;
  day_num: number;
  created_at: string;
  updated_at: string;
}

export interface DbExercise {
  id: string;
  name: string;
  workout_id: string;
  notes?: string;
  is_circuit?: boolean;
  is_in_circuit?: boolean;
  circuit_id?: string;
  circuit_order?: number;
  is_group?: boolean;
  group_id?: string;
  rep_type?: string;
  intensity_type?: string;
  weight_type?: string;
  created_at: string;
  updated_at: string;
  library_exercise_id?: string;
}

export interface DbSet {
  id: string;
  exercise_id: string;
  reps: string;
  weight: string;
  intensity: string;
  intensity_type?: string;
  weight_type?: string;
  rest: string;
  created_at: string;
  updated_at: string;
}

export interface DbCircuit {
  id: string;
  name: string;
  workout_id: string;
  rounds?: string;
  rest_between_exercises?: string;
  rest_between_rounds?: string;
  created_at: string;
  updated_at: string;
}
