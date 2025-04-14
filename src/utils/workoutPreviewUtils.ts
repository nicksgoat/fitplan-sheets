
import { Exercise } from "@/types/workout";

export const formatRestTime = (rest: string): string => {
  if (!rest) return '0s';
  
  if (rest.includes('m')) {
    return rest;
  } else if (rest.includes('s')) {
    return rest;
  } else {
    const restNum = parseFloat(rest);
    if (restNum >= 60) {
      const minutes = Math.floor(restNum / 60);
      const seconds = restNum % 60;
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
      return `${restNum}s`;
    }
  }
};

export const getRepRange = (exercise: Exercise): string => {
  if (!exercise.sets || exercise.sets.length === 0) {
    return "No sets defined";
  }
  
  // Check if all sets have the same rep count
  const firstSetReps = exercise.sets[0].reps;
  const allSameReps = exercise.sets.every(set => set.reps === firstSetReps);
  
  if (allSameReps) {
    return `${exercise.sets.length} × ${firstSetReps || '-'}`;
  } else {
    // Show range if different
    return `${exercise.sets.length} sets with varied reps`;
  }
};

export const formatCombinedWorkoutDetails = (workout: Exercise[]): string => {
  const totalSets = workout.reduce((total, ex) => total + ex.sets.length, 0);
  const uniqueExercises = new Set(workout.map(ex => ex.name)).size;
  
  return `${uniqueExercises} exercises • ${totalSets} sets`;
};
