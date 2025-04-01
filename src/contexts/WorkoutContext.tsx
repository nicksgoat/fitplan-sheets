
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { v4 } from "uuid";
import {
  WorkoutProgram,
  WorkoutWeek,
  Workout,
  Exercise,
  Set,
  RepType,
  IntensityType,
  WeightType,
  WorkoutType,
  Circuit
} from "@/types/workout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { addWorkoutToLibrary, getWorkoutLibrary } from "@/utils/presets";

// WorkoutContextType interface
interface WorkoutContextType {
  // State
  program: WorkoutProgram | null;
  activeWeekId: string | null;
  activeWorkoutId: string | null;
  
  // Setters
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram | null>>;
  setActiveWeekId: (weekId: string | null) => void;
  setActiveWorkoutId: (workoutId: string | null) => void;
  
  // CRUD operations for workout structures
  addWeek: (programId?: string) => string;
  addWorkout: (weekId: string) => string;
  addExercise: (workoutId: string) => void;
  addSet: (workoutId: string, exerciseId: string, initialData?: Partial<Set>) => void;
  
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  updateWorkout: (workoutId: string, updates: Partial<Workout> | ((workout: Workout) => void)) => void;
  updateWorkoutName: (workoutId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  
  updateExercise: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => void;
  updateSet: (
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<Set>
  ) => void;
  
  deleteWeek: (programId: string, weekId: string) => void;
  deleteWorkout: (weekId: string, workoutId: string) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => void;
  
  duplicateWorkout: (weekId: string, workoutId: string) => void;
  duplicateExercise: (workoutId: string, exerciseId: string) => void;
  
  // Circuit operations
  createCircuit: (workoutId: string) => void;
  createSuperset: (workoutId: string) => void;
  createEMOM: (workoutId: string) => void;
  createAMRAP: (workoutId: string) => void;
  createTabata: (workoutId: string) => void;
  
  // Library operations
  resetProgram: () => void;
  loadSampleProgram: () => void;
  saveWorkoutToLibrary: (workoutId: string, name: string) => void;
  saveWeekToLibrary: (weekId: string, name: string) => void;
  saveProgramToLibrary: (name: string) => void;
  loadWorkoutFromLibrary: (workout: Workout, weekId: string) => void;
  loadWeekFromLibrary: (week: WorkoutWeek) => void;
  loadProgramFromLibrary: (program: WorkoutProgram) => void;
  getWorkoutLibrary: () => Workout[];
  getWeekLibrary: () => WorkoutWeek[];
  getProgramLibrary: () => WorkoutProgram[];
  removeWorkoutFromLibrary: (workoutId: string) => void;
  removeWeekFromLibrary: (weekId: string) => void;
  removeProgramFromLibrary: (programId: string) => void;
  
  // Utility operations
  getExerciseDetails: (exerciseId: string) => Exercise | undefined;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  // Main program state
  const [program, setProgram] = useLocalStorage<WorkoutProgram | null>(
    "workoutProgram",
    null
  );
  
  // Active state trackers
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  // Initialize program if it doesn't exist
  useEffect(() => {
    if (!program) {
      const initialProgram: WorkoutProgram = {
        id: v4(),
        name: "New Program",
        weeks: [],
        workouts: []
      };
      
      setProgram(initialProgram);
    }
  }, [setProgram, program]);

  const addWeek = (programId?: string) => {
    let newWeekId = "";
    
    setProgram((prev) => {
      if (!prev) return prev;

      const newWeek: WorkoutWeek = {
        id: v4(),
        name: `Week ${prev.weeks.length + 1}`,
        workouts: [],
        order: prev.weeks.length + 1
      };
      
      newWeekId = newWeek.id;
      
      return {
        ...prev,
        weeks: [...prev.weeks, newWeek],
      };
    });
    
    return newWeekId;
  };

  const addWorkout = (weekId: string) => {
    let newWorkoutId = "";
    
    setProgram((prev) => {
      if (!prev) return prev;
      
      // Find the week
      const week = prev.weeks.find(w => w.id === weekId);
      if (!week) return prev;
      
      // Create new workout
      const newWorkout: Workout = {
        id: v4(),
        name: `Day ${week.workouts.length + 1} Workout`,
        day: week.workouts.length + 1,
        exercises: [],
        circuits: [],
        weekId: weekId
      };
      
      newWorkoutId = newWorkout.id;
      
      // Update week's workout list
      const updatedWeeks = prev.weeks.map(w => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          workouts: [...w.workouts, newWorkout.id]
        };
      });
      
      // Add workout to program's workout array
      return {
        ...prev,
        weeks: updatedWeeks,
        workouts: [...prev.workouts, newWorkout]
      };
    });
    
