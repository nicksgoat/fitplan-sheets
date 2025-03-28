
export type ExerciseCategory = 
  | "barbell"
  | "dumbbell" 
  | "machine" 
  | "bodyweight" 
  | "kettlebell"
  | "cable"
  | "cardio"
  | "other";

export type PrimaryMuscle = 
  | "chest" 
  | "back" 
  | "shoulders" 
  | "biceps" 
  | "triceps" 
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "forearms"
  | "full body"
  | "upper chest"
  | "core"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: PrimaryMuscle;
  secondaryMuscles?: PrimaryMuscle[];
  category: ExerciseCategory;
  description?: string;
  instructions?: string;
  isCustom?: boolean;
  userId?: string;
}

export interface ExerciseVisual {
  id: string;
  exerciseId: string;
  imageUrl: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  creator?: string;
}

export interface ExerciseWithVisual extends Exercise {
  visual?: ExerciseVisual;
}
