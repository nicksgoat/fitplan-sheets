
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/urlUtils";

export async function addWorkout(weekId: string, name: string, dayNum: number) {
  const slug = generateSlug(name);
  
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      week_id: weekId,
      name,
      day_num: dayNum,
      slug
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Create the first exercise for this workout
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('exercises')
    .insert({
      workout_id: data.id,
      name: 'Exercise 1'
    })
    .select()
    .single();
  
  if (exerciseError) throw exerciseError;
  
  // Create the first set for this exercise
  const { error: setError } = await supabase
    .from('exercise_sets')
    .insert({
      exercise_id: exerciseData.id,
      reps: '',
      weight: '',
      intensity: '',
      rest: ''
    });
  
  if (setError) throw setError;
  
  return data.id;
}

export async function updateWorkout(workoutId: string, updates: { name?: string, dayNum?: number }) {
  const updateData: any = {};
  if (updates.name) {
    updateData.name = updates.name;
    updateData.slug = generateSlug(updates.name);
  }
  if (updates.dayNum !== undefined) updateData.day_num = updates.dayNum;
  
  const { error } = await supabase
    .from('workouts')
    .update(updateData)
    .eq('id', workoutId);
  
  if (error) throw error;
}

export async function deleteWorkout(workoutId: string) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);
  
  if (error) throw error;
}

export async function updateWorkoutPrice(workoutId: string, price: number, isPurchasable: boolean) {
  const { error } = await supabase
    .from('workouts')
    .update({
      price,
      is_purchasable: isPurchasable
    })
    .eq('id', workoutId);
  
  if (error) throw error;
}

// Add the missing functions for workout purchases

export async function hasUserPurchasedWorkout(userId: string, workoutId: string) {
  const { count, error } = await supabase
    .from('workout_purchases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('workout_id', workoutId)
    .eq('status', 'completed');
  
  if (error) throw error;
  return count > 0;
}

export async function getUserPurchasedWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('workout_purchases')
    .select('workout_id')
    .eq('user_id', userId)
    .eq('status', 'completed');
  
  if (error) throw error;
  return data.map(purchase => purchase.workout_id);
}
