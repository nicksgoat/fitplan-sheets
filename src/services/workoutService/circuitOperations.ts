
import { supabase } from "@/integrations/supabase/client";
import { Circuit } from "@/types/workout";
import { updateExercise } from "./exerciseOperations";

export async function addCircuit(workoutId: string, circuit: Partial<Circuit>) {
  const { data, error } = await supabase
    .from('circuits')
    .insert({
      workout_id: workoutId,
      name: circuit.name || 'New Circuit',
      rounds: circuit.rounds || '',
      rest_between_exercises: circuit.restBetweenExercises || '',
      rest_between_rounds: circuit.restBetweenRounds || ''
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // If there are exercises to add to this circuit
  if (circuit.exercises && circuit.exercises.length > 0) {
    const circuitExercises = circuit.exercises.map((exerciseId, index) => ({
      circuit_id: data.id,
      exercise_id: exerciseId,
      exercise_order: index  // Changed from order_num to exercise_order
    }));
    
    const { error: circuitExercisesError } = await supabase
      .from('circuit_exercises')
      .insert(circuitExercises);
    
    if (circuitExercisesError) throw circuitExercisesError;
    
    // Update the exercises to mark them as being in a circuit
    for (const exerciseId of circuit.exercises) {
      await updateExercise(exerciseId, {
        isInCircuit: true,
        circuitId: data.id
      });
    }
  }
  
  return data.id;
}

export async function updateCircuit(circuitId: string, updates: Partial<Circuit>) {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.rounds !== undefined) updateData.rounds = updates.rounds;
  if (updates.restBetweenExercises !== undefined) updateData.rest_between_exercises = updates.restBetweenExercises;
  if (updates.restBetweenRounds !== undefined) updateData.rest_between_rounds = updates.restBetweenRounds;
  
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('circuits')
      .update(updateData)
      .eq('id', circuitId);
    
    if (error) throw error;
  }
  
  // If there are updated exercise IDs, handle that separately
  if (updates.exercises) {
    // First, delete all existing circuit exercise associations
    const { error: deleteError } = await supabase
      .from('circuit_exercises')
      .delete()
      .eq('circuit_id', circuitId);
    
    if (deleteError) throw deleteError;
    
    // Then, insert the new associations
    const circuitExercises = updates.exercises.map((exerciseId, index) => ({
      circuit_id: circuitId,
      exercise_id: exerciseId,
      exercise_order: index  // Changed from order_num to exercise_order
    }));
    
    if (circuitExercises.length > 0) {
      const { error: insertError } = await supabase
        .from('circuit_exercises')
        .insert(circuitExercises);
      
      if (insertError) throw insertError;
    }
  }
}

export async function deleteCircuit(circuitId: string) {
  // First, find all exercises that are part of this circuit
  const { data: circuitExercises, error: fetchError } = await supabase
    .from('circuit_exercises')
    .select('exercise_id')
    .eq('circuit_id', circuitId);
  
  if (fetchError) throw fetchError;
  
  // Update all exercises to remove circuit association
  for (const { exercise_id } of circuitExercises) {
    await updateExercise(exercise_id, {
      isInCircuit: false,
      circuitId: undefined,
      circuitOrder: undefined
    });
  }
  
  // Delete the circuit
  const { error } = await supabase
    .from('circuits')
    .delete()
    .eq('id', circuitId);
  
  if (error) throw error;
}

export async function addExerciseToCircuit(circuitId: string, exerciseId: string, orderNum: number) {
  // Add the exercise to the circuit
  const { error } = await supabase
    .from('circuit_exercises')
    .insert({
      circuit_id: circuitId,
      exercise_id: exerciseId,
      exercise_order: orderNum  // Changed from order_num to exercise_order
    });
  
  if (error) throw error;
  
  // Update the exercise to mark it as being in a circuit
  await updateExercise(exerciseId, {
    isInCircuit: true,
    circuitId: circuitId,
    circuitOrder: orderNum
  });
}

export async function removeExerciseFromCircuit(circuitId: string, exerciseId: string) {
  // Remove the exercise from the circuit
  const { error } = await supabase
    .from('circuit_exercises')
    .delete()
    .eq('circuit_id', circuitId)
    .eq('exercise_id', exerciseId);
  
  if (error) throw error;
  
  // Update the exercise to remove circuit association
  await updateExercise(exerciseId, {
    isInCircuit: false,
    circuitId: undefined,
    circuitOrder: undefined
  });
}
