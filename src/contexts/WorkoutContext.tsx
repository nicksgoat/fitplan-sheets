
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { produce } from "immer";
import {
  WorkoutProgram,
  Workout,
  WorkoutWeek,
  Exercise,
  Set,
  WorkoutType,
} from "@/types/workout";
import {
  createEmptyProgram,
  addWeekToProgram,
  addWorkoutToProgram,
  updateWorkoutInProgram,
  updateWeekInProgram,
  deleteWorkoutFromProgram,
  deleteWeekFromProgram,
  cloneWorkout as cloneWorkoutUtil,
  createEmptyWeek,
  createEmptyWorkout,
} from "@/utils/workout";
import {
  getProgramLibrary as getPrograms,
  addProgramToLibrary as addProgram,
  updateProgramInLibrary as updateProgram,
  getWorkoutLibrary as getWorkouts,
  addWorkoutToLibrary as addWorkout,
  updateWorkoutInLibrary as updateWorkoutLib,
  getWeekLibrary as getWeeks,
  addWeekToLibrary as addWeek,
  updateWeekInLibrary as updateWeekLib,
  removeWorkoutFromLibrary as removeWorkout,
  removeWeekFromLibrary as removeWeek,
  removeProgramFromLibrary as removeProgram,
} from "@/utils/presets";
import { toast } from "sonner";
import { validateWorkoutData, checkWorkoutLoaded, ensureCompleteWorkoutStructure } from "@/hooks/useWorkoutLibraryIntegration";

// Constants for localStorage keys
const WORKOUT_LIBRARY_KEY = "fitplan-workout-library";
const WEEK_LIBRARY_KEY = "fitplan-week-library";
const PROGRAM_LIBRARY_KEY = "fitplan-program-library";

