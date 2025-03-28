
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseCategory, PrimaryMuscle } from "@/types/exercise";

// Fetch all exercises from Supabase
export async function getAllExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select(`
      id,
      name,
      primary_muscle,
      secondary_muscles,
      category,
      description,
      instructions,
      is_custom,
      user_id
    `)
    .order('name');
  
  if (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
  
  return data.map(mapDbExerciseToModel);
}

// Search exercises by name
export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query || query.trim() === '') return [];
  
  const { data, error } = await supabase
    .from('exercise_library')
    .select(`
      id,
      name,
      primary_muscle,
      secondary_muscles,
      category,
      description,
      instructions,
      is_custom,
      user_id
    `)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10);
  
  if (error) {
    console.error("Error searching exercises:", error);
    throw error;
  }
  
  return data.map(mapDbExerciseToModel);
}

// Get exercise by ID
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select(`
      id,
      name,
      primary_muscle,
      secondary_muscles,
      category,
      description,
      instructions,
      is_custom,
      user_id
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error("Error fetching exercise:", error);
    throw error;
  }
  
  return mapDbExerciseToModel(data);
}

// Add a custom exercise
export async function addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercise_library')
    .insert({
      name: exercise.name,
      primary_muscle: exercise.primaryMuscle,
      secondary_muscles: exercise.secondaryMuscles || [],
      category: exercise.category,
      description: exercise.description || '',
      instructions: exercise.instructions || '',
      is_custom: true
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding custom exercise:", error);
    throw error;
  }
  
  return mapDbExerciseToModel(data);
}

// Update a custom exercise
export async function updateCustomExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
  const updates: any = {};
  
  if (exercise.name !== undefined) updates.name = exercise.name;
  if (exercise.primaryMuscle !== undefined) updates.primary_muscle = exercise.primaryMuscle;
  if (exercise.secondaryMuscles !== undefined) updates.secondary_muscles = exercise.secondaryMuscles;
  if (exercise.category !== undefined) updates.category = exercise.category;
  if (exercise.description !== undefined) updates.description = exercise.description;
  if (exercise.instructions !== undefined) updates.instructions = exercise.instructions;
  
  const { data, error } = await supabase
    .from('exercise_library')
    .update(updates)
    .eq('id', id)
    .eq('is_custom', true)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating custom exercise:", error);
    throw error;
  }
  
  return mapDbExerciseToModel(data);
}

// Delete a custom exercise
export async function deleteCustomExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_library')
    .delete()
    .eq('id', id)
    .eq('is_custom', true);
  
  if (error) {
    console.error("Error deleting custom exercise:", error);
    throw error;
  }
}

// Map database exercise to our model
function mapDbExerciseToModel(dbExercise: any): Exercise {
  return {
    id: dbExercise.id,
    name: dbExercise.name,
    primaryMuscle: dbExercise.primary_muscle as PrimaryMuscle,
    secondaryMuscles: dbExercise.secondary_muscles as PrimaryMuscle[] || [],
    category: dbExercise.category as ExerciseCategory,
    description: dbExercise.description || '',
    instructions: dbExercise.instructions || '',
    isCustom: dbExercise.is_custom || false,
    userId: dbExercise.user_id
  };
}
