
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
        video_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .order('name');
    
    if (error) {
      console.error("Error fetching exercises from Supabase:", error);
      toast.error(`Database error: ${error.message}. Using local data.`);
      // Fallback to local data
      return localExerciseLibrary;
    }
    
    // Return database data regardless of whether it's empty or not
    return data.map(mapDbExerciseToModel);
  } catch (error) {
    console.error("Unexpected error fetching exercises:", error);
    toast.error(`Connection error. Using local data.`);
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
        video_url,
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
      toast.error(`Search error: ${error.message}. Using local search.`);
      // Fallback to local search
      return searchLocalExercises(query);
    }
    
    return data.map(mapDbExerciseToModel);
  } catch (error) {
    console.error("Unexpected error searching exercises:", error);
    toast.error('Search connection error. Using local search.');
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
  // First try the database
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
        video_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching exercise:", error);
      toast.error(`Database error fetching exercise: ${error.message}`);
    } else if (data) {
      return mapDbExerciseToModel(data);
    }
  } catch (error) {
    console.error("Unexpected error fetching exercise:", error);
    toast.error('Connection error fetching exercise');
  }
  
  // Then check if we can find it in local storage for custom exercises
  const localCustomExercises = getCustomExercisesFromLocalStorage();
  const localCustomExercise = localCustomExercises.find(e => e.id === id);
  
  if (localCustomExercise) {
    console.log("Found exercise in local storage:", localCustomExercise);
    return localCustomExercise;
  }
  
  // Finally, check local library data
  const localExercise = localExerciseLibrary.find(e => e.id === id);
  return localExercise || null;
}

// Upload video file to Supabase Storage
export async function uploadExerciseVideo(file: File, userId?: string): Promise<string> {
  try {
    // Check file size before attempting upload - reduce to 50MB max
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_SIZE) {
      const errorMessage = 'Video size exceeds the maximum allowed size of 50MB. Please choose a smaller file or compress your video.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Create a unique filename using user ID (if available) and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId || 'anonymous'}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file to the exercise-videos bucket
    const { data, error } = await supabase
      .storage
      .from('exercise-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Error uploading video:', error);
      if (error.message.includes('Payload too large')) {
        toast.error('Video file is too large. Maximum file size is 50MB.');
      } else {
        toast.error(`Failed to upload video: ${error.message}`);
      }
      throw error;
    }
    
    // Get the public URL for the uploaded video
    const { data: { publicUrl } } = supabase
      .storage
      .from('exercise-videos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading video:', error);
    toast.error('Failed to upload video. Please try again with a smaller file.');
    throw error;
  }
}

// Add a custom exercise - modified to use Supabase with local storage fallback
export async function addCustomExercise(exercise: Omit<Exercise, 'id'> & { userId?: string }): Promise<Exercise> {
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
        user_id: exercise.userId || null,
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
      toast.error(`Error saving to database: ${error.message}. Saving locally instead.`);
      // Fallback to local storage
      return addCustomExerciseToLocalStorage(exercise);
    }
    
    toast.success('Exercise created successfully in database');
    return mapDbExerciseToModel(data);
  } catch (error) {
    console.error("Unexpected error adding custom exercise:", error);
    toast.error('Connection error saving exercise. Saving locally instead.');
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

// Get custom exercises from Supabase or local storage
export async function getCustomExercises(userId?: string): Promise<Exercise[]> {
  // Always get local exercises first
  const localExercises = getCustomExercisesFromLocalStorage();
  
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
        video_url,
        tags,
        difficulty,
        duration,
        creator
      `)
      .eq('is_custom', true)
      .order('name');
    
    if (error) {
      console.error("Error fetching custom exercises from Supabase:", error);
      toast.error(`Error loading custom exercises: ${error.message}`);
      // Return local exercises as fallback
      return localExercises;
    }
    
    // Prioritize database exercises, but include unique local ones
    const supabaseExercises = data.map(mapDbExerciseToModel);
    const supabaseIds = supabaseExercises.map(e => e.id);
    const uniqueLocalExercises = localExercises.filter(e => !supabaseIds.includes(e.id));
    
    return [...supabaseExercises, ...uniqueLocalExercises];
  } catch (error) {
    console.error("Unexpected error fetching custom exercises:", error);
    toast.error('Connection error loading custom exercises');
    // Fallback to local storage
    return localExercises;
  }
}

// Get custom exercises from local storage
export function getCustomExercisesFromLocalStorage(): Exercise[] {
  const stored = localStorage.getItem('fitbloom-custom-exercises');
  return stored ? JSON.parse(stored) : [];
}

// Update a custom exercise
export async function updateCustomExercise(id: string, exercise: Partial<Exercise> & { userId?: string }): Promise<Exercise> {
  // First try to update in Supabase
  try {
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
    
    const { data, error } = await supabase
      .from('exercise_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating exercise in Supabase:", error);
      toast.error(`Database error updating exercise: ${error.message}`);
    } else if (data) {
      toast.success('Exercise updated successfully in database');
      return mapDbExerciseToModel(data);
    }
  } catch (error) {
    console.error("Unexpected error updating exercise:", error);
    toast.error('Connection error updating exercise');
  }
  
  // Then check if it's in local storage and update there
  const localExercises = getCustomExercisesFromLocalStorage();
  const index = localExercises.findIndex(e => e.id === id);
  
  if (index !== -1) {
    return updateCustomExerciseInLocalStorage(id, exercise);
  }
  
  throw new Error('Exercise not found in database or local storage');
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
  // Try to delete from Supabase first
  try {
    const { error } = await supabase
      .from('exercise_library')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting exercise from Supabase:", error);
      toast.error(`Database error deleting exercise: ${error.message}`);
    } else {
      toast.success('Exercise deleted successfully from database');
      // If successfully deleted from DB, also remove from local storage if it exists there
      deleteCustomExerciseFromLocalStorage(id);
      return;
    }
  } catch (error) {
    console.error("Unexpected error deleting exercise:", error);
    toast.error('Connection error deleting exercise');
  }
  
  // Then try to delete from local storage as fallback
  const localExercises = getCustomExercisesFromLocalStorage();
  const isLocalExercise = localExercises.some(e => e.id === id);
  
  if (isLocalExercise) {
    deleteCustomExerciseFromLocalStorage(id);
    return;
  }
  
  throw new Error('Exercise not found in database or local storage');
}

// Local storage fallback for deleting a custom exercise
function deleteCustomExerciseFromLocalStorage(id: string): void {
  const customExercises = getCustomExercisesFromLocalStorage();
  const filteredExercises = customExercises.filter(e => e.id !== id);
  
  localStorage.setItem('fitbloom-custom-exercises', JSON.stringify(filteredExercises));
  toast.success('Exercise deleted successfully from local storage');
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
