
import { supabase } from "@/integrations/supabase/client";

export async function addWorkout(weekId: string, name: string, dayNum: number) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      week_id: weekId,
      name,
      day_num: dayNum
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
  if (updates.name) updateData.name = updates.name;
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
