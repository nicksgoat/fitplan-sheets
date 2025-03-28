import { supabase } from "@/integrations/supabase/client";
import { ExerciseVisual } from "@/types/exercise";
import { toast } from "sonner";

// Create a fallback mock visuals data
const mockVisuals: ExerciseVisual[] = [
  {
    id: '1',
    exerciseId: 'bb-bench-press',
    imageUrl: 'https://placehold.co/600x400?text=Barbell+Bench+Press',
    tags: ['strength', 'chest'],
    difficulty: 'intermediate',
    duration: '10-15 min',
    creator: 'FitBloom'
  },
  {
    id: '2',
    exerciseId: 'bb-squat',
    imageUrl: 'https://placehold.co/600x400?text=Barbell+Squat',
    tags: ['strength', 'legs'],
    difficulty: 'intermediate',
    duration: '10-15 min',
    creator: 'FitBloom'
  },
  {
    id: '3',
    exerciseId: 'bb-deadlift',
    imageUrl: 'https://placehold.co/600x400?text=Barbell+Deadlift',
    tags: ['strength', 'back'],
    difficulty: 'intermediate',
    duration: '10-15 min',
    creator: 'FitBloom'
  }
];

// Fetch all exercise visuals with fallback
export async function getAllExerciseVisuals(): Promise<ExerciseVisual[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_visuals')
      .select('*');
    
    if (error) {
      console.error("Error fetching exercise visuals:", error);
      // Fallback to mock data
      console.log("Using mock visuals as fallback");
      return mockVisuals;
    }
    
    if (data.length === 0) {
      console.warn("No exercise visuals found in Supabase, using mock data");
      return mockVisuals;
    }
    
    return data.map(mapDbVisualToModel);
  } catch (error) {
    console.error("Unexpected error fetching exercise visuals:", error);
    return mockVisuals;
  }
}

// Get visuals for a specific exercise with fallback
export async function getExerciseVisualByExerciseId(exerciseId: string): Promise<ExerciseVisual | null> {
  try {
    const { data, error } = await supabase
      .from('exercise_visuals')
      .select('*')
      .eq('exercise_id', exerciseId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching exercise visual:", error);
      // Look for a mock visual
      const mockVisual = mockVisuals.find(v => v.exerciseId === exerciseId);
      return mockVisual || null;
    }
    
    if (!data) {
      // Look for a mock visual
      const mockVisual = mockVisuals.find(v => v.exerciseId === exerciseId);
      return mockVisual || null;
    }
    
    return mapDbVisualToModel(data);
  } catch (error) {
    console.error("Unexpected error fetching exercise visual:", error);
    const mockVisual = mockVisuals.find(v => v.exerciseId === exerciseId);
    return mockVisual || null;
  }
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
