
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseCategory, PrimaryMuscle } from "@/types/exercise";
import { exerciseLibrary as localExerciseLibrary } from "@/utils/exerciseLibrary";
import { toast } from 'sonner';

// Fetch all exercises from Supabase with fallback
export async function getAllExercises(): Promise<Exercise[]> {
  try {
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
        user_id,
        image_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .order('name');
    
    if (error) {
      console.error("Error fetching exercises from Supabase:", error);
      // Fallback to local data
      console.log("Using local exercise library as fallback");
      return localExerciseLibrary;
    }
    
    if (data.length === 0) {
      console.warn("No exercises found in Supabase, using local data");
      return localExerciseLibrary;
    }
    
    return data.map(mapDbExerciseToModel);
  } catch (error) {
    console.error("Unexpected error fetching exercises:", error);
    // Fallback to local data in case of any error
    return localExerciseLibrary;
  }
}

// Search exercises by name with fallback
export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query || query.trim() === '') return [];
  
  try {
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
        user_id,
        image_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);
    
    if (error) {
      console.error("Error searching exercises from Supabase:", error);
      // Fallback to local search
      console.log("Using local exercise search as fallback");
      return searchLocalExercises(query);
    }
    
    return data.map(mapDbExerciseToModel);
  } catch (error) {
    console.error("Unexpected error searching exercises:", error);
    // Fallback to local search in case of any error
    return searchLocalExercises(query);
  }
}

// Local search fallback
function searchLocalExercises(query: string): Exercise[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return localExerciseLibrary
    .filter(exercise => exercise.name.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      // Sort by whether the name starts with the query first
      const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);
}

// Get exercise by ID with fallback
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
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
        user_id,
        image_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching exercise:", error);
      // Check if we can find it in local data
      const localExercise = localExerciseLibrary.find(e => e.id === id);
      return localExercise || null;
    }
    
    if (!data) {
      // Check if we can find it in local data
      const localExercise = localExerciseLibrary.find(e => e.id === id);
      return localExercise || null;
    }
    
    return mapDbExerciseToModel(data);
  } catch (error) {
    console.error("Unexpected error fetching exercise:", error);
    // Check if we can find it in local data
    const localExercise = localExerciseLibrary.find(e => e.id === id);
    return localExercise || null;
  }
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
      is_custom: true,
      image_url: exercise.imageUrl || '',
      tags: exercise.tags || [],
      difficulty: exercise.difficulty || 'beginner',
      duration: exercise.duration || '',
      creator: exercise.creator || 'You'
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
  if (exercise.imageUrl !== undefined) updates.image_url = exercise.imageUrl;
  if (exercise.tags !== undefined) updates.tags = exercise.tags;
  if (exercise.difficulty !== undefined) updates.difficulty = exercise.difficulty;
  if (exercise.duration !== undefined) updates.duration = exercise.duration;
  if (exercise.creator !== undefined) updates.creator = exercise.creator;
  
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
    userId: dbExercise.user_id,
    imageUrl: dbExercise.image_url || '',
    tags: dbExercise.tags || [],
    difficulty: dbExercise.difficulty || 'beginner',
    duration: dbExercise.duration || '',
    creator: dbExercise.creator || 'FitBloom'
  };
}
