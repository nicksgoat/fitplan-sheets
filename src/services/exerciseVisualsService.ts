
import { supabase } from "@/integrations/supabase/client";
import { ExerciseVisual } from "@/types/exercise";

// Fetch all exercise visuals
export async function getAllExerciseVisuals(): Promise<ExerciseVisual[]> {
  const { data, error } = await supabase
    .from('exercise_visuals')
    .select('*');
  
  if (error) {
    console.error("Error fetching exercise visuals:", error);
    throw error;
  }
  
  return data.map(mapDbVisualToModel);
}

// Get visuals for a specific exercise
export async function getExerciseVisualByExerciseId(exerciseId: string): Promise<ExerciseVisual | null> {
  const { data, error } = await supabase
    .from('exercise_visuals')
    .select('*')
    .eq('exercise_id', exerciseId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error("Error fetching exercise visual:", error);
    throw error;
  }
  
  return mapDbVisualToModel(data);
}

// Get visuals with tag filtering
export async function getExerciseVisualsByTags(tags: string[]): Promise<ExerciseVisual[]> {
  if (!tags || tags.length === 0) {
    return getAllExerciseVisuals();
  }
  
  // Use the containedBy operator to find visuals that have at least one of the specified tags
  const { data, error } = await supabase
    .from('exercise_visuals')
    .select('*')
    .overlaps('tags', tags);
  
  if (error) {
    console.error("Error fetching exercise visuals by tags:", error);
    throw error;
  }
  
  return data.map(mapDbVisualToModel);
}

// Add or update a visual for an exercise
export async function addOrUpdateExerciseVisual(
  visual: Omit<ExerciseVisual, 'id'>
): Promise<ExerciseVisual> {
  // First check if a visual already exists for this exercise
  const { data: existingVisual } = await supabase
    .from('exercise_visuals')
    .select('id')
    .eq('exercise_id', visual.exerciseId)
    .single();
  
  let result;
  
  if (existingVisual) {
    // Update existing visual
    const { data, error } = await supabase
      .from('exercise_visuals')
      .update({
        image_url: visual.imageUrl,
        tags: visual.tags || [],
        difficulty: visual.difficulty,
        duration: visual.duration,
        creator: visual.creator || 'FitBloom'
      })
      .eq('id', existingVisual.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating exercise visual:", error);
      throw error;
    }
    
    result = data;
  } else {
    // Insert new visual
    const { data, error } = await supabase
      .from('exercise_visuals')
      .insert({
        exercise_id: visual.exerciseId,
        image_url: visual.imageUrl,
        tags: visual.tags || [],
        difficulty: visual.difficulty,
        duration: visual.duration,
        creator: visual.creator || 'FitBloom'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding exercise visual:", error);
      throw error;
    }
    
    result = data;
  }
  
  return mapDbVisualToModel(result);
}

// Map database visual to our model
function mapDbVisualToModel(dbVisual: any): ExerciseVisual {
  return {
    id: dbVisual.id,
    exerciseId: dbVisual.exercise_id,
    imageUrl: dbVisual.image_url,
    tags: dbVisual.tags || [],
    difficulty: dbVisual.difficulty,
    duration: dbVisual.duration,
    creator: dbVisual.creator || 'FitBloom'
  };
}
