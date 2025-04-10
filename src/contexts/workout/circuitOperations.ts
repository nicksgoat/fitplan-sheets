
import { v4 as uuidv4 } from "uuid";
import { 
  createCircuitExercise, 
  createExerciseForCircuit,
  createSupersetExercise,
  createEMOMExercise,
  createAMRAPExercise,
  createTabataExercise
} from "./workoutOperations";

export const setupCircuit = (updateWorkout: Function, workoutId: string) => {
  const circuitId = uuidv4();
  
  updateWorkout(workoutId, (workout: any) => {
    const circuitExercise = createCircuitExercise(circuitId);
    
    workout.exercises.push(circuitExercise);
    
    const exercise1 = createExerciseForCircuit(
      circuitId,
      "Exercise 1", 
      "10", 
      "30s"
    );
    
    const exercise2 = createExerciseForCircuit(
      circuitId,
      "Exercise 2", 
      "10", 
      "30s"
    );
    
    workout.exercises.push(exercise1, exercise2);
  });
};

export const setupSuperset = (updateWorkout: Function, workoutId: string) => {
  const circuitId = uuidv4();
  
  updateWorkout(workoutId, (workout: any) => {
    const supersetExercise = createSupersetExercise(circuitId);
    
    workout.exercises.push(supersetExercise);
    
    const exercise1 = createExerciseForCircuit(
      circuitId,
      "Exercise A", 
      "12", 
      "0s"
    );
    
    const exercise2 = createExerciseForCircuit(
      circuitId,
      "Exercise B", 
      "12", 
      "60s"
    );
    
    workout.exercises.push(exercise1, exercise2);
  });
};

export const setupEMOM = (updateWorkout: Function, workoutId: string) => {
  const circuitId = uuidv4();
  
  updateWorkout(workoutId, (workout: any) => {
    const emomExercise = createEMOMExercise(circuitId);
    
    workout.exercises.push(emomExercise);
    
    const exercise1 = createExerciseForCircuit(
      circuitId,
      "Even Minutes", 
      "10", 
      "0s"
    );
    
    const exercise2 = createExerciseForCircuit(
      circuitId,
      "Odd Minutes", 
      "8", 
      "0s"
    );
    
    workout.exercises.push(exercise1, exercise2);
  });
};

export const setupAMRAP = (updateWorkout: Function, workoutId: string) => {
  const circuitId = uuidv4();
  
  updateWorkout(workoutId, (workout: any) => {
    const amrapExercise = createAMRAPExercise(circuitId);
    
    workout.exercises.push(amrapExercise);
    
    const exercise1 = createExerciseForCircuit(
      circuitId,
      "Exercise 1", 
      "10", 
      "0s"
    );
    
    const exercise2 = createExerciseForCircuit(
      circuitId,
      "Exercise 2", 
      "15", 
      "0s"
    );
    
    const exercise3 = createExerciseForCircuit(
      circuitId,
      "Exercise 3", 
      "20", 
      "0s"
    );
    
    workout.exercises.push(exercise1, exercise2, exercise3);
  });
};

export const setupTabata = (updateWorkout: Function, workoutId: string) => {
  const circuitId = uuidv4();
  
  updateWorkout(workoutId, (workout: any) => {
    const tabataExercise = createTabataExercise(circuitId);
    
    workout.exercises.push(tabataExercise);
    
    const exercise1 = createExerciseForCircuit(
      circuitId,
      "Tabata Exercise", 
      "20s", 
      "10s"
    );
    
    exercise1.notes = "Max effort for 20 seconds, then rest 10 seconds. Repeat 8 times.";
    exercise1.repType = "time";
    
    workout.exercises.push(exercise1);
  });
};
