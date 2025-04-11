
import { Workout, WorkoutWeek, Exercise, Set, Circuit } from '@/types/workout';
import { DbWorkout, DbWeek, DbExercise, DbSet, DbCircuit } from '@/types/supabase';

// Map database workout to model
export function mapDbWorkoutToModel(dbWorkout: DbWorkout): Workout {
  return {
    id: dbWorkout.id,
    name: dbWorkout.name,
    day: dbWorkout.day_num,
    weekId: dbWorkout.week_id,
    exercises: [],
    circuits: [],
    savedAt: dbWorkout.created_at,
    lastModified: dbWorkout.updated_at
  };
}

// Map database week to model
export function mapDbWeekToModel(dbWeek: DbWeek): WorkoutWeek {
  return {
    id: dbWeek.id,
    name: dbWeek.name,
    order: dbWeek.order_num,
    workouts: [],
    savedAt: dbWeek.created_at,
    lastModified: dbWeek.updated_at
  };
}

// Map database exercise to model
export function mapDbExerciseToModel(dbExercise: DbExercise): Exercise {
  return {
    id: dbExercise.id,
    name: dbExercise.name,
    sets: [],
    notes: dbExercise.notes || '',
    isCircuit: dbExercise.is_circuit || false,
    isInCircuit: dbExercise.is_in_circuit || false,
    circuitId: dbExercise.circuit_id,
    circuitOrder: dbExercise.circuit_order,
    isGroup: dbExercise.is_group || false,
    groupId: dbExercise.group_id,
    repType: dbExercise.rep_type as any,
    intensityType: dbExercise.intensity_type as any,
    weightType: dbExercise.weight_type as any,
    libraryExerciseId: dbExercise.library_exercise_id
  };
}

// Map database set to model
export function mapDbSetToModel(dbSet: DbSet): Set {
  return {
    id: dbSet.id,
    reps: dbSet.reps || '',
    weight: dbSet.weight || '',
    intensity: dbSet.intensity || '',
    intensityType: dbSet.intensity_type as any,
    weightType: dbSet.weight_type as any,
    rest: dbSet.rest || ''
  };
}

// Map database circuit to model
export function mapDbCircuitToModel(dbCircuit: DbCircuit): Circuit {
  return {
    id: dbCircuit.id,
    name: dbCircuit.name,
    exercises: [],
    rounds: dbCircuit.rounds,
    restBetweenExercises: dbCircuit.rest_between_exercises,
    restBetweenRounds: dbCircuit.rest_between_rounds
  };
}
