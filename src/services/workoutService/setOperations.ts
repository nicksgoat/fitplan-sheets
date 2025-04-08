
import { supabase } from "@/integrations/supabase/client";
import { Set } from "@/types/workout";

export async function addSet(exerciseId: string, set: Partial<Set>) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({
      exercise_id: exerciseId,
      reps: set.reps || '',
      weight: set.weight || '',
      intensity: set.intensity || '',
      intensity_type: set.intensityType,
      weight_type: set.weightType,
      rest: set.rest || ''
    })
    .select()
    .single();
  
  if (error) throw error;
  return data.id;
}

export async function updateSet(setId: string, updates: Partial<Set>) {
  const updateData: any = {};
  
  if (updates.reps !== undefined) updateData.reps = updates.reps;
  if (updates.weight !== undefined) updateData.weight = updates.weight;
  if (updates.intensity !== undefined) updateData.intensity = updates.intensity;
  if (updates.intensityType !== undefined) updateData.intensity_type = updates.intensityType;
  if (updates.weightType !== undefined) updateData.weight_type = updates.weightType;
  if (updates.rest !== undefined) updateData.rest = updates.rest;
  
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('exercise_sets')
      .update(updateData)
      .eq('id', setId);
    
    if (error) throw error;
  }
}

export async function deleteSet(setId: string) {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('id', setId);
  
  if (error) throw error;
}
