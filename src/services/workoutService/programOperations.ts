
import { supabase } from "@/integrations/supabase/client";
import { WorkoutProgram } from "@/types/workout";
import { mapDbWorkoutToModel, mapDbWeekToModel, mapDbExerciseToModel, mapDbSetToModel, mapDbCircuitToModel } from './mappers';

export async function getPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProgram(programId: string): Promise<WorkoutProgram> {
  // Fetch the program
  const { data: programData, error: programError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();
  
  if (programError) throw programError;
  
  // Fetch the weeks
  const { data: weeksData, error: weeksError } = await supabase
    .from('weeks')
    .select('*')
    .eq('program_id', programId)
    .order('order_num');
  
  if (weeksError) throw weeksError;
  
  const weeks = weeksData.map(mapDbWeekToModel);
  
  // For each week, fetch the workouts
  for (const week of weeks) {
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('week_id', week.id)
      .order('day_num');
    
    if (workoutsError) throw workoutsError;
    
    week.workouts = workoutsData.map(w => w.id);
  }
  
  const workouts = [];
  
  // For each workout, fetch exercises, sets, and circuits
  for (const week of weeks) {
    for (const workoutId of week.workouts) {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (workoutError) throw workoutError;
      
      const workout = mapDbWorkoutToModel(workoutData);
      
      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workoutId);
      
      if (exercisesError) throw exercisesError;
      
      const exercises = exercisesData.map(mapDbExerciseToModel);
      
      // Fetch circuits
      const { data: circuitsData, error: circuitsError } = await supabase
        .from('circuits')
        .select('*')
        .eq('workout_id', workoutId);
      
      if (circuitsError) throw circuitsError;
      
      const circuits = circuitsData.map(mapDbCircuitToModel);
      
      // Fetch circuit exercises
      for (const circuit of circuits) {
        const { data: circuitExercisesData, error: circuitExercisesError } = await supabase
          .from('circuit_exercises')
          .select('*')
          .eq('circuit_id', circuit.id)
          .order('order_num');
        
        if (circuitExercisesError) throw circuitExercisesError;
        
        circuit.exercises = circuitExercisesData.map(ce => ce.exercise_id);
      }
      
      // Fetch sets for each exercise
      for (const exercise of exercises) {
        const { data: setsData, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('exercise_id', exercise.id);
        
        if (setsError) throw setsError;
        
        exercise.sets = setsData.map(mapDbSetToModel);
      }
      
      workout.exercises = exercises;
      workout.circuits = circuits;
      workouts.push(workout);
    }
  }
  
  return {
    id: programData.id,
    name: programData.name,
    weeks,
    workouts
  };
}

export async function createProgram(name: string) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("No authenticated user found");
  }
  
  // Create a program
  const { data: programData, error: programError } = await supabase
    .from('programs')
    .insert({ 
      name,
      user_id: user.id
    })
    .select()
    .single();
  
  if (programError) throw programError;
  
  // Create the first week
  const { data: weekData, error: weekError } = await supabase
    .from('weeks')
    .insert({
      program_id: programData.id,
      name: 'Week 1',
      order_num: 1
    })
    .select()
    .single();
  
  if (weekError) throw weekError;
  
  // Create the first workout
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      week_id: weekData.id,
      name: 'Day 1 Workout',
      day_num: 1
    })
    .select()
    .single();
  
  if (workoutError) throw workoutError;
  
  // Create the first exercise
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('exercises')
    .insert({
      workout_id: workoutData.id,
      name: 'Exercise 1'
    })
    .select()
    .single();
  
  if (exerciseError) throw exerciseError;
  
  // Create the first set
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
  
  return programData.id;
}

export async function updateProgram(programId: string, name: string) {
  const { error } = await supabase
    .from('programs')
    .update({ name })
    .eq('id', programId);
  
  if (error) throw error;
}

export async function deleteProgram(programId: string) {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId);
  
  if (error) throw error;
}
