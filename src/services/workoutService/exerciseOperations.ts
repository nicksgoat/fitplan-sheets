
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/workout";

export async function addExercise(workoutId: string, exercise: Partial<Exercise>) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      workout_id: workoutId,
      name: exercise.name || 'New Exercise',
      notes: exercise.notes || '',
      rep_type: exercise.repType,
      intensity_type: exercise.intensityType,
      weight_type: exercise.weightType,
      is_circuit: exercise.isCircuit || false,
      is_in_circuit: exercise.isInCircuit || false,
      circuit_id: exercise.circuitId,
      circuit_order: exercise.circuitOrder,
      is_group: exercise.isGroup || false,
      group_id: exercise.groupId
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // If the exercise has sets, create them
  if (exercise.sets && exercise.sets.length > 0) {
    const setsToInsert = exercise.sets.map(set => ({
      exercise_id: data.id,
      reps: set.reps || '',
      weight: set.weight || '',
      intensity: set.intensity || '',
      intensity_type: set.intensityType,
      weight_type: set.weightType,
      rest: set.rest || ''
    }));
    
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .insert(setsToInsert);
    
    if (setsError) throw setsError;
  } else {
    // Create one default set
    const { error: setError } = await supabase
      .from('exercise_sets')
      .insert({
        exercise_id: data.id,
        reps: '',
        weight: '',
        intensity: '',
        rest: ''
      });
    
    if (setError) throw setError;
  }
  
  return data.id;
}

export async function updateExercise(exerciseId: string, updates: Partial<Exercise>) {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.repType !== undefined) updateData.rep_type = updates.repType;
  if (updates.intensityType !== undefined) updateData.intensity_type = updates.intensityType;
  if (updates.weightType !== undefined) updateData.weight_type = updates.weightType;
  if (updates.isCircuit !== undefined) updateData.is_circuit = updates.isCircuit;
  if (updates.isInCircuit !== undefined) updateData.is_in_circuit = updates.isInCircuit;
  if (updates.circuitId !== undefined) updateData.circuit_id = updates.circuitId;
  if (updates.circuitOrder !== undefined) updateData.circuit_order = updates.circuitOrder;
  if (updates.isGroup !== undefined) updateData.is_group = updates.isGroup;
  if (updates.groupId !== undefined) updateData.group_id = updates.groupId;
  
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', exerciseId);
    
    if (error) throw error;
  }
}

export async function deleteExercise(exerciseId: string) {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId);
  
  if (error) throw error;
}
