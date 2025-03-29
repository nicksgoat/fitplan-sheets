import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import produce from "immer";
import {
  WorkoutProgram,
  Workout,
  Exercise,
  WorkoutWeek,
  Circuit,
  Set,
} from "@/types/workout";
import { useExercises } from '@/hooks/useExerciseLibrary';
import { Exercise as LibraryExercise } from '@/types/exercise';
import { libraryToWorkoutExercise } from '@/utils/exerciseConverters';

interface WorkoutContextProps {
  program: WorkoutProgram | null;
  activeWorkoutId: string | null;
  activeWeekId: string | null;
  setActiveWorkoutId: (workoutId: string | null) => void;
  setActiveWeekId: (weekId: string | null) => void;
  setProgram: (program: WorkoutProgram | null) => void;
  addWorkout: (weekId: string) => void;
  addWeek: () => void;
  addCircuit: (workoutId: string) => void;
  addExercise: (workoutId: string, libraryExerciseId?: string) => void;
  duplicateExercise: (workoutId: string, exerciseId: string) => void;
  addSet: (workoutId: string, exerciseId: string) => void;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  deleteWorkout: (weekId: string, workoutId: string) => void;
  updateProgram: (updater: (draft: WorkoutProgram) => void) => void;
  updateWorkout: (workoutId: string, updater: (draft: Workout) => void) => void;
  updateWeek: (weekId: string, updater: (draft: WorkoutWeek) => void) => void;
  updateExercise: (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  getExerciseDetails: (exerciseId: string) => (Exercise & { libraryData?: LibraryExercise }) | null;
  moveWorkout: (workoutId: string, weekId: string, newWeekId: string) => void;
  moveWeek: (weekId: string, newIndex: number) => void;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

interface WorkoutProviderProps {
  children: React.ReactNode;
}

const initialProgramState: WorkoutProgram = {
  id: "default-program-id",
  name: "My Workout Program",
  workouts: [],
  weeks: [],
};

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram | null>(initialProgramState);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  
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
          draft.workouts[workoutIndex] = produce(draft.workouts[workoutIndex], updater);
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
          draft.weeks[weekIndex] = produce(draft.weeks[weekIndex], updater);
        }
      });
    },
    [updateProgram]
  );

  const updateExercise = useCallback(
    (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => {
      updateWorkout((workout) => {
        const exerciseIndex = workout.exercises.findIndex((e) => e.id === exerciseId);
        if (exerciseIndex !== -1) {
          workout.exercises[exerciseIndex] = {
            ...workout.exercises[exerciseIndex],
            ...updates,
          };
        }
      }, workoutId);
    },
    [updateWorkout]
  );

  const updateSet = useCallback(
    (workoutId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
      updateExercise(workoutId, exerciseId, (exercise) => {
        const setIndex = exercise.sets.findIndex((s) => s.id === setId);
        if (setIndex !== -1) {
          exercise.sets[setIndex] = {
            ...exercise.sets[setIndex],
            ...updates,
          };
        }
      });
    },
    [updateExercise]
  );

  const addWorkout = useCallback((weekId: string) => {
    const newWorkout: Workout = {
      id: uuidv4(),
      name: "New Workout",
      day: 1,
      exercises: [],
      circuits: [],
    };

    updateProgram((draft) => {
      draft.workouts.push(newWorkout);
      const week = draft.weeks.find(w => w.id === weekId);
      if (week) {
        week.workouts.push(newWorkout.id);
      }
    });
  }, [updateProgram]);

  const addWeek = useCallback(() => {
    const newWeek: WorkoutWeek = {
      id: uuidv4(),
      name: "New Week",
      order: program?.weeks.length || 0,
      workouts: [],
    };

    updateProgram((draft) => {
      draft.weeks.push(newWeek);
    });
  }, [updateProgram, program?.weeks.length]);

  const addCircuit = useCallback((workoutId: string) => {
    const newCircuit: Circuit = {
      id: uuidv4(),
      name: "New Circuit",
      exercises: [],
    };

    updateWorkout((workout) => {
      workout.circuits.push(newCircuit);
    }, workoutId);
  }, [updateWorkout]);
  
  const addExercise = useCallback((workoutId: string, libraryExerciseId?: string) => {
    if (libraryExerciseId && libraryExercises) {
      const libraryExercise = libraryExercises.find(e => e.id === libraryExerciseId);
      
      if (libraryExercise) {
        const workoutExercise = libraryToWorkoutExercise(libraryExercise);
        
        updateProgram(draft => {
          const workout = draft.workouts.find(w => w.id === workoutId);
          if (workout) {
            workout.exercises.push(workoutExercise);
          }
        });
        
        return;
      }
    }
    
    const newExercise: Exercise = {
      id: uuidv4(),
      name: "New Exercise",
      sets: [
        {
          id: uuidv4(),
          reps: "",
          weight: "",
          intensity: "",
          rest: "",
        },
      ],
      notes: "",
    };

    updateProgram((draft) => {
      const workout = draft.workouts.find((w) => w.id === workoutId);
      if (workout) {
        workout.exercises.push(newExercise);
      }
    });
  }, [updateProgram, libraryExercises]);

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
    const newSet: Set = {
      id: uuidv4(),
      reps: "",
      weight: "",
      intensity: "",
      rest: "",
    };

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
      // Remove workout from old week
      const oldWeek = draft.weeks.find(w => w.id === weekId);
      if (oldWeek) {
        oldWeek.workouts = oldWeek.workouts.filter(w => w !== workoutId);
      }

      // Add workout to new week
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
        // Remove the week from its current position
        const [movedWeek] = draft.weeks.splice(weekIndex, 1);

        // Insert the week at the new index
        draft.weeks.splice(newIndex, 0, movedWeek);

        // Update the order of all weeks to reflect the new order
        draft.weeks.forEach((week, index) => {
          week.order = index;
        });
      }
    });
  }, [updateProgram]);

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
