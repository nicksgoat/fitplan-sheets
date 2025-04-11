
import { DbProgram } from '@/types/supabase';
import { WorkoutProgram } from '@/types/workout';

// Convert DbProgram to WorkoutProgram interface
export const mapDbProgramToWorkoutProgram = (dbProgram: DbProgram): Partial<WorkoutProgram> => {
  return {
    id: dbProgram.id,
    name: dbProgram.name,
    workouts: [], // This will be populated elsewhere
    weeks: [],    // This will be populated elsewhere
    savedAt: dbProgram.created_at,
    lastModified: dbProgram.updated_at,
    isPublic: dbProgram.is_public,
    price: dbProgram.price,
    isPurchasable: dbProgram.is_purchasable
  };
};
