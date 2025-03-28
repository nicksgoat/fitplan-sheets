import React, { createContext, useContext, useState, useEffect } from "react";
import { Exercise, Set, WorkoutProgram, Workout, Circuit, WorkoutType, WorkoutWeek } from "@/types/workout";
import { 
  createEmptyProgram, 
  addExerciseToWorkout, 
  updateExerciseInWorkout,
  updateSetInExercise,
  addSetToExercise,
  deleteSetFromExercise,
  deleteExerciseFromWorkout,
  addWorkoutToProgram,
  addWeekToProgram,
  updateWorkoutInProgram,
  updateWeekInProgram,
  deleteWorkoutFromProgram,
  deleteWeekFromProgram,
  sampleProgram,
  cloneWorkout,
  saveCurrentWorkoutAsPreset,
  saveCurrentWeekAsPreset,
  copyProgramAsPreset,
  generateId
} from "@/utils/workout";
import {
  addWorkoutToLibrary,
  addWeekToLibrary,
  addProgramToLibrary,
  getWorkoutLibrary,
  getWeekLibrary,
  getProgramLibrary,
  removeWorkoutFromLibrary,
  removeWeekFromLibrary,
  removeProgramFromLibrary,
  saveWorkoutPreset,
  saveWeekPreset,
  saveProgramPreset,
  getWorkoutPresets,
  getWeekPresets,
  getProgramPresets,
  deleteWorkoutPreset,
  deleteWeekPreset,
  deleteProgramPreset,
  // Compatibility functions
  getSessionLibrary,
  addSessionToLibrary,
  removeSessionFromLibrary,
  saveSessionPreset,
  getSessionPresets,
  deleteSessionPreset
} from "@/utils/presets";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface WorkoutContextType {
  program: WorkoutProgram;
  activeWorkoutId: string | null;
  activeWeekId: string | null;
  setActiveWorkoutId: (id: string | null) => void;
  setActiveWeekId: (id: string | null) => void;
  updateWorkoutName: (workoutId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  updateExercise: (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  addExercise: (workoutId: string, afterExerciseId?: string) => void;
  addSet: (workoutId: string, exerciseId: string) => void;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  addWorkout: (weekId: string, afterWorkoutId?: string) => void;
  addWeek: (afterWeekId?: string) => void;
  deleteWorkout: (workoutId: string) => void;
  deleteWeek: (weekId: string) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  createCircuit: (workoutId: string) => void;
  createSuperset: (workoutId: string) => void;
  createEMOM: (workoutId: string) => void;
  createAMRAP: (workoutId: string) => void;
  createTabata: (workoutId: string) => void;
  updateCircuit: (workoutId: string, circuitId: string, updates: Partial<Circuit>) => void;
  deleteCircuit: (workoutId: string, circuitId: string) => void;
  addExerciseToCircuit: (workoutId: string, circuitId: string, exerciseId: string) => void;
  removeExerciseFromCircuit: (workoutId: string, circuitId: string, exerciseId: string) => void;
  saveWorkoutAsPreset: (workoutId: string, name: string) => void;
  saveWeekAsPreset: (weekId: string, name: string) => void;
  saveProgramAsPreset: (name: string) => void;
  loadWorkoutPreset: (preset: Workout, weekId: string) => void;
  loadWeekPreset: (preset: WorkoutWeek) => void;
  loadProgramPreset: (preset: WorkoutProgram) => void;
  getWorkoutPresets: () => Workout[];
  getWeekPresets: () => WorkoutWeek[];
  getProgramPresets: () => WorkoutProgram[];
  deleteWorkoutPreset: (presetId: string) => void;
  deleteWeekPreset: (presetId: string) => void;
  deleteProgramPreset: (presetId: string) => void;
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
  // Compatibility functions
  saveSessionAsPreset: (sessionId: string, name: string) => void;
  loadSessionPreset: (preset: Workout, weekId: string) => void;
  getSessionPresets: () => Workout[];
  deleteSessionPreset: (presetId: string) => void;
  saveSessionToLibrary: (sessionId: string, name: string) => void;
  loadSessionFromLibrary: (session: Workout, weekId: string) => void;
  getSessionLibrary: () => Workout[];
  removeSessionFromLibrary: (sessionId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWeekId && program.weeks.length > 0) {
      setActiveWeekId(program.weeks[0].id);
    }
    
    if (activeWeekId && (!activeWorkoutId || !program.workouts?.some(s => s.id === activeWorkoutId))) {
      const currentWeek = program.weeks.find(w => w.id === activeWeekId);
      if (currentWeek && currentWeek.workouts && currentWeek.workouts.length > 0) {
        const firstWorkoutId = currentWeek.workouts[0];
        if (program.workouts?.some(s => s.id === firstWorkoutId)) {
          setActiveWorkoutId(firstWorkoutId);
        }
      }
    }
  }, [program, activeWeekId, activeWorkoutId]);

  const updateWorkoutName = (workoutId: string, name: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) =>
        workout.id === workoutId ? { ...workout, name } : workout
      );
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };

  const updateWeekName = (weekId: string, name: string) => {
    setProgram((prevProgram) => {
      const updatedWeeks = prevProgram.weeks.map((week) =>
        week.id === weekId ? { ...week, name } : week
      );
      return { ...prevProgram, weeks: updatedWeeks };
    });
  };

  const updateExercise = (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return updateExerciseInWorkout(workout, exerciseId, updates);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };

  const updateSet = (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return updateSetInExercise(workout, exerciseId, setId, updates);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };

  const addExercise = (workoutId: string, afterExerciseId?: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return addExerciseToWorkout(workout, afterExerciseId);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    toast.success("Exercise added");
  };

  const addSet = (workoutId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return addSetToExercise(workout, exerciseId);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    toast.success("Set added");
  };

  const deleteSet = (workoutId: string, exerciseId: string, setId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return deleteSetFromExercise(workout, exerciseId, setId);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    toast.success("Set deleted");
  };

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const workout = prevProgram.workouts.find(s => s.id === workoutId);
      if (!workout || workout.exercises.length <= 1) {
        toast.error("Cannot delete the last exercise");
        return prevProgram;
      }
      
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return deleteExerciseFromWorkout(workout, exerciseId);
      });
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    toast.success("Exercise deleted");
  };

  const addWorkout = (weekId: string, afterWorkoutId?: string) => {
    setProgram((prevProgram) => {
      const updatedProgram = addWorkoutToProgram(prevProgram, weekId, afterWorkoutId);
      
      const newWorkout = updatedProgram.workouts[updatedProgram.workouts.length - 1];
      setActiveWorkoutId(newWorkout.id);
      
      return updatedProgram;
    });
    toast.success("Workout added");
  };

  const addWeek = (afterWeekId?: string) => {
    setProgram((prevProgram) => {
      const updatedProgram = addWeekToProgram(prevProgram, afterWeekId);
      
      const newWeek = updatedProgram.weeks[updatedProgram.weeks.length - 1];
      const newWorkoutId = newWeek.workouts[0];
      
      setActiveWeekId(newWeek.id);
      setActiveWorkoutId(newWorkoutId);
      
      return updatedProgram;
    });
    toast.success("Week added");
  };

  const deleteWorkout = (workoutId: string) => {
    setProgram((prevProgram) => {
      const workout = prevProgram.workouts.find(s => s.id === workoutId);
      if (!workout || !workout.weekId) return prevProgram;
      
      const week = prevProgram.weeks.find(w => w.id === workout.weekId);
      if (!week || week.workouts.length <= 1) {
        toast.error("Cannot delete the last workout in a week");
        return prevProgram;
      }
      
      const updatedProgram = deleteWorkoutFromProgram(prevProgram, workoutId);
      
      if (workoutId === activeWorkoutId) {
        const weekWorkouts = updatedProgram.weeks
          .find(w => w.id === workout.weekId)
          ?.workouts || [];
        
        setActiveWorkoutId(weekWorkouts[0] || null);
      }
      
      return updatedProgram;
    });
    toast.success("Workout deleted");
  };

  const deleteWeek = (weekId: string) => {
    setProgram((prevProgram) => {
      if (prevProgram.weeks.length <= 1) {
        toast.error("Cannot delete the last week");
        return prevProgram;
      }
      
      const updatedProgram = deleteWeekFromProgram(prevProgram, weekId);
      
      if (weekId === activeWeekId) {
        const firstWeek = updatedProgram.weeks[0];
        setActiveWeekId(firstWeek?.id || null);
        setActiveWorkoutId(firstWeek?.workouts[0] || null);
      }
      
      return updatedProgram;
    });
    toast.success("Week deleted");
  };

  const resetProgram = () => {
    const emptyProgram = createEmptyProgram();
    setProgram(emptyProgram);
    setActiveWeekId(emptyProgram.weeks[0]?.id || null);
    setActiveWorkoutId(emptyProgram.workouts[0]?.id || null);
    toast.success("Program reset");
  };

  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    setActiveWeekId(sampleProgram.weeks[0]?.id || null);
    setActiveWorkoutId(sampleProgram.workouts[0]?.id || null);
    toast.success("Sample program loaded");
  };

  const createCircuit = (workoutId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Circuit",
          exercises: [],
          rounds: "3",
          restBetweenExercises: "30",
          restBetweenRounds: "60"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Circuit",
          sets: [{ id: uuidv4(), reps: "", weight: "", intensity: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "Circuit Exercise 1",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "Circuit Exercise 2",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        circuit.exercises = [exercise1Id, exercise2Id];
        
        return {
          ...workout,
          circuits: [...(workout.circuits || []), circuit],
          exercises: [...workout.exercises, circuitHeader, exercise1, exercise2]
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("Circuit created");
  };
  
  const createSuperset = (workoutId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Superset",
          exercises: [],
          rounds: "3",
          restBetweenExercises: "0",
          restBetweenRounds: "60"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Superset",
          sets: [{ id: uuidv4(), reps: "", weight: "", intensity: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "Superset Exercise A",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "Superset Exercise B",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        circuit.exercises = [exercise1Id, exercise2Id];
        
        return {
          ...workout,
          circuits: [...(workout.circuits || []), circuit],
          exercises: [...workout.exercises, circuitHeader, exercise1, exercise2]
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("Superset created");
  };
  
  const createEMOM = (workoutId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "EMOM - 10 min",
          exercises: [],
          rounds: "10",
          restBetweenExercises: "0",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "EMOM - 10 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", intensity: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exerciseId = uuidv4();
        
        const exercise: Exercise = {
          id: exerciseId,
          name: "EMOM Exercise",
          sets: [{ id: uuidv4(), reps: "8-10", weight: "", intensity: "", rest: "" }],
          notes: "Complete within 40-45 seconds to allow for rest",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        circuit.exercises = [exerciseId];
        
        return {
          ...workout,
          circuits: [...(workout.circuits || []), circuit],
          exercises: [...workout.exercises, circuitHeader, exercise]
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("EMOM created");
  };
  
  const createAMRAP = (workoutId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "AMRAP - 10 min",
          exercises: [],
          rounds: "AMRAP",
          restBetweenExercises: "0",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "AMRAP - 10 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", intensity: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        const exercise3Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "AMRAP Exercise 1",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "AMRAP Exercise 2",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        const exercise3: Exercise = {
          id: exercise3Id,
          name: "AMRAP Exercise 3",
          sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 2
        };
        
        circuit.exercises = [exercise1Id, exercise2Id, exercise3Id];
        
        return {
          ...workout,
          circuits: [...(workout.circuits || []), circuit],
          exercises: [...workout.exercises, circuitHeader, exercise1, exercise2, exercise3]
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("AMRAP created");
  };
  
  const createTabata = (workoutId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Tabata - 4 min",
          exercises: [],
          rounds: "8",
          restBetweenExercises: "10",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Tabata - 4 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", intensity: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exerciseId = uuidv4();
        
        const exercise: Exercise = {
          id: exerciseId,
          name: "Tabata Exercise",
          sets: [{ id: uuidv4(), reps: "20s", weight: "", intensity: "", rest: "10s" }],
          notes: "20s work, 10s rest x 8 rounds",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        circuit.exercises = [exerciseId];
        
        return {
          ...workout,
          circuits: [...(workout.circuits || []), circuit],
          exercises: [...workout.exercises, circuitHeader, exercise]
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("Tabata created");
  };
  
  const updateCircuit = (workoutId: string, circuitId: string, updates: Partial<Circuit>) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const updatedCircuits = (workout.circuits || []).map((circuit) => {
          if (circuit.id !== circuitId) return circuit;
          return { ...circuit, ...updates };
        });
        
        return { ...workout, circuits: updatedCircuits };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };
  
  const deleteCircuit = (workoutId: string, circuitId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const updatedCircuits = (workout.circuits || []).filter(
          (circuit) => circuit.id !== circuitId
        );
        
        const updatedExercises = workout.exercises.map((exercise) => {
          if (exercise.circuitId === circuitId) {
            const { isInCircuit, circuitId, circuitOrder, ...rest } = exercise;
            return rest;
          }
          return exercise;
        });
        
        return { 
          ...workout, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
    
    toast.success("Circuit deleted");
  };
  
  const addExerciseToCircuit = (workoutId: string, circuitId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const circuit = (workout.circuits || []).find((c) => c.id === circuitId);
        if (!circuit) return workout;
        
        const updatedCircuits = (workout.circuits || []).map((c) => {
          if (c.id !== circuitId) return c;
          return { 
            ...c, 
            exercises: [...c.exercises, exerciseId] 
          };
        });
        
        const updatedExercises = workout.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return { 
            ...exercise, 
            isInCircuit: true,
            circuitId: circuitId,
            circuitOrder: circuit.exercises.length
          };
        });
        
        return { 
          ...workout, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };
  
  const removeExerciseFromCircuit = (workoutId: string, circuitId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedWorkouts = prevProgram.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const updatedCircuits = (workout.circuits || []).map((circuit) => {
          if (circuit.id !== circuitId) return circuit;
          return { 
            ...circuit, 
            exercises: circuit.exercises.filter(id => id !== exerciseId) 
          };
        });
        
        const updatedExercises = workout.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          
          const { isInCircuit, circuitId, circuitOrder, ...restExercise } = exercise;
          return restExercise;
        });
        
        return { 
          ...workout, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, workouts: updatedWorkouts };
    });
  };

  // Main preset functions
  const saveWorkoutAsPreset = (workoutId: string, name: string) => {
    const workoutPreset = saveCurrentWorkoutAsPreset(program, workoutId, name);
    saveWorkoutPreset(workoutPreset);
    toast.success("Workout saved as preset");
  };

  const saveWeekAsPreset = (weekId: string, name: string) => {
    // First, get all workouts in this week
    const week = program.weeks.find(w => w.id === weekId);
    if (!week || !week.workouts) {
      toast.error("Week not found or has no workouts");
      return;
    }
    
    // Save each workout as its own preset first
    const savedWorkoutIds: string[] = [];
    
    week.workouts.forEach(workoutId => {
      const workout = program.workouts.find(w => w.id === workoutId);
      if (workout) {
        // Create a unique name for this workout
        const workoutPresetName = `${name} - ${workout.name}`;
        
        // Save the workout with this name
        const workoutCopy = saveCurrentWorkoutAsPreset(program, workout.id, workoutPresetName);
        
        // Store the workout preset
        saveWorkoutPreset(workoutCopy);
        
        // Keep track of the new workout ID
        savedWorkoutIds.push(workoutCopy.id);
        
        console.log(`Saved workout preset: ${workoutPresetName} with ID: ${workoutCopy.id}`);
      }
    });
    
    // Now create the week preset with references to the newly saved workout presets
    const weekPreset: WorkoutWeek = {
      id: generateId(),
      name: name,
      order: week.order,
      workouts: savedWorkoutIds  // Use the IDs of the newly saved workout presets
    };
    
    console.log("Saving week preset with workouts:", weekPreset);
    
    // Save the week preset
    saveWeekPreset(weekPreset);
    toast.success("Week saved as preset");
  };

  const saveProgramAsPreset = (name: string) => {
    const programPreset = copyProgramAsPreset(program, name);
    saveProgramPreset(programPreset);
    toast.success("Program saved as preset");
  };

  const loadWorkoutPreset = (preset: Workout, weekId: string) => {
    setProgram((prevProgram) => {
      const newWorkout = cloneWorkout(preset, weekId);
      
      const updatedWeeks = prevProgram.weeks.map(week => {
        if (week.id === weekId) {
          return {
            ...week,
            workouts: [...week.workouts, newWorkout.id]
          };
        }
        return week;
      });
      
      const updatedProgram = {
        ...prevProgram,
        workouts: [...prevProgram.workouts, newWorkout],
        weeks: updatedWeeks
      };
      
      setActiveWorkoutId(newWorkout.id);
      
      return updatedProgram;
    });
    
    toast.success(`Loaded workout preset: ${preset.name}`);
  };

  const loadWeekPreset = (preset: WorkoutWeek) => {
    setProgram((prevProgram) => {
      const newWeekId = generateId();
      const newWeek = {
        ...preset,
        id: newWeekId,
        order: prevProgram.weeks.length + 1,
        workouts: []
      };
      
      const workoutsToAdd: Workout[] = [];
      const workoutIds: string[] = [];
      
      // Get all workouts from presets
      const workoutPresets = getWorkoutPresets();
      
      // Debugging
      console.log("Loading week preset:", preset);
      console.log("All workout presets:", workoutPresets);
      
      if (preset.workouts && preset.workouts.length > 0) {
        preset.workouts.forEach(originalWorkoutId => {
          console.log("Looking for workout with ID:", originalWorkoutId);
          const originalWorkout = workoutPresets.find(s => s.id === originalWorkoutId);
          
          if (originalWorkout) {
            console.log("Found matching workout preset:", originalWorkout);
            const newWorkout = cloneWorkout(originalWorkout, newWeekId);
            workoutsToAdd.push(newWorkout);
            workoutIds.push(newWorkout.id);
          } else {
            console.warn("Could not find workout with ID:", originalWorkoutId);
          }
        });
      }
      
      newWeek.workouts = workoutIds;
      
      console.log("New week created:", newWeek);
      console.log("Workouts added:", workoutsToAdd);
      
      const updatedProgram = {
        ...prevProgram,
        weeks: [...prevProgram.weeks, newWeek],
        workouts: [...prevProgram.workouts, ...workoutsToAdd]
      };
      
      setActiveWeekId(newWeekId);
      if (workoutIds.length > 0) {
        setActiveWorkoutId(workoutIds[0]);
      }
      
      return updatedProgram;
    });
    
    toast.success(`Loaded week preset: ${preset.name}`);
  };

  const loadProgramPreset = (preset: WorkoutProgram) => {
    if (!preset || !preset.weeks || preset.weeks.length === 0) {
      toast.error("Invalid program preset");
      return;
    }
    
    setProgram(preset);
    setActiveWeekId(preset.weeks[0]?.id || null);
    
    if (preset.workouts && preset.workouts.length > 0) {
      setActiveWorkoutId(preset.workouts[0]?.id || null);
    } else {
      setActiveWorkoutId(null);
    }
    
    toast.success(`Loaded program preset: ${preset.name}`);
  };

  // Library functions
  const saveWorkoutToLibrary = (workoutId: string, name: string) => {
    const workoutPreset = saveCurrentWorkoutAsPreset(program, workoutId, name);
    addWorkoutToLibrary(workoutPreset);
    toast.success("Workout playlist added to library");
  };

  const saveWeekToLibrary = (weekId: string, name: string) => {
    // First, get all workouts in this week
    const week = program.weeks.find(w => w.id === weekId);
    if (!week || !week.workouts) {
      toast.error("Week not found or has no workouts");
      return;
    }
    
    // Save each workout to the library first
    const savedWorkoutIds: string[] = [];
    
    week.workouts.forEach(workoutId => {
      const workout = program.workouts.find(w => w.id === workoutId);
      if (workout) {
        // Create a unique name for this workout
        const workoutLibraryName = `${name} - ${workout.name}`;
        
        // Save the workout with this name
        const workoutCopy = saveCurrentWorkoutAsPreset(program, workout.id, workoutLibraryName);
        
        // Store the workout in the library
        addWorkoutToLibrary(workoutCopy);
        
        // Keep track of the new workout ID
        savedWorkoutIds.push(workoutCopy.id);
        
        console.log(`Added workout to library: ${workoutLibraryName} with ID: ${workoutCopy.id}`);
      }
    });
    
    // Now create the week with references to the newly saved workout library items
    const weekLibraryItem: WorkoutWeek = {
      id: generateId(),
      name: name,
      order: week.order,
      workouts: savedWorkoutIds  // Use the IDs of the newly saved workout library items
    };
    
    console.log("Adding week to library with workouts:", weekLibraryItem);
    
    // Save the week to the library
    addWeekToLibrary(weekLibraryItem);
    toast.success("Training week added to library");
  };

  const saveProgramToLibrary = (name: string) => {
    const programPreset = copyProgramAsPreset(program, name);
    addProgramToLibrary(programPreset);
    toast.success("Training album added to library");
  };

  const loadWorkoutFromLibrary = (preset: Workout, weekId: string) => {
    setProgram((prevProgram) => {
      const newWorkout = cloneWorkout(preset, weekId);
      
      const updatedWeeks = prevProgram.weeks.map(week => {
        if (week.id === weekId) {
          return {
            ...week,
            workouts: [...week.workouts, newWorkout.id]
          };
        }
        return week;
      });
      
      const updatedProgram = {
        ...prevProgram,
        workouts: [...prevProgram.workouts, newWorkout],
        weeks: updatedWeeks
      };
      
      setActiveWorkoutId(newWorkout.id);
      
      return updatedProgram;
    });
    
    toast.success(`Added "${preset.name}" to your program`);
  };

  const loadWeekFromLibrary = (preset: WorkoutWeek) => {
    setProgram((prevProgram) => {
      const newWeekId = generateId();
      const newWeek = {
        ...preset,
        id: newWeekId,
        order: prevProgram.weeks.length + 1,
        workouts: []
      };
      
      const workoutsToAdd: Workout[] = [];
      const workoutIds: string[] = [];
      
      // Get all workouts from library
      const workoutLibrary = getWorkoutLibrary();
      
      // Debugging
      console.log("Loading week from library:", preset);
      console.log("All workout library items:", workoutLibrary);
      
      if (preset.workouts && preset.workouts.length > 0) {
        preset.workouts.forEach(originalWorkoutId => {
          console.log("Looking for workout with ID:", originalWorkoutId);
          const originalWorkout = workoutLibrary.find(s => s.id === originalWorkoutId);
          
          if (originalWorkout) {
            console.log("Found matching workout in library:", originalWorkout);
            const newWorkout = cloneWorkout(originalWorkout, newWeekId);
            workoutsToAdd.push(newWorkout);
            workoutIds.push(newWorkout.id);
          } else {
            console.warn("Could not find workout with ID:", originalWorkoutId);
          }
        });
      }
      
      newWeek.workouts = workoutIds;
      
      console.log("New week created:", newWeek);
      console.log("Workouts added:", workoutsToAdd);
      
      const updatedProgram = {
        ...prevProgram,
        weeks: [...prevProgram.weeks, newWeek],
        workouts: [...prevProgram.workouts, ...workoutsToAdd]
      };
      
      setActiveWeekId(newWeekId);
      if (workoutIds.length > 0) {
        setActiveWorkoutId(workoutIds[0]);
      }
      
      return updatedProgram;
    });
    
    toast.success(`Added training week "${preset.name}" to your program`);
  };

  const loadProgramFromLibrary = (preset: WorkoutProgram) => {
    if (!preset || !preset.weeks || preset.weeks.length === 0) {
      toast.error("Invalid program preset");
      return;
    }
    
    setProgram(preset);
    setActiveWeekId(preset.weeks[0]?.id || null);
    
    if (preset.workouts && preset.workouts.length > 0) {
      setActiveWorkoutId(preset.workouts[0]?.id || null);
    } else {
      setActiveWorkoutId(null);
    }
    
    toast.success(`Loaded training album: ${preset.name}`);
  };

  // Compatibility functions
  const saveSessionAsPreset = (sessionId: string, name: string) => {
    saveWorkoutAsPreset(sessionId, name);
  };

  const loadSessionPreset = (preset: Workout, weekId: string) => {
    loadWorkoutPreset(preset, weekId);
  };

  const saveSessionToLibrary = (sessionId: string, name: string) => {
    saveWorkoutToLibrary(sessionId, name);
  };

  const loadSessionFromLibrary = (session: Workout, weekId: string) => {
    loadWorkoutFromLibrary(session, weekId);
  };

  return (
    <WorkoutContext.Provider
      value={{
        program,
        activeWorkoutId,
        activeWeekId,
        setActiveWorkoutId,
        setActiveWeekId,
        updateWorkoutName,
        updateWeekName,
        updateExercise,
        updateSet,
        addExercise,
        addSet,
        deleteSet,
        deleteExercise,
        addWorkout,
        addWeek,
        deleteWorkout,
        deleteWeek,
        resetProgram,
        loadSampleProgram,
        createCircuit,
        createSuperset,
        createEMOM,
        createAMRAP,
        createTabata,
        updateCircuit,
        deleteCircuit,
        addExerciseToCircuit,
        removeExerciseFromCircuit,
        saveWorkoutAsPreset,
        saveWeekAsPreset,
        saveProgramAsPreset,
        loadWorkoutPreset,
        loadWeekPreset,
        loadProgramPreset,
        getWorkoutPresets,
        getWeekPresets,
        getProgramPresets,
        deleteWorkoutPreset,
        deleteWeekPreset,
        deleteProgramPreset,
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
        // Compatibility functions
        saveSessionAsPreset,
        loadSessionPreset,
        getSessionPresets,
        deleteSessionPreset,
        saveSessionToLibrary,
        loadSessionFromLibrary,
        getSessionLibrary,
        removeSessionFromLibrary,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
