
import { supabase } from "@/integrations/supabase/client";
import { Exercise, Set, WorkoutProgram, Workout, WorkoutWeek, Circuit } from "@/types/workout";
import { useAuth } from "@/hooks/useAuth";

// Function to convert database snake_case to camelCase types
function mapDbWorkoutToModel(dbWorkout: any): Workout {
  return {
    id: dbWorkout.id,
    name: dbWorkout.name,
    day: dbWorkout.day_num,
    weekId: dbWorkout.week_id,
    exercises: [],
    circuits: []
  };
}

function mapDbExerciseToModel(dbExercise: any): Exercise {
  return {
    id: dbExercise.id,
    name: dbExercise.name,
    notes: dbExercise.notes || '',
    sets: [],
    repType: dbExercise.rep_type,
    intensityType: dbExercise.intensity_type,
    weightType: dbExercise.weight_type,
    isCircuit: dbExercise.is_circuit,
    isInCircuit: dbExercise.is_in_circuit,
    circuitId: dbExercise.circuit_id,
    circuitOrder: dbExercise.circuit_order,
    isGroup: dbExercise.is_group,
    groupId: dbExercise.group_id
  };
}

function mapDbSetToModel(dbSet: any): Set {
  return {
    id: dbSet.id,
    reps: dbSet.reps || '',
    weight: dbSet.weight || '',
    intensity: dbSet.intensity || '',
    intensityType: dbSet.intensity_type,
    weightType: dbSet.weight_type,
    rest: dbSet.rest || ''
  };
}

function mapDbCircuitToModel(dbCircuit: any): Circuit {
  return {
    id: dbCircuit.id,
    name: dbCircuit.name,
    exercises: [],
    rounds: dbCircuit.rounds,
    restBetweenExercises: dbCircuit.rest_between_exercises,
    restBetweenRounds: dbCircuit.rest_between_rounds
  };
}

function mapDbWeekToModel(dbWeek: any): WorkoutWeek {
  return {
    id: dbWeek.id,
    name: dbWeek.name,
    order: dbWeek.order_num,
    workouts: []
  };
}

// Program operations
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
  
  const weeks: WorkoutWeek[] = weeksData.map(mapDbWeekToModel);
  
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
  
  const workouts: Workout[] = [];
  
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

// Week operations
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

// Workout operations
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

// Exercise operations
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

// Set operations
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

// Circuit operations
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
      order_num: index
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
      order_num: index
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
      order_num: orderNum
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