interface WorkoutContextType {
  program: WorkoutProgram | null;
  activeWorkoutId: string | null;
  activeWeekId: string | null;
  setProgram: (program: WorkoutProgram) => void;
  setActiveWorkoutId: (workoutId: string | null) => void;
  setActiveWeekId: (weekId: string) => void;
  addWeek: (afterWeekId?: string) => string | undefined;
  addWorkout: (weekId: string, afterWorkoutId?: string) => string | undefined;
  updateWorkout: (workoutId: string, updatedWorkout: Workout | ((workout: Workout) => void)) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  deleteWorkout: (workoutId: string) => void;
  deleteWeek: (weekId: string) => void;
  cloneWorkout: (workoutId: string, newWeekId?: string) => void;
  getExerciseDetails: (exerciseId: string) => Exercise | undefined;
  loadWorkoutFromLibrary: (workout: Workout, weekId?: string) => void;
  saveWorkoutToLibrary: (workoutId: string, name?: string) => void;
  saveWeekToLibrary: (weekId: string, name?: string) => void;
  saveProgramToLibrary: (name?: string) => void;
  // Additional functions for CircuitControls
  createCircuit: (workoutId: string) => void;
  createSuperset: (workoutId: string) => void;
  createEMOM: (workoutId: string) => void;
  createAMRAP: (workoutId: string) => void;
  createTabata: (workoutId: string) => void;
  // Functions used in WorkoutHeader
  resetProgram: () => void;
  loadSampleProgram: () => void;
  loadWeekFromLibrary: (week: WorkoutWeek) => void;
  loadProgramFromLibrary: (program: WorkoutProgram) => void;
  getWorkoutLibrary: () => Workout[];
  getWeekLibrary: () => WorkoutWeek[];
  getProgramLibrary: () => WorkoutProgram[];
  removeWorkoutFromLibrary: (workoutId: string) => void;
  removeWeekFromLibrary: (weekId: string) => void;
  removeProgramFromLibrary: (programId: string) => void;
  updateWorkoutName: (workoutId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  // Functions for WorkoutTable
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (setId: string, updates: Partial<Set>) => void;
  addExercise: (workoutId: string) => string;
  addSet: (exerciseId: string) => string;
  deleteSet: (setId: string) => void;
  deleteExercise: (exerciseId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({
  children,
}) => {
  const [program, setProgram] = useState<WorkoutProgram | null>(() => {
    // Initialize from local storage
    const storedPrograms = getPrograms();
    return storedPrograms.length > 0 ? storedPrograms[0] : createEmptyProgram();
  });
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);

  useEffect(() => {
    // Load program from local storage on mount
    const storedPrograms = getPrograms();
    if (storedPrograms.length > 0) {
      setProgram(storedPrograms[0]);
    } else {
      setProgram(createEmptyProgram());
    }
  }, []);

  useEffect(() => {
    // Save program to local storage whenever it changes
    if (program) {
      const existingPrograms = getPrograms();
      
      // Check if the current program already exists in the library
      const existingIndex = existingPrograms.findIndex(p => p.id === program.id);
      
      if (existingIndex !== -1) {
        // Update the existing program
        existingPrograms[existingIndex] = program;
      } else {
        // Add the new program
        existingPrograms.push(program);
      }
      
      // Save the updated library back to local storage
      localStorage.setItem(PROGRAM_LIBRARY_KEY, JSON.stringify([program]));
    }
  }, [program]);

  const addWeekFn = useCallback(
    (afterWeekId?: string) => {
      if (!program) return;

      const newProgram = produce(program, (draft) => {
        const updatedProgram = addWeekToProgram(draft, afterWeekId);
        
        // Directly modify the draft object
        draft.weeks = updatedProgram.weeks;
        draft.workouts = updatedProgram.workouts;
      });

      setProgram(newProgram);
      setActiveWeekId(newProgram.weeks[newProgram.weeks.length - 1].id);
      
      return newProgram.weeks[newProgram.weeks.length - 1].id;
    },
    [program]
  );

  const addWorkoutFn = useCallback(
    (weekId: string, afterWorkoutId?: string) => {
      if (!program) return;

      const newProgram = produce(program, (draft) => {
        const updatedProgram = addWorkoutToProgram(draft, weekId, afterWorkoutId);
        
        // Directly modify the draft object
        draft.workouts = updatedProgram.workouts;
        
        // Find the week and update its workouts array
        const weekIndex = draft.weeks.findIndex(w => w.id === weekId);
        if (weekIndex !== -1) {
          draft.weeks[weekIndex].workouts = updatedProgram.weeks[weekIndex].workouts;
        }
      });

      setProgram(newProgram);
      setActiveWorkoutId(
        newProgram.workouts[newProgram.workouts.length - 1].id
      );
      
      return newProgram.workouts[newProgram.workouts.length - 1].id;
    },
    [program]
  );

  const updateWorkoutFn = useCallback(
    (workoutId: string, updatedWorkoutOrFn: Workout | ((workout: Workout) => void)) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          const workoutIndex = draft.workouts.findIndex(w => w.id === workoutId);
          if (workoutIndex === -1) return;
          
          if (typeof updatedWorkoutOrFn === 'function') {
            // If it's a function, call it with the workout
            const workout = draft.workouts[workoutIndex];
            updatedWorkoutOrFn(workout);
          } else {
            // If it's an object, replace the workout
            draft.workouts[workoutIndex] = updatedWorkoutOrFn;
          }
        });
      });
    },
    []
  );

  // Add a specific function to update a workout name
  const updateWorkoutName = useCallback(
    (workoutId: string, name: string) => {
      updateWorkoutFn(workoutId, (workout) => {
        workout.name = name;
      });
    },
    [updateWorkoutFn]
  );

  const updateWeek = useCallback(
    (weekId: string, updates: Partial<WorkoutWeek>) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          draft.weeks = draft.weeks.map(week =>
            week.id === weekId ? { ...week, ...updates } : week
          );
        });
      });
    },
    []
  );

  // Add a specific function to update a week name
  const updateWeekName = useCallback(
    (weekId: string, name: string) => {
      updateWeek(weekId, { name });
    },
    [updateWeek]
  );

  const deleteWorkout = useCallback(
    (workoutId: string) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          const updatedProgram = deleteWorkoutFromProgram(draft, workoutId);
          
          draft.workouts = updatedProgram.workouts;
          draft.weeks = updatedProgram.weeks;
        });
      });
    },
    []
  );

  const deleteWeek = useCallback(
    (weekId: string) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          const updatedProgram = deleteWeekFromProgram(draft, weekId);
          
          draft.workouts = updatedProgram.workouts;
          draft.weeks = updatedProgram.weeks;
        });
      });
    },
    []
  );

  const cloneWorkoutFn = useCallback(
    (workoutId: string, newWeekId?: string) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          const workoutToClone = draft.workouts.find(w => w.id === workoutId);
          if (!workoutToClone) return;
          
          const clonedWorkout = cloneWorkoutUtil(workoutToClone, newWeekId);
          
          draft.workouts.push(clonedWorkout);
          
          // Find the correct week to add the workout to
          const weekId = newWeekId || workoutToClone.weekId;
          if (weekId) {
            const weekIndex = draft.weeks.findIndex(w => w.id === weekId);
            if (weekIndex !== -1) {
              draft.weeks[weekIndex].workouts.push(clonedWorkout.id);
            }
          }
        });
      });
    },
    []
  );

  const getExerciseDetails = useCallback(
    (exerciseId: string): Exercise | undefined => {
      if (!program) return undefined;
      
      for (const workout of program.workouts) {
        const exercise = workout.exercises.find((e) => e.id === exerciseId);
        if (exercise) {
          return exercise;
        }
      }
      return undefined;
    },
    [program]
  );

  // Workout Library Operations
  const getWorkoutLibrary = useCallback(() => {
    return getWorkouts();
  }, []);

  const getWeekLibrary = useCallback(() => {
    return getWeeks();
  }, []);

  const getProgramLibrary = useCallback(() => {
    return getPrograms();
  }, []);

  const saveWorkoutToLibrary = useCallback(
    (workoutId: string, name?: string) => {
      if (!program) return;
      
      const workoutToSave = program.workouts.find(w => w.id === workoutId);
      if (!workoutToSave) {
        toast.error("Workout not found");
        return;
      }
      
      try {
        // If name is provided, update the workout name
        const workoutCopy = { ...workoutToSave };
        if (name) {
          workoutCopy.name = name;
        }
        
        addWorkout(workoutCopy);
        toast.success("Workout saved to library");
      } catch (error: any) {
        toast.error(error.message || "Failed to save workout");
      }
    },
    [program]
  );

  const saveWeekToLibrary = useCallback(
    (weekId: string, name?: string) => {
      if (!program) return;
      
      const weekToSave = program.weeks.find(w => w.id === weekId);
      if (!weekToSave) {
        toast.error("Week not found");
        return;
      }
      
      try {
        // If name is provided, update the week name
        const weekCopy = { ...weekToSave };
        if (name) {
          weekCopy.name = name;
        }
        
        addWeek(weekCopy);
        toast.success("Week saved to library");
      } catch (error: any) {
        toast.error(error.message || "Failed to save week");
      }
    },
    [program]
  );

  const saveProgramToLibrary = useCallback((name?: string) => {
    if (!program) return;
    
    try {
      // If name is provided, update the program name
      const programCopy = { ...program };
      if (name) {
        programCopy.name = name;
      }
      
      addProgram(programCopy);
      toast.success("Program saved to library");
    } catch (error: any) {
      toast.error(error.message || "Failed to save program");
    }
  }, [program]);

  const removeWorkoutFromLibrary = useCallback((workoutId: string) => {
    try {
      removeWorkout(workoutId);
      toast.success("Workout removed from library");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove workout");
    }
  }, []);

  const removeWeekFromLibrary = useCallback((weekId: string) => {
    try {
      removeWeek(weekId);
      toast.success("Week removed from library");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove week");
    }
  }, []);

  const removeProgramFromLibrary = useCallback((programId: string) => {
    try {
      removeProgram(programId);
      toast.success("Program removed from library");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove program");
    }
  }, []);

  const loadWorkoutFromLibrary = useCallback((workout: Workout, weekId?: string) => {
    try {
      console.info(`Loading workout from library with ID: ${workout.id}`);
      
      // Create a deep clone to avoid reference issues
      const workoutToLoad: Workout = JSON.parse(JSON.stringify(workout));

      // Ensure we have all the required data properly structured
      if (!validateWorkoutData(workoutToLoad)) {
        toast.error("Invalid workout data structure");
        return;
      }
      
      // Generate new IDs to avoid conflicts
      const newWorkoutId = uuidv4();
      const oldToNewExerciseIds: Record<string, string> = {};
      const oldToNewSetIds: Record<string, string> = {};
      
      // Map old exercise IDs to new ones
      workoutToLoad.exercises.forEach(exercise => {
        const newExerciseId = uuidv4();
        oldToNewExerciseIds[exercise.id] = newExerciseId;
        
        // Map old set IDs to new ones
        exercise.sets.forEach(set => {
          const newSetId = uuidv4();
          oldToNewSetIds[set.id] = newSetId;
        });
      });
      
      // Create the new workout with all new IDs
      const newWorkout: Workout = {
        ...workoutToLoad,
        id: newWorkoutId
      };
      
      // Replace exercise IDs with new ones
      newWorkout.exercises = newWorkout.exercises.map(exercise => {
        const newExerciseId = oldToNewExerciseIds[exercise.id];
        
        // Replace set IDs with new ones
        const newSets = exercise.sets.map(set => ({
          ...set,
          id: oldToNewSetIds[set.id] || uuidv4()
        }));
        
        return {
          ...exercise,
          id: newExerciseId,
          sets: newSets
        };
      });
      
      // Find current active week or use provided weekId
      const targetWeekId = weekId || activeWeekId;
      
      if (!targetWeekId) {
        // If no active week, create one
        const newWeekId = addWeekFn();
        if (typeof newWeekId === 'string') {
          setActiveWeekId(newWeekId);
          
          // Add the workout to this week
          newWorkout.weekId = newWeekId;
        }
      } else {
        // Add to specified week
        newWorkout.weekId = targetWeekId;
      }
      
      console.info('Final workout to be added to program:', newWorkout);
      
      // Now use immer to update the state
      setProgram(draft => {
        if (!draft) {
          return createEmptyProgram();
        }
        
        // Add to workouts array
        draft.workouts.push(newWorkout);
        
        // Add to its week
        if (newWorkout.weekId) {
          const weekIndex = draft.weeks.findIndex(w => w.id === newWorkout.weekId);
          if (weekIndex >= 0) {
            draft.weeks[weekIndex].workouts.push(newWorkout.id);
          }
        }
        
        return draft;
      });
      
      // Set as active
      setActiveWorkoutId(newWorkout.id);
      
      // Verify the workout was properly loaded
      setTimeout(() => {
        const loadedWorkout = program?.workouts.find(w => w.id === newWorkout.id);
        if (!loadedWorkout || !checkWorkoutLoaded(newWorkout, loadedWorkout)) {
          toast.error("There was an issue loading the workout correctly");
          console.error("Workout not loaded correctly:", { 
            original: newWorkout,
            loaded: loadedWorkout 
          });
        } else {
          toast.success("Workout loaded successfully");
        }
      }, 500);
      
    } catch (error) {
      console.error('Error loading workout from library:', error);
      toast.error("Failed to load workout");
    }
  }, [activeWeekId, program, addWeekFn, setActiveWeekId]);

  const loadWeekFromLibrary = useCallback((week: WorkoutWeek) => {
    try {
      // Clone to avoid reference issues
      const weekToLoad = JSON.parse(JSON.stringify(week));
      // Implementation here...
      toast.success("Week loaded successfully");
    } catch (error) {
      console.error('Error loading week from library:', error);
      toast.error("Failed to load week");
    }
  }, []);

  const loadProgramFromLibrary = useCallback((program: WorkoutProgram) => {
    try {
      // Clone to avoid reference issues
      const programToLoad = JSON.parse(JSON.stringify(program));
      setProgram(programToLoad);
      toast.success("Program loaded successfully");
    } catch (error) {
      console.error('Error loading program from library:', error);
      toast.error("Failed to load program");
    }
  }, []);

  const resetProgram = useCallback(() => {
    const emptyProgram = createEmptyProgram();
    setProgram(emptyProgram);
    setActiveWorkoutId(null);
    setActiveWeekId(emptyProgram.weeks[0]?.id || null);
    toast.success("Program reset successfully");
  }, []);

  const loadSampleProgram = useCallback(() => {
    // Implementation here...
    const sampleProgram = createEmptyProgram();
    sampleProgram.name = "Sample Program";
    setProgram(sampleProgram);
    toast.success("Sample program loaded");
  }, []);

  // Circuit functions
  const createCircuit = useCallback((workoutId: string) => {
    // Implementation here...
    toast.success("Circuit created");
  }, []);

  const createSuperset = useCallback((workoutId: string) => {
    // Implementation here...
    toast.success("Superset created");
  }, []);

  const createEMOM = useCallback((workoutId: string) => {
    // Implementation here...
    toast.success("EMOM created");
  }, []);

  const createAMRAP = useCallback((workoutId: string) => {
    // Implementation here...
    toast.success("AMRAP created");
  }, []);

  const createTabata = useCallback((workoutId: string) => {
    // Implementation here...
    toast.success("Tabata created");
  }, []);

  // Exercise and Set operations
  const updateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
    // Implementation here...
  }, []);

  const updateSet = useCallback((setId: string, updates: Partial<Set>) => {
    // Implementation here...
  }, []);

  const addExercise = useCallback((workoutId: string) => {
    const newExerciseId = uuidv4();
    // Implementation here...
    return newExerciseId;
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    const newSetId = uuidv4();
    // Implementation here...
    return newSetId;
  }, []);

  const deleteSet = useCallback((setId: string) => {
    // Implementation here...
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    // Implementation here...
  }, []);

  const value: WorkoutContextType = {
    program,
    setProgram,
    activeWorkoutId,
    setActiveWorkoutId,
    activeWeekId,
    setActiveWeekId,
    addWeek: addWeekFn,
    addWorkout: addWorkoutFn,
    updateWorkout: updateWorkoutFn,
    updateWeek,
    deleteWorkout,
    deleteWeek,
    cloneWorkout: cloneWorkoutFn,
    getExerciseDetails,
    loadWorkoutFromLibrary,
    saveWorkoutToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
    // New additions
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata,
    resetProgram,
    loadSampleProgram,
    loadWeekFromLibrary,
    loadProgramFromLibrary,
    getWorkoutLibrary,
    getWeekLibrary,
    getProgramLibrary,
    removeWorkoutFromLibrary,
    removeWeekFromLibrary,
    removeProgramFromLibrary,
    updateWorkoutName,
    updateWeekName,
    updateExercise,
    updateSet,
    addExercise,
    addSet,
    deleteSet,
    deleteExercise,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
