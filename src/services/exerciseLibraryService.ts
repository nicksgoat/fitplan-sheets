
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseCategory, PrimaryMuscle } from "@/types/exercise";
import { exerciseLibrary as localExerciseLibrary } from "@/utils/exerciseLibrary";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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

// Add a custom exercise - modified to use local storage instead of Supabase
export async function addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
  try {
    // Try to add to Supabase first
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
        video_url: exercise.videoUrl || '',
        tags: exercise.tags || [],
        difficulty: exercise.difficulty || 'beginner',
        duration: exercise.duration || '',
        creator: exercise.creator || 'You'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding custom exercise to Supabase:", error);
      // Fallback to local storage
      return addCustomExerciseToLocalStorage(exercise);
    }
    
    return mapDbExerciseToModel(data);
  } catch (error) {
    console.error("Unexpected error adding custom exercise:", error);
    // Fallback to local storage
    return addCustomExerciseToLocalStorage(exercise);
  }
}

// Local storage fallback for adding a custom exercise
function addCustomExerciseToLocalStorage(exercise: Omit<Exercise, 'id'>): Exercise {
  const newExercise: Exercise = {
    id: uuidv4(),
    ...exercise,
    isCustom: true
  };
  
  const customExercises = getCustomExercisesFromLocalStorage();
  customExercises.push(newExercise);
  localStorage.setItem('fitbloom-custom-exercises', JSON.stringify(customExercises));
  
  toast.success('Exercise created successfully (saved locally)');
  return newExercise;
}

// Get custom exercises from local storage
function getCustomExercisesFromLocalStorage(): Exercise[] {
  const stored = localStorage.getItem('fitbloom-custom-exercises');
  return stored ? JSON.parse(stored) : [];
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
  if (exercise.videoUrl !== undefined) updates.video_url = exercise.videoUrl;
  if (exercise.tags !== undefined) updates.tags = exercise.tags;
  if (exercise.difficulty !== undefined) updates.difficulty = exercise.difficulty;
  if (exercise.duration !== undefined) updates.duration = exercise.duration;
  if (exercise.creator !== undefined) updates.creator = exercise.creator;
  
  try {
    const { data, error } = await supabase
      .from('exercise_library')
      .update(updates)
      .eq('id', id)
      .eq('is_custom', true)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating custom exercise in Supabase:", error);
      // Fallback to local storage
      return updateCustomExerciseInLocalStorage(id, exercise);
    }
    
    return mapDbExerciseToModel(data);
  } catch (error) {
    console.error("Unexpected error updating custom exercise:", error);
    // Fallback to local storage
    return updateCustomExerciseInLocalStorage(id, exercise);
  }
}

// Local storage fallback for updating a custom exercise
function updateCustomExerciseInLocalStorage(id: string, exerciseUpdates: Partial<Exercise>): Exercise {
  const customExercises = getCustomExercisesFromLocalStorage();
  const index = customExercises.findIndex(e => e.id === id);
  
  if (index === -1) {
    throw new Error('Exercise not found in local storage');
  }
  
  const updatedExercise = { ...customExercises[index], ...exerciseUpdates };
  customExercises[index] = updatedExercise;
  
  localStorage.setItem('fitbloom-custom-exercises', JSON.stringify(customExercises));
  toast.success('Exercise updated successfully (saved locally)');
  
  return updatedExercise;
}

// Delete a custom exercise
export async function deleteCustomExercise(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('exercise_library')
      .delete()
      .eq('id', id)
      .eq('is_custom', true);
    
    if (error) {
      console.error("Error deleting custom exercise from Supabase:", error);
      // Fallback to local storage
      deleteCustomExerciseFromLocalStorage(id);
      return;
    }
  } catch (error) {
    console.error("Unexpected error deleting custom exercise:", error);
    // Fallback to local storage
    deleteCustomExerciseFromLocalStorage(id);
  }
}

// Local storage fallback for deleting a custom exercise
function deleteCustomExerciseFromLocalStorage(id: string): void {
  const customExercises = getCustomExercisesFromLocalStorage();
  const filteredExercises = customExercises.filter(e => e.id !== id);
  
  localStorage.setItem('fitbloom-custom-exercises', JSON.stringify(filteredExercises));
  toast.success('Exercise deleted successfully (from local storage)');
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
    videoUrl: dbExercise.video_url || '',
    tags: dbExercise.tags || [],
    difficulty: dbExercise.difficulty || 'beginner',
    duration: dbExercise.duration || '',
    creator: dbExercise.creator || 'FitBloom'
  };
}
