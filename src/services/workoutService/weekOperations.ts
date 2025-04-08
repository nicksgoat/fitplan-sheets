
import { supabase } from "@/integrations/supabase/client";

export async function addWeek(programId: string, name: string, orderNum: number) {
  const { data, error } = await supabase
    .from('weeks')
    .insert({
      program_id: programId,
      name,
      order_num: orderNum
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Create the first workout for this week
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      week_id: data.id,
      name: 'Day 1 Workout',
      day_num: 1
    })
    .select()
    .single();
  
  if (workoutError) throw workoutError;
  
  // Create the first exercise for this workout
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('exercises')
    .insert({
      workout_id: workoutData.id,
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
  
  return {
    weekId: data.id,
    workoutId: workoutData.id
  };
}

export async function updateWeek(weekId: string, updates: { name?: string, orderNum?: number }) {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.orderNum !== undefined) updateData.order_num = updates.orderNum;
  
  const { error } = await supabase
    .from('weeks')
    .update(updateData)
    .eq('id', weekId);
  
  if (error) throw error;
}

export async function deleteWeek(weekId: string) {
  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', weekId);
  
  if (error) throw error;
}
