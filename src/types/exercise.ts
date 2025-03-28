
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

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

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
  // Visual properties directly in the Exercise type
  imageUrl?: string;
  tags?: string[];
  difficulty?: Difficulty;
  duration?: string;
  creator?: string;
}
