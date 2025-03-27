
import { Exercise, Set } from "@/types/workout";

export const formatRestTime = (restSeconds: string): string => {
  if (!restSeconds) return '';
  
  if (restSeconds.includes('s') || restSeconds.includes('min') || 
      restSeconds.includes('m') || restSeconds.includes(':')) {
    return restSeconds;
  }
  
  const seconds = parseInt(restSeconds);
  if (isNaN(seconds)) return restSeconds;
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  }
};

export const getRepRange = (exercise: Exercise): string => {
  if (!exercise.sets || exercise.sets.length === 0) return '';
  
  const repsValues = exercise.sets
    .map((set: Set) => {
      if (typeof set.reps === 'string' && set.reps.includes('-')) {
        return set.reps.split('-').map(Number);
      }
      return [Number(set.reps), Number(set.reps)];
    })
    .flat()
    .filter((val: number) => !isNaN(val));

  const minReps = Math.min(...repsValues);
  const maxReps = Math.max(...repsValues);

  const repRange = minReps === maxReps 
    ? `${minReps} reps` 
    : `${minReps}-${maxReps} reps`;

  return `${exercise.sets.length} sets, ${repRange}`;
};

export const getOrganizedExercises = (exercises: Exercise[]) => {
  const result = [];
  const circuitMap = new Map();
  
  for (const exercise of exercises) {
    if (exercise.isCircuit) {
      result.push(exercise);
    } else if (exercise.isInCircuit && exercise.circuitId) {
      if (!circuitMap.has(exercise.circuitId)) {
        circuitMap.set(exercise.circuitId, []);
      }
      circuitMap.get(exercise.circuitId).push(exercise);
    } else if (exercise.isGroup) {
      result.push(exercise);
    } else if (!exercise.groupId && !exercise.isInCircuit) {
      result.push(exercise);
    }
  }
  
  const finalResult = [];
  
  for (const exercise of result) {
    finalResult.push(exercise);
  }
  
  return { exercises: finalResult, circuitMap };
};
