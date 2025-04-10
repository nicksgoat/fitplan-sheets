
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from "react";
import { produce } from "immer";
import {
  WorkoutProgram,
  Workout,
  Exercise,
  WorkoutWeek,
  Set,
} from "@/types/workout";
import { useExercises } from '@/hooks/useExerciseLibrary';
import { v4 as uuidv4 } from "uuid";
import { WorkoutContextProps } from './workout/types';
import { initialProgramState, createSampleProgram } from './workout/initialState';
import { 
  setupCircuit, 
  setupSuperset, 
  setupEMOM, 
  setupAMRAP, 
  setupTabata 
} from './workout/circuitOperations';
import { 
  saveWorkoutToLibrary as saveWorkout, 
  saveWeekToLibrary as saveWeek,
  saveProgramToLibrary as saveProgram,
  loadWorkoutToProgram,
  loadWeekToProgram
} from './workout/libraryOperations';
import { 
  createNewWorkout, 
  createNewExercise, 
  createNewSet, 
  convertFromLibraryExercise 
} from './workout/workoutOperations';

// Create the context with a default value
const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram | null>(initialProgramState);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  
  const [workoutLibrary, setWorkoutLibrary] = useState<Workout[]>([]);
  const [weekLibrary, setWeekLibrary] = useState<WorkoutWeek[]>([]);
  const [programLibrary, setProgramLibrary] = useState<WorkoutProgram[]>([]);
  
  const { data: libraryExercises } = useExercises();
  
  const updateProgram = useCallback(
    (updater: (draft: WorkoutProgram) => void) => {
      setProgram((prevProgram) => {
        if (!prevProgram) {
          console.warn("Attempted to update a null program. This might indicate an issue with program initialization.");
          return null;
        }
        return produce(prevProgram, updater);
      });
    },
    []
  );

  const updateWorkout = useCallback(
    (workoutId: string, updater: (draft: Workout) => void) => {
      updateProgram((draft) => {
        const workoutIndex = draft.workouts.findIndex((w) => w.id === workoutId);
        if (workoutIndex !== -1) {
          updater(draft.workouts[workoutIndex]);
        }
      });
    },
    [updateProgram]
  );

  const updateWeek = useCallback(
    (weekId: string, updater: (draft: WorkoutWeek) => void) => {
      updateProgram((draft) => {
        const weekIndex = draft.weeks.findIndex((week) => week.id === weekId);
        if (weekIndex !== -1) {
          updater(draft.weeks[weekIndex]);
        }
      });
    },
    [updateProgram]
  );

  const updateExercise = useCallback(
    (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => {
      updateWorkout(workoutId, (workout) => {
        const exerciseIndex = workout.exercises.findIndex((e) => e.id === exerciseId);
        if (exerciseIndex !== -1) {
          workout.exercises[exerciseIndex] = {
            ...workout.exercises[exerciseIndex],
            ...updates,
          };
        }
      });
    },
    [updateWorkout]
  );

  const updateSet = useCallback(
    (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
      updateWorkout(workoutId, (workout) => {
        const exercise = workout.exercises.find((e) => e.id === exerciseId);
        if (exercise) {
          const setIndex = exercise.sets.findIndex((s) => s.id === setId);
          if (setIndex !== -1) {
            exercise.sets[setIndex] = {
              ...exercise.sets[setIndex],
              ...updates,
            };
          }
        }
      });
    },
    [updateWorkout]
  );

  const addWorkout = useCallback((weekId: string) => {
    let nextDayNumber = 1;
    
    updateProgram((draft) => {
      const week = draft.weeks.find(w => w.id === weekId);
      if (week) {
        const workoutsInWeek = week.workouts
          .map(id => draft.workouts.find(w => w.id === id))
          .filter(Boolean) as Workout[];
        
        if (workoutsInWeek.length >= 7) {
          return;
        }
        
        const usedDays = workoutsInWeek.map(w => w.day);
        for (let i = 1; i <= 7; i++) {
          if (!usedDays.includes(i)) {
            nextDayNumber = i;
            break;
          }
        }
      }
    });

    const newWorkoutId = uuidv4();
    const newWorkout = createNewWorkout(weekId, nextDayNumber);
    newWorkout.id = newWorkoutId;

    updateProgram((draft) => {
      draft.workouts.push(newWorkout);
      const week = draft.weeks.find(w => w.id === weekId);
      if (week) {
        week.workouts.push(newWorkoutId);
      }
    });
    
    return newWorkoutId;
  }, [updateProgram]);

  const addWeek = useCallback(() => {
    if (!program) return null;
    
    const newWeekId = uuidv4();
    const weekOrder = program.weeks.length || 0;
    const newWeek: WorkoutWeek = {
      id: newWeekId,
      name: `Week ${weekOrder + 1}`,
      order: weekOrder,
      workouts: [],
    };

    updateProgram((draft) => {
      draft.weeks.push(newWeek);
    });
    
    return newWeekId;
  }, [updateProgram, program]);

  const addCircuit = useCallback((workoutId: string) => {
    const newCircuitId = uuidv4();

    updateWorkout(workoutId, (workout) => {
      workout.circuits.push({
        id: newCircuitId,
        name: "New Circuit",
        exercises: [],
      });
    });
  }, [updateWorkout]);
  
  const addExercise = useCallback((workoutId: string, libraryExerciseId?: string) => {
    const newExercise = libraryExerciseId && libraryExercises 
      ? convertFromLibraryExercise(libraryExerciseId, libraryExercises)
      : createNewExercise();
    
    updateProgram((draft) => {
      const workout = draft.workouts.find((w) => w.id === workoutId);
      if (workout) {
        workout.exercises.push(newExercise);
      }
    });
  }, [updateProgram, libraryExercises]);

  const addExerciseToWorkout = useCallback((workoutId: string) => {
    const newExercise = createNewExercise();

    updateProgram((draft) => {
      const workout = draft.workouts.find((w) => w.id === workoutId);
      if (workout) {
        workout.exercises.push(newExercise);
      }
    });
  }, [updateProgram]);

  const duplicateExercise = useCallback((workoutId: string, exerciseId: string) => {
    updateProgram((draft) => {
      const workout = draft.workouts.find((w) => w.id === workoutId);
      if (workout) {
        const exerciseToDuplicate = workout.exercises.find((e) => e.id === exerciseId);
        if (exerciseToDuplicate) {
          const newExercise: Exercise = {
            ...exerciseToDuplicate,
            id: uuidv4(),
            sets: exerciseToDuplicate.sets.map((set) => ({
              ...set,
              id: uuidv4(),
            })),
          };
          workout.exercises.push(newExercise);
        }
      }
    });
  }, [updateProgram]);

  const addSet = useCallback((workoutId: string, exerciseId: string) => {
    const newSet = createNewSet();

    updateProgram((draft) => {
      const workout = draft.workouts.find((w) => w.id === workoutId);
      if (workout) {
        const exercise = workout.exercises.find((e) => e.id === exerciseId);
        if (exercise) {
          exercise.sets.push(newSet);
        }
      }
    });
  }, [updateProgram]);

  const deleteSet = useCallback(
    (workoutId: string, exerciseId: string, setId: string) => {
      updateProgram((draft) => {
        const workout = draft.workouts.find((w) => w.id === workoutId);
        if (workout) {
          const exercise = workout.exercises.find((e) => e.id === exerciseId);
          if (exercise) {
            exercise.sets = exercise.sets.filter((set) => set.id !== setId);
          }
        }
      });
    },
    [updateProgram]
  );

  const deleteExercise = useCallback(
    (workoutId: string, exerciseId: string) => {
      updateProgram((draft) => {
        const workout = draft.workouts.find((w) => w.id === workoutId);
        if (workout) {
          workout.exercises = workout.exercises.filter((e) => e.id !== exerciseId);
        }
      });
    },
    [updateProgram]
  );

  const deleteWorkout = useCallback((weekId: string, workoutId: string) => {
    updateProgram((draft) => {
      draft.workouts = draft.workouts.filter((w) => w.id !== workoutId);
      const week = draft.weeks.find(w => w.id === weekId);
      if (week) {
        week.workouts = week.workouts.filter(w => w !== workoutId);
      }
    });
  }, [updateProgram]);
  
  const getExerciseDetails = useCallback((exerciseId: string) => {
    if (!program) return null;
    
    let foundExercise: Exercise | undefined;
    
    for (const workout of program.workouts) {
      foundExercise = workout.exercises.find(e => e.id === exerciseId);
      if (foundExercise) break;
    }
    
    if (!foundExercise) return null;
    
    if (foundExercise.libraryExerciseId && libraryExercises) {
      const libraryExercise = libraryExercises.find(
        e => e.id === foundExercise!.libraryExerciseId
      );
      
      if (libraryExercise) {
        return {
          ...foundExercise,
          libraryData: libraryExercise
        };
      }
    }
    
    return foundExercise;
  }, [program, libraryExercises]);

  const moveWorkout = useCallback((workoutId: string, weekId: string, newWeekId: string) => {
    updateProgram(draft => {
      const oldWeek = draft.weeks.find(w => w.id === weekId);
      if (oldWeek) {
        oldWeek.workouts = oldWeek.workouts.filter(w => w !== workoutId);
      }

      const newWeek = draft.weeks.find(w => w.id === newWeekId);
      if (newWeek) {
        newWeek.workouts.push(workoutId);
      }
    });
  }, [updateProgram]);

  const moveWeek = useCallback((weekId: string, newIndex: number) => {
    updateProgram(draft => {
      const weekIndex = draft.weeks.findIndex(w => w.id === weekId);

      if (weekIndex !== -1 && newIndex >= 0 && newIndex < draft.weeks.length) {
        const [movedWeek] = draft.weeks.splice(weekIndex, 1);
        draft.weeks.splice(newIndex, 0, movedWeek);

        draft.weeks.forEach((week, index) => {
          week.order = index;
        });
      }
    });
  }, [updateProgram]);

  const createCircuit = useCallback((workoutId: string) => {
    setupCircuit(updateWorkout, workoutId);
  }, [updateWorkout]);
  
  const createSuperset = useCallback((workoutId: string) => {
    setupSuperset(updateWorkout, workoutId);
  }, [updateWorkout]);
  
  const createEMOM = useCallback((workoutId: string) => {
    setupEMOM(updateWorkout, workoutId);
  }, [updateWorkout]);
  
  const createAMRAP = useCallback((workoutId: string) => {
    setupAMRAP(updateWorkout, workoutId);
  }, [updateWorkout]);
  
  const createTabata = useCallback((workoutId: string) => {
    setupTabata(updateWorkout, workoutId);
  }, [updateWorkout]);
  
  const loadSampleProgram = useCallback(() => {
    const sampleProgram = createSampleProgram();
    setProgram(sampleProgram);
    setActiveWeekId(sampleProgram.weeks[0].id);
    setActiveWorkoutId(sampleProgram.workouts[0].id);
  }, []);
  
  const resetProgram = useCallback(() => {
    setProgram(initialProgramState);
    setActiveWorkoutId(null);
    setActiveWeekId(null);
  }, []);
  
  const saveWorkoutToLibrary = useCallback((workoutId: string, name: string) => {
    if (!program) return;
    
    const workoutToSave = program.workouts.find(w => w.id === workoutId);
    saveWorkout(workoutToSave, name, workoutLibrary, setWorkoutLibrary);
  }, [program, workoutLibrary]);
  
  const saveWeekToLibrary = useCallback((weekId: string, name: string) => {
    saveWeek(program, weekId, name, weekLibrary, setWeekLibrary);
  }, [program, weekLibrary]);
  
  const saveProgramToLibrary = useCallback((name: string) => {
    saveProgram(program, name, programLibrary, setProgramLibrary);
  }, [program, programLibrary]);
  
  const loadWorkoutFromLibrary = useCallback((workoutIdOrObj: string | Workout, weekId: string, dayNumber?: number) => {
    return loadWorkoutToProgram(workoutIdOrObj, weekId, dayNumber, workoutLibrary, updateProgram);
  }, [updateProgram, workoutLibrary]);
  
  const loadWeekFromLibrary = useCallback((week: WorkoutWeek) => {
    loadWeekToProgram(week, workoutLibrary, program?.weeks.length || 0, updateProgram);
  }, [program?.weeks.length, updateProgram, workoutLibrary]);
  
  const loadProgramFromLibrary = useCallback((programToLoad: WorkoutProgram) => {
    setProgram(programToLoad);
    if (programToLoad.weeks.length > 0) {
      setActiveWeekId(programToLoad.weeks[0].id);
      if (programToLoad.workouts.length > 0) {
        setActiveWorkoutId(programToLoad.workouts[0].id);
      }
    }
  }, []);
  
  const getWorkoutLibrary = useCallback(() => {
    return workoutLibrary;
  }, [workoutLibrary]);
  
  const getWeekLibrary = useCallback(() => {
    return weekLibrary;
  }, [weekLibrary]);
  
  const getProgramLibrary = useCallback(() => {
    return programLibrary;
  }, [programLibrary]);
  
  const removeWorkoutFromLibrary = useCallback((id: string) => {
    setWorkoutLibrary(prev => prev.filter(w => w.id !== id));
  }, []);
  
  const removeWeekFromLibrary = useCallback((id: string) => {
    setWeekLibrary(prev => prev.filter(w => w.id !== id));
  }, []);
  
  const removeProgramFromLibrary = useCallback((id: string) => {
    setProgramLibrary(prev => prev.filter(p => p.id !== id));
  }, []);
  
  const updateWorkoutName = useCallback((workoutId: string, name: string) => {
    updateWorkout(workoutId, (workout) => {
      workout.name = name;
    });
  }, [updateWorkout]);
  
  const updateWeekName = useCallback((weekId: string, name: string) => {
    updateWeek(weekId, (week) => {
      week.name = name;
    });
  }, [updateWeek]);

  return (
    <WorkoutContext.Provider
      value={{
        program,
        activeWorkoutId,
        activeWeekId,
        setActiveWorkoutId,
        setActiveWeekId,
        setProgram,
        addWorkout,
        addWeek,
        addCircuit,
        addExercise,
        addExerciseToWorkout,
        duplicateExercise,
        addSet,
        deleteSet,
        deleteExercise,
        deleteWorkout,
        updateProgram,
        updateWorkout,
        updateWeek,
        updateExercise,
        updateSet,
        getExerciseDetails,
        moveWorkout,
        moveWeek,
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
        updateWorkoutName,
        updateWeekName,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
