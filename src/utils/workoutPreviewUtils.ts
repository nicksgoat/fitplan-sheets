
import { Exercise, Set } from "@/types/workout";

/**
 * Format rest time for display
 */
export function formatRestTime(rest: string): string {
  if (!rest) return "-";
  
  // If rest is just seconds (e.g. "60")
  if (!isNaN(Number(rest))) {
    const seconds = Number(rest);
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes}m`;
      } else {
        return `${minutes}m ${remainingSeconds}s`;
      }
    }
  }
  
  // If rest already has a format (e.g. "60s" or "1m")
  return rest;
}

/**
 * Get a condensed representation of the rep scheme
 */
export function getRepRange(exercise: Exercise): string {
  if (!exercise.sets || exercise.sets.length === 0) {
    return "0 sets";
  }
  
  // For circuits, show the number of exercises
  if (exercise.isCircuit) {
    return "Circuit";
  }
  
  const sets = exercise.sets.length;
  const firstSet = exercise.sets[0];
  const lastSet = exercise.sets[exercise.sets.length - 1];
  
  let repsText = "";
  
  // If all sets have the same reps
  if (exercise.sets.every(set => set.reps === firstSet.reps)) {
    repsText = `${sets} × ${firstSet.reps || "-"}`;
  } 
  // If descending/ascending reps
  else {
    repsText = `${sets} sets: ${firstSet.reps || "-"} → ${lastSet.reps || "-"}`;
  }
  
  // Add weight if all sets have the same weight and it's not empty
  if (firstSet.weight && exercise.sets.every(set => set.weight === firstSet.weight)) {
    repsText += ` @ ${firstSet.weight}`;
  }
  
  return repsText;
}
