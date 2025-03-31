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
} from "@/types/workout";
import {
  createEmptyProgram,
  addWeekToProgram,
  addWorkoutToProgram,
  updateWorkoutInProgram,
  updateWeekInProgram,
  deleteWorkoutFromProgram,
  deleteWeekFromProgram,
  cloneWorkout,
  createEmptyWeek,
  createEmptyWorkout,
} from "@/utils/workout";
import {
  getProgramLibrary,
  addProgramToLibrary,
  updateProgramInLibrary,
  getWorkoutLibrary,
  addWorkoutToLibrary,
  updateWorkoutInLibrary,
  getWeekLibrary,
  addWeekToLibrary,
  updateWeekInLibrary,
} from "@/utils/presets";
import { toast } from "sonner";
import { validateWorkoutData, checkWorkoutLoaded } from "@/hooks/useWorkoutLibraryIntegration";

interface WorkoutContextType {
  program: WorkoutProgram | null;
  activeWorkoutId: string | null;
  activeWeekId: string | null;
  setProgram: (program: WorkoutProgram) => void;
  setActiveWorkoutId: (workoutId: string | null) => void;
  setActiveWeekId: (weekId: string) => void;
  addWeek: (afterWeekId?: string) => string | undefined;
  addWorkout: (weekId: string, afterWorkoutId?: string) => string | undefined;
  updateWorkout: (workoutId: string, updatedWorkout: Workout) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  deleteWorkout: (workoutId: string) => void;
  deleteWeek: (weekId: string) => void;
  cloneWorkout: (workoutId: string, newWeekId?: string) => void;
  getExerciseDetails: (exerciseId: string) => Exercise | undefined;
  loadWorkoutFromLibrary: (workoutId: string) => void;
  saveWorkoutToLibrary: (workoutId: string) => void;
  saveWeekToLibrary: (weekId: string) => void;
  saveProgramToLibrary: () => void;
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
    const storedPrograms = getProgramLibrary();
    return storedPrograms.length > 0 ? storedPrograms[0] : createEmptyProgram();
  });
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);

  useEffect(() => {
    // Load program from local storage on mount
    const storedPrograms = getProgramLibrary();
    if (storedPrograms.length > 0) {
      setProgram(storedPrograms[0]);
    } else {
      setProgram(createEmptyProgram());
    }
  }, []);

  useEffect(() => {
    // Save program to local storage whenever it changes
    if (program) {
      const existingPrograms = getProgramLibrary();
      
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
      localStorage.setItem("fitplan-program-library", JSON.stringify([program]));
    }
  }, [program]);

  const addWeek = useCallback(
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

  const addWorkout = useCallback(
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

  const updateWorkout = useCallback(
    (workoutId: string, updatedWorkout: Workout) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          draft.workouts = draft.workouts.map(workout =>
            workout.id === workoutId ? updatedWorkout : workout
          );
        });
      });
    },
    []
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

  const cloneWorkout = useCallback(
    (workoutId: string, newWeekId?: string) => {
      setProgram((prevProgram) => {
        if (!prevProgram) return null;
        
        return produce(prevProgram, (draft) => {
          const workoutToClone = draft.workouts.find(w => w.id === workoutId);
          if (!workoutToClone) return;
          
          const clonedWorkout = cloneWorkout(workoutToClone, newWeekId);
          
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

  const saveWorkoutToLibrary = useCallback(
    (workoutId: string) => {
      if (!program) return;
      
      const workoutToSave = program.workouts.find(w => w.id === workoutId);
      if (!workoutToSave) {
        toast.error("Workout not found");
        return;
      }
      
      try {
        addWorkoutToLibrary(workoutToSave);
        toast.success("Workout saved to library");
      } catch (error: any) {
        toast.error(error.message || "Failed to save workout");
      }
    },
    [program]
  );

  const saveWeekToLibrary = useCallback(
    (weekId: string) => {
      if (!program) return;
      
      const weekToSave = program.weeks.find(w => w.id === weekId);
      if (!weekToSave) {
        toast.error("Week not found");
        return;
      }
      
      try {
        addWeekToLibrary(weekToSave);
        toast.success("Week saved to library");
      } catch (error: any) {
        toast.error(error.message || "Failed to save week");
      }
    },
    [program]
  );

  const saveProgramToLibrary = useCallback(() => {
    if (!program) return;
    
    try {
      addProgramToLibrary(program);
      toast.success("Program saved to library");
    } catch (error: any) {
      toast.error(error.message || "Failed to save program");
    }
  }, [program]);

  const loadWorkoutFromLibrary = (workoutId) => {
    try {
      console.info(`Loading workout from library with ID: ${workoutId}`);
      const workoutLibrary = getWorkoutLibrary();
      const libraryWorkout = workoutLibrary.find(w => w.id === workoutId);
      
      if (!libraryWorkout) {
        toast.error("Workout not found in library");
        return;
      }
      
      console.info('Starting to load workout from library:', libraryWorkout);
      
      // Create a deep clone to avoid reference issues
      const workoutToLoad: Workout = JSON.parse(JSON.stringify(libraryWorkout));

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
      
      // Find current active week
      if (!activeWeekId) {
        // If no active week, create one
        const newWeekId = addWeek();
        if (typeof newWeekId === 'string') {
          setActiveWeekId(newWeekId);
          
          // Add the workout to this week
          newWorkout.weekId = newWeekId;
        }
      } else {
        // Add to current week
        newWorkout.weekId = activeWeekId;
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
        
        // Set as active
        setActiveWorkoutId(newWorkout.id);
        return draft;
      });
      
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
  }

  const value: WorkoutContextType = {
    program,
    setProgram,
    activeWorkoutId,
    setActiveWorkoutId,
    activeWeekId,
    setActiveWeekId,
    addWeek,
    addWorkout,
    updateWorkout,
    updateWeek,
    deleteWorkout,
    deleteWeek,
    cloneWorkout,
    getExerciseDetails,
    loadWorkoutFromLibrary,
    saveWorkoutToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
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
