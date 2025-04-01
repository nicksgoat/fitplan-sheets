import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { v4 } from "uuid";
import {
  Program,
  Week,
  Workout,
  Exercise,
  Set,
  RepType,
  IntensityType,
  WeightType,
} from "@/types/workout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface WorkoutContextType {
  program: Program | null;
  setProgram: React.Dispatch<React.SetStateAction<Program | null>>;
  addWeek: (programId: string) => void;
  addWorkout: (weekId: string) => void;
  addExercise: (workoutId: string) => void;
  addSet: (workoutId: string, exerciseId: string, initialData?: Partial<Set>) => void;
  updateWeek: (weekId: string, updates: Partial<Week>) => void;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => void;
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
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [program, setProgram] = useLocalStorage<Program | null>(
    "workoutProgram",
    null
  );

  useEffect(() => {
    if (!program) {
      // Initialize a default program structure
      setProgram({
        id: v4(),
        name: "New Program",
        weeks: [],
      });
    }
  }, [setProgram, program]);

  const addWeek = (programId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const newWeek: Week = {
        id: v4(),
        name: `Week ${prev.weeks.length + 1}`,
        workouts: [],
      };

      return {
        ...prev,
        weeks: [...prev.weeks, newWeek],
      };
    });
  };

  const addWorkout = (weekId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWeeks = prev.weeks.map((week) => {
        if (week.id !== weekId) return week;

        const newWorkout: Workout = {
          id: v4(),
          name: `Workout ${week.workouts.length + 1}`,
          exercises: [],
        };

        return {
          ...week,
          workouts: [...week.workouts, newWorkout],
        };
      });

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };

  const addExercise = (workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;

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

        return {
          ...workout,
          exercises: [...workout.exercises, newExercise],
        };
      });

      return {
        ...prev,
        workouts: updatedWorkouts,
      };
    });
  };

  // Add this custom function to the context provider that supports copying data from the previous set
  const addSet = (workoutId: string, exerciseId: string, initialData?: Partial<Set>) => {
    setProgram((prev) => {
      if (!prev) return prev;
      
      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        
        const updatedExercises = workout.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          
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
          
          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        });
        
        return {
          ...workout,
          exercises: updatedExercises,
        };
      });
      
      return {
        ...prev,
        workouts: updatedWorkouts,
      };
    });
  };

  const updateWeek = (weekId: string, updates: Partial<Week>) => {
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

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return { ...workout, ...updates };
      });

      const updatedWeeks = prev.weeks.map((week) => ({
        ...week,
        workouts: updatedWorkouts.filter((workout) =>
          week.workouts.find((w) => w.id === workout.id)
        ),
      }));

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };

  const updateExercise = (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedExercises = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return { ...exercise, ...updates };
        });

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return {
          ...workout,
          exercises:
            updatedExercises || workout.exercises,
        };
      });

      return {
        ...prev,
        workouts: updatedWorkouts,
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

      const updatedSets = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.find((exercise) => exercise.id === exerciseId)
        ?.sets.map((set) => {
          if (set.id !== setId) return set;
          return { ...set, ...updates };
        });

      const updatedExercises = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return {
            ...exercise,
            sets: updatedSets || exercise.sets,
          };
        });

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return {
          ...workout,
          exercises:
            updatedExercises || workout.exercises,
        };
      });

      return {
        ...prev,
        workouts: updatedWorkouts,
      };
    });
  };

  const deleteWeek = (programId: string, weekId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWeeks = prev.weeks.filter((week) => week.id !== weekId);

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };

  const deleteWorkout = (weekId: string, workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedWorkouts = prev.weeks
        .find((week) => week.id === weekId)
        ?.workouts.filter((workout) => workout.id !== workoutId);

      const updatedWeeks = prev.weeks.map((week) => {
        if (week.id !== weekId) return week;
        return {
          ...week,
          workouts: updatedWorkouts || week.workouts,
        };
      });

      return {
        ...prev,
        weeks: updatedWeeks,
      };
    });
  };

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedExercises = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.filter((exercise) => exercise.id !== exerciseId);

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return {
          ...workout,
          exercises:
            updatedExercises || workout.exercises,
        };
      });

      return {
        ...prev,
        workouts: updatedWorkouts,
      };
    });
  };

  const deleteSet = (workoutId: string, exerciseId: string, setId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const updatedSets = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.find((exercise) => exercise.id === exerciseId)
        ?.sets.filter((set) => set.id !== setId);

      const updatedExercises = prev.workouts
        .find((workout) => workout.id === workoutId)
        ?.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return {
            ...exercise,
            sets: updatedSets || exercise.sets,
          };
        });

      const updatedWorkouts = prev.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        return {
          ...workout,
          exercises:
            updatedExercises || workout.exercises,
        };
      });

      return {
        ...prev,
        workouts: updatedWorkouts,
      };
    });
  };

  const duplicateWorkout = (weekId: string, workoutId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const week = prev.weeks.find((w) => w.id === weekId);
      const workoutToDuplicate = week?.workouts.find((w) => w.id === workoutId);

      if (!workoutToDuplicate) return prev;

      const duplicatedWorkout: Workout = {
        ...workoutToDuplicate,
        id: v4(),
        name: `${workoutToDuplicate.name} (Copy)`,
        exercises: workoutToDuplicate.exercises.map((exercise) => ({
          ...exercise,
          id: v4(),
          sets: exercise.sets.map((set) => ({ ...set, id: v4() })),
        })),
      };

      const updatedWorkouts = [...(week?.workouts || []), duplicatedWorkout];

      const updatedWeeks = prev.weeks.map((w) =>
        w.id === weekId ? { ...w, workouts: updatedWorkouts } : w
      );

      return { ...prev, weeks: updatedWeeks };
    });
  };

  const duplicateExercise = (workoutId: string, exerciseId: string) => {
    setProgram((prev) => {
      if (!prev) return prev;

      const workout = prev.workouts.find((w) => w.id === workoutId);
      const exerciseToDuplicate = workout?.exercises.find((e) => e.id === exerciseId);

      if (!exerciseToDuplicate) return prev;

      const duplicatedExercise: Exercise = {
        ...exerciseToDuplicate,
        id: v4(),
        name: `${exerciseToDuplicate.name} (Copy)`,
        sets: exerciseToDuplicate.sets.map((set) => ({ ...set, id: v4() })),
      };

      const updatedExercises = [...(workout?.exercises || []), duplicatedExercise];

      const updatedWorkouts = prev.workouts.map((w) =>
        w.id === workoutId ? { ...w, exercises: updatedExercises } : w
      );

      return { ...prev, workouts: updatedWorkouts };
    });
  };

  const contextValue: WorkoutContextType = {
    program,
    setProgram,
    addWeek,
    addWorkout,
    addExercise,
    addSet,
    updateWeek,
    updateWorkout,
    updateExercise,
    updateSet,
    deleteWeek,
    deleteWorkout,
    deleteExercise,
    deleteSet,
    duplicateWorkout,
    duplicateExercise,
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
