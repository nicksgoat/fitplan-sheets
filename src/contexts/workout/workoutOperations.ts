
import { v4 as uuidv4 } from "uuid";
import { Exercise, Set, Workout } from "@/types/workout";
import { libraryToWorkoutExercise } from "@/utils/exerciseConverters";

export const createNewWorkout = (weekId: string, dayNumber: number): Workout => {
  return {
    id: uuidv4(),
    name: `Day ${dayNumber}`,
    day: dayNumber,
    exercises: [createNewExercise()],
    circuits: [],
    weekId: weekId,
  };
};

export const createNewExercise = (): Exercise => {
  return {
    id: uuidv4(),
    name: "New Exercise",
    sets: [createNewSet()],
    notes: "",
  };
};

export const createNewSet = (): Set => {
  return {
    id: uuidv4(),
    reps: "",
    weight: "",
    intensity: "",
    rest: "",
  };
};

export const createCircuitExercise = (circuitId: string): Exercise => {
  return {
    id: uuidv4(),
    name: "Circuit",
    sets: [],
    notes: "Perform exercises in sequence with minimal rest",
    isCircuit: true,
    circuitId,
  };
};

export const createExerciseForCircuit = (circuitId: string, name: string, reps: string, rest: string): Exercise => {
  return {
    id: uuidv4(),
    name,
    sets: [{ id: uuidv4(), reps, weight: "", intensity: "", rest }],
    notes: "",
    isInCircuit: true,
    circuitId,
  };
};

export const createSupersetExercise = (circuitId: string): Exercise => {
  return {
    id: uuidv4(),
    name: "Superset",
    sets: [],
    notes: "Perform these exercises back-to-back with no rest between",
    isCircuit: true,
    circuitId,
  };
};

export const createEMOMExercise = (circuitId: string): Exercise => {
  return {
    id: uuidv4(),
    name: "EMOM - 10 min",
    sets: [],
    notes: "Every Minute On the Minute for 10 minutes",
    isCircuit: true,
    circuitId,
  };
};

export const createAMRAPExercise = (circuitId: string): Exercise => {
  return {
    id: uuidv4(),
    name: "AMRAP - 12 min",
    sets: [],
    notes: "As Many Rounds As Possible in 12 minutes",
    isCircuit: true,
    circuitId,
  };
};

export const createTabataExercise = (circuitId: string): Exercise => {
  return {
    id: uuidv4(),
    name: "Tabata - 4 min",
    sets: [],
    notes: "8 rounds of 20s work, 10s rest",
    isCircuit: true,
    circuitId,
  };
};

export const convertFromLibraryExercise = (
  libraryExercise: any,
  libraryExercises: any[]
) => {
  if (libraryExercise && libraryExercises) {
    const foundExercise = libraryExercises.find(e => e.id === libraryExercise);
    if (foundExercise) {
      return libraryToWorkoutExercise(foundExercise);
    }
  }
  
  return createNewExercise();
};