    return newWorkoutId;
  };

  const addExercise = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      // Find the workout
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      // Create new exercise
      const newExercise: Exercise = {
        id: v4(),
        name: "New Exercise",
        sets: [{ id: v4(), reps: "", weight: "", intensity: "", rest: "" }],
        isCircuit: false,
        isInCircuit: false,
        circuitId: null,
        circuitOrder: null,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds",
      };
      
      // Update workout with new exercise
      const updatedWorkout = {
        ...prev.workouts[workoutIndex],
        exercises: [...prev.workouts[workoutIndex].exercises, newExercise]
      };
      
      // Update workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  // Add this custom function to the context provider that supports copying data from the previous set
  const addSet = (workoutId: string, exerciseId: string, initialData?: Partial<Set>) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      // Find workout and exercise
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) return prev;
      
      const exercise = workout.exercises[exerciseIndex];
      
      // Create a new set with either initial data or empty values
      const newSet: Set = {
        id: v4(),
        reps: initialData?.reps || "",
        weight: initialData?.weight || "",
        intensity: initialData?.intensity || "",
        rest: initialData?.rest || "",
        intensityType: initialData?.intensityType || exercise.intensityType || "rpe",
        weightType: initialData?.weightType || exercise.weightType || "pounds",
      };
      
      // Update exercise with new set
      const updatedExercise = {
        ...exercise,
        sets: [...exercise.sets, newSet]
      };
      
      // Update workout's exercises
      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex] = updatedExercise;
      
      // Update workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      // Update workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  const updateWeek = (weekId: string, updates: Partial<WorkoutWeek>) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWeeks = prev.weeks.map((week) => {
        if (week.id !== weekId) return week;
        return { ...week, ...updates };
      });

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };
  
  const updateWeekName = (weekId: string, name: string) => {
    updateWeek(weekId, { name });
  };

  const updateWorkout = (workoutId: string, updates: Partial<Workout> | ((workout: Workout) => void)) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const updatedWorkouts = [...prev.workouts];
      
      if (typeof updates === 'function') {
        // Updates is a function that modifies the workout
        const workoutCopy = { ...updatedWorkouts[workoutIndex] };
        updates(workoutCopy);
        updatedWorkouts[workoutIndex] = workoutCopy;
      } else {
        // Updates is a partial workout object
        updatedWorkouts[workoutIndex] = {
          ...updatedWorkouts[workoutIndex],
          ...updates
        };
      }
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  const updateWorkoutName = (workoutId: string, name: string) => {
    updateWorkout(workoutId, { name });
  };

  const updateExercise = (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      const updatedExercises = workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return { ...exercise, ...updates };
      });

      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;

      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  const updateSet = (
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<Set>
  ) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) return prev;
      
      const exercise = workout.exercises[exerciseIndex];
      
      // Update the specific set
      const updatedSets = exercise.sets.map((set) => {
        if (set.id !== setId) return set;
        return { ...set, ...updates };
      });
      
      // Update the exercise with the new sets
      const updatedExercise = {
        ...exercise,
        sets: updatedSets
      };
      
      // Update the workout's exercises
      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex] = updatedExercise;
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;

      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  const deleteWeek = (programId: string, weekId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      // Remove all workouts that belong to this week
      const workoutsToRemove = prev.weeks.find(w => w.id === weekId)?.workouts || [];
      const updatedWorkouts = prev.workouts.filter(w => !workoutsToRemove.includes(w.id));
      
      // Remove the week
      const updatedWeeks = prev.weeks.filter(week => week.id !== weekId);

      return {
        ...prev,
        weeks: updatedWeeks,
        workouts: updatedWorkouts
      };
    });
  };

  const deleteWorkout = (weekId: string, workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      // Update the week to remove the workout reference
      const updatedWeeks = prev.weeks.map(week => {
        if (week.id !== weekId) return week;
        return {
          ...week,
          workouts: week.workouts.filter(id => id !== workoutId)
        };
      });
      
      // Remove the actual workout from the workouts array
      const updatedWorkouts = prev.workouts.filter(w => w.id !== workoutId);

      return {
        ...prev,
        weeks: updatedWeeks,
        workouts: updatedWorkouts
      };
    });
  };

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Filter out the exercise to delete
      const updatedExercises = workout.exercises.filter(e => e.id !== exerciseId);
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;

      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  const deleteSet = (workoutId: string, exerciseId: string, setId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex === -1) return prev;
      
      const exercise = workout.exercises[exerciseIndex];
      
      // Filter out the set to delete
      const updatedSets = exercise.sets.filter(s => s.id !== setId);
      
      // Ensure at least one set remains
      if (updatedSets.length === 0) {
        // If no sets would remain, add a blank one
        updatedSets.push({
          id: v4(),
          reps: "",
          weight: "",
          intensity: "",
          rest: ""
        });
      }
      
      // Update the exercise
      const updatedExercise = {
        ...exercise,
        sets: updatedSets
      };
      
      // Update the workout's exercises
      const updatedExercises = [...workout.exercises];
      updatedExercises[exerciseIndex] = updatedExercise;
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;

      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };

  const duplicateWorkout = (weekId: string, workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      // Find the week and workout to duplicate
      const week = prev.weeks.find(w => w.id === weekId);
      const workoutToDuplicate = prev.workouts.find(w => w.id === workoutId);
      
      if (!week || !workoutToDuplicate) return prev;
      
      // Create a deep copy of the workout with new IDs
      const duplicatedWorkout: Workout = {
        ...workoutToDuplicate,
        id: v4(),
        name: `${workoutToDuplicate.name} (Copy)`,
        day: week.workouts.length + 1,
        exercises: workoutToDuplicate.exercises.map(exercise => ({
          ...exercise,
          id: v4(),
          sets: exercise.sets.map(set => ({ ...set, id: v4() })),
        })),
        circuits: workoutToDuplicate.circuits.map(circuit => ({
          ...circuit,
          id: v4()
        }))
      };
      
      // Update the week to include the new workout
      const updatedWeeks = prev.weeks.map(w => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          workouts: [...w.workouts, duplicatedWorkout.id]
        };
      });
      
      // Add the new workout to the workouts array
      return {
        ...prev,
        weeks: updatedWeeks,
        workouts: [...prev.workouts, duplicatedWorkout]
      };
    });
  };

  const duplicateExercise = (workoutId: string, exerciseId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      const exerciseToDuplicate = workout.exercises.find(e => e.id === exerciseId);
      
      if (!exerciseToDuplicate) return prev;
      
      // Create a deep copy of the exercise with new IDs
      const duplicatedExercise: Exercise = {
        ...exerciseToDuplicate,
        id: v4(),
        name: `${exerciseToDuplicate.name} (Copy)`,
        sets: exerciseToDuplicate.sets.map(set => ({ ...set, id: v4() })),
      };
      
      // Update the workout with the new exercise
      const updatedExercises = [...workout.exercises, duplicatedExercise];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  // Circuit creation methods
  const createCircuit = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Create a new circuit
      const newCircuit: Circuit = {
        id: v4(),
        name: "New Circuit",
        exercises: [],
        rounds: "3",
        restBetweenExercises: "30s",
        restBetweenRounds: "60s"
      };
      
      // Create two new exercises for the circuit
      const exercise1: Exercise = {
        id: v4(),
        name: "Circuit Exercise 1",
        sets: [{ id: v4(), reps: "10", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 0,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      const exercise2: Exercise = {
        id: v4(),
        name: "Circuit Exercise 2",
        sets: [{ id: v4(), reps: "10", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 1,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      // Update the circuit with the exercise IDs
      newCircuit.exercises = [exercise1.id, exercise2.id];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: [...workout.exercises, exercise1, exercise2],
        circuits: [...(workout.circuits || []), newCircuit]
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  const createSuperset = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Create a new circuit (superset)
      const newCircuit: Circuit = {
        id: v4(),
        name: "Superset",
        exercises: [],
        rounds: "3",
        restBetweenExercises: "0s",
        restBetweenRounds: "60s"
      };
      
      // Create two new exercises for the superset
      const exercise1: Exercise = {
        id: v4(),
        name: "Superset Exercise A",
        sets: [{ id: v4(), reps: "10", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 0,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      const exercise2: Exercise = {
        id: v4(),
        name: "Superset Exercise B",
        sets: [{ id: v4(), reps: "10", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 1,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      // Update the circuit with the exercise IDs
      newCircuit.exercises = [exercise1.id, exercise2.id];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: [...workout.exercises, exercise1, exercise2],
        circuits: [...(workout.circuits || []), newCircuit]
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  const createEMOM = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Create a new circuit (EMOM)
      const newCircuit: Circuit = {
        id: v4(),
        name: "EMOM - 10 minutes",
        exercises: [],
        rounds: "10",
        restBetweenExercises: "0s",
        restBetweenRounds: "0s"
      };
      
      // Create an exercise for the EMOM
      const exercise: Exercise = {
        id: v4(),
        name: "EMOM Exercise",
        sets: [{ id: v4(), reps: "AMRAP", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 0,
        notes: "Complete as many reps as possible within 50 seconds, rest for the remainder of the minute",
        repType: "amrap",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      // Update the circuit with the exercise ID
      newCircuit.exercises = [exercise.id];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: [...workout.exercises, exercise],
        circuits: [...(workout.circuits || []), newCircuit]
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  const createAMRAP = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Create a new circuit (AMRAP)
      const newCircuit: Circuit = {
        id: v4(),
        name: "AMRAP - 10 minutes",
        exercises: [],
        rounds: "AMRAP",
        restBetweenExercises: "0s",
        restBetweenRounds: "0s"
      };
      
      // Create exercises for the AMRAP
      const exercise1: Exercise = {
        id: v4(),
        name: "Push-ups",
        sets: [{ id: v4(), reps: "10", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 0,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      const exercise2: Exercise = {
        id: v4(),
        name: "Sit-ups",
        sets: [{ id: v4(), reps: "15", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 1,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      const exercise3: Exercise = {
        id: v4(),
        name: "Air Squats",
        sets: [{ id: v4(), reps: "20", weight: "", intensity: "", rest: "" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 2,
        notes: "",
        repType: "fixed",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      // Update the circuit with the exercise IDs
      newCircuit.exercises = [exercise1.id, exercise2.id, exercise3.id];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: [...workout.exercises, exercise1, exercise2, exercise3],
        circuits: [...(workout.circuits || []), newCircuit]
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  const createTabata = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const workoutIndex = prev.workouts.findIndex(w => w.id === workoutId);
      if (workoutIndex === -1) return prev;
      
      const workout = prev.workouts[workoutIndex];
      
      // Create a new circuit (Tabata)
      const newCircuit: Circuit = {
        id: v4(),
        name: "Tabata - 4 minutes",
        exercises: [],
        rounds: "8",
        restBetweenExercises: "10s",
        restBetweenRounds: "0s"
      };
      
      // Create an exercise for the Tabata
      const exercise: Exercise = {
        id: v4(),
        name: "Tabata Exercise",
        sets: [{ id: v4(), reps: "20s", weight: "", intensity: "", rest: "10s" }],
        isInCircuit: true,
        circuitId: newCircuit.id,
        circuitOrder: 0,
        notes: "Work for 20 seconds, rest for 10 seconds, repeat 8 times",
        repType: "time",
        intensityType: "rpe",
        weightType: "pounds"
      };
      
      // Update the circuit with the exercise ID
      newCircuit.exercises = [exercise.id];
      
      // Update the workout
      const updatedWorkout = {
        ...workout,
        exercises: [...workout.exercises, exercise],
        circuits: [...(workout.circuits || []), newCircuit]
      };
      
      // Update the workouts array
      const updatedWorkouts = [...prev.workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      return {
        ...prev,
        workouts: updatedWorkouts
      };
    });
  };
  
  // Library operations
  const resetProgram = () => {
    const newProgram: WorkoutProgram = {
      id: v4(),
      name: "New Program",
      weeks: [],
      workouts: []
    };
    
    setProgram(newProgram);
    setActiveWeekId(null);
    setActiveWorkoutId(null);
    
    // Create initial week and workout
    setTimeout(() => {
      const weekId = addWeek();
      if (weekId) {
        setActiveWeekId(weekId);
        const workoutId = addWorkout(weekId);
        if (workoutId) {
          setActiveWorkoutId(workoutId);
        }
      }
    }, 0);
  };
  
  const loadSampleProgram = () => {
    // Create a sample program
    const newProgram: WorkoutProgram = {
      id: v4(),
      name: "Sample Training Program",
      weeks: [],
      workouts: []
    };
    
    setProgram(newProgram);
    setActiveWeekId(null);
    setActiveWorkoutId(null);
    
    // Queue up the creation of the sample program structure
    setTimeout(() => {
      // Create Week 1
      const week1Id = addWeek();
      if (!week1Id) return;
      
      // Create workouts for Week 1
      const workout1Id = addWorkout(week1Id);
      if (!workout1Id) return;
      
      setActiveWeekId(week1Id);
      setActiveWorkoutId(workout1Id);
      
      // Update workout names
      updateWorkoutName(workout1Id, "Day 1: Upper Body");
      
      // Add exercises to Day 1
      setTimeout(() => {
        if (!workout1Id) return;
        
        // Add exercises to Day 1
        addExercise(workout1Id);
        addExercise(workout1Id);
        addExercise(workout1Id);
        
        // Queue updating exercise details
        setTimeout(() => {
          const workout = program?.workouts.find(w => w.id === workout1Id);
          if (!workout || workout.exercises.length < 3) return;
          
          // Update exercise names and details
          updateExercise(workout1Id, workout.exercises[0].id, {
            name: "Bench Press",
            notes: "Focus on form and control"
          });
          
          updateExercise(workout1Id, workout.exercises[1].id, {
            name: "Barbell Row",
            notes: "Keep back straight"
          });
          
          updateExercise(workout1Id, workout.exercises[2].id, {
            name: "Shoulder Press",
            notes: "Use lighter weight if needed"
          });
          
          // Update sets for the exercises
          if (workout.exercises[0].sets.length > 0) {
            updateSet(workout1Id, workout.exercises[0].id, workout.exercises[0].sets[0].id, {
              reps: "8-10",
              weight: "135",
              intensity: "7",
              rest: "90s"
            });
          }
          
          // Add more sets to Bench Press
          addSet(workout1Id, workout.exercises[0].id, {
            reps: "8-10",
            weight: "135",
            intensity: "7",
            rest: "90s"
          });
          
          addSet(workout1Id, workout.exercises[0].id, {
            reps: "8-10",
            weight: "135",
            intensity: "7",
            rest: "90s"
          });
          
          // Add Day 2 workout
          const workout2Id = addWorkout(week1Id);
          if (workout2Id) {
            updateWorkoutName(workout2Id, "Day 2: Lower Body");
            
            // Add exercises to Day 2
            addExercise(workout2Id);
            
            // Queue updating exercise details for Day 2
            setTimeout(() => {
              const workout2 = program?.workouts.find(w => w.id === workout2Id);
              if (!workout2 || workout2.exercises.length < 1) return;
              
              updateExercise(workout2Id, workout2.exercises[0].id, {
                name: "Squats",
                notes: "Go deep but maintain form"
              });
              
              // Create a Week 2
              const week2Id = addWeek();
              if (week2Id) {
                // Add a workout to Week 2
                const week2Workout1Id = addWorkout(week2Id);
                if (week2Workout1Id) {
                  updateWorkoutName(week2Workout1Id, "Day 1: Full Body");
                }
              }
            }, 100);
          }
        }, 100);
      }, 100);
    }, 100);
  };
  
  // Library management function stubs
  const saveWorkoutToLibrary = (workoutId: string, name: string) => {
    // This would normally save to your database or localStorage
    toast.success(`Workout "${name}" saved to library`);
  };
  
  const saveWeekToLibrary = (weekId: string, name: string) => {
    toast.success(`Week "${name}" saved to library`);
  };
  
  const saveProgramToLibrary = (name: string) => {
    toast.success(`Program "${name}" saved to library`);
  };
  
  const loadWorkoutFromLibrary = (workout: Workout, weekId: string) => {
    // This would load a workout from your library into the current program
    toast.success(`Workout "${workout.name}" loaded from library`);
  };
  
  const loadWeekFromLibrary = (week: WorkoutWeek) => {
    toast.success(`Week "${week.name}" loaded from library`);
  };
  
  const loadProgramFromLibrary = (program: WorkoutProgram) => {
    toast.success(`Program "${program.name}" loaded from library`);
  };
  
  const getWorkoutLibrary = () => {
    // This would normally fetch from your database or localStorage
    return [];
  };
  
  const getWeekLibrary = () => {
    return [];
  };
  
  const getProgramLibrary = () => {
    return [];
  };
  
  const removeWorkoutFromLibrary = (workoutId: string) => {
    toast.success("Workout removed from library");
  };
  
  const removeWeekFromLibrary = (weekId: string) => {
    toast.success("Week removed from library");
  };
  
  const removeProgramFromLibrary = (programId: string) => {
    toast.success("Program removed from library");
  };
  
  // Utility functions
  const getExerciseDetails = (exerciseId: string): Exercise | undefined => {
    // Loop through all workouts to find the exercise
    for (const workout of program?.workouts || []) {
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      if (exercise) return exercise;
    }
    return undefined;
  };

  const contextValue: WorkoutContextType = {
    program,
    activeWeekId,
    activeWorkoutId,
    setProgram,
    setActiveWeekId,
    setActiveWorkoutId,
    addWeek,
    addWorkout,
    addExercise,
    addSet,
    updateWeek,
    updateWorkout,
    updateWorkoutName,
    updateWeekName,
    updateExercise,
    updateSet,
    deleteWeek,
    deleteWorkout,
    deleteExercise,
    deleteSet,
    duplicateWorkout,
    duplicateExercise,
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata,
    resetProgram,
    loadSampleProgram,
    saveWorkoutToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
    loadWorkoutFromLibrary,
    loadWeekFromLibrary,
    loadProgramFromLibrary,
    getWorkoutLibrary,
    getWeekLibrary,
    getProgramLibrary,
    removeWorkoutFromLibrary, 
    removeWeekFromLibrary,
    removeProgramFromLibrary,
    getExerciseDetails
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};

export { WorkoutProvider, useWorkout };
