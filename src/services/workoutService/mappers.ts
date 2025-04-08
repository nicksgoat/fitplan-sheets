
import { Exercise, Set, WorkoutProgram, Workout, WorkoutWeek, Circuit } from "@/types/workout";

// Function to convert database snake_case to camelCase types
export function mapDbWorkoutToModel(dbWorkout: any): Workout {
  return {
    id: dbWorkout.id,
    name: dbWorkout.name,
    day: dbWorkout.day_num,
    weekId: dbWorkout.week_id,
    exercises: [],
    circuits: []
  };
}

export function mapDbExerciseToModel(dbExercise: any): Exercise {
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

export function mapDbSetToModel(dbSet: any): Set {
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

export function mapDbCircuitToModel(dbCircuit: any): Circuit {
  return {
    id: dbCircuit.id,
    name: dbCircuit.name,
    exercises: [],
    rounds: dbCircuit.rounds,
    restBetweenExercises: dbCircuit.rest_between_exercises,
    restBetweenRounds: dbCircuit.rest_between_rounds
  };
}

export function mapDbWeekToModel(dbWeek: any): WorkoutWeek {
  return {
    id: dbWeek.id,
    name: dbWeek.name,
    order: dbWeek.order_num,
    workouts: []
  };
}
