import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { produce } from "immer"; // Fixed import to use named import
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
  addWorkout: (weekId: string) => string;
  addWeek: () => string;
  addCircuit: (workoutId: string) => void;
  addExercise: (workoutId: string, libraryExerciseId?: string) => void;
  addExerciseToWorkout: (workoutId: string) => void;
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
  createCircuit: (workoutId: string) => void;
  createSuperset: (workoutId: string) => void;
  createEMOM: (workoutId: string) => void;
  createAMRAP: (workoutId: string) => void;
  createTabata: (workoutId: string) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  saveWorkoutToLibrary: (workoutId: string, name: string) => void;
  saveWeekToLibrary: (weekId: string, name: string) => void;
  saveProgramToLibrary: (name: string) => void;
  loadWorkoutFromLibrary: (workoutIdOrObj: string | Workout, weekId: string, dayNumber?: number) => void;
  loadWeekFromLibrary: (week: WorkoutWeek) => void;
  loadProgramFromLibrary: (program: WorkoutProgram) => void;
  getWorkoutLibrary: () => Workout[];
  getWeekLibrary: () => WorkoutWeek[];
  getProgramLibrary: () => WorkoutProgram[];
  removeWorkoutFromLibrary: (id: string) => void;
  removeWeekFromLibrary: (id: string) => void;
  removeProgramFromLibrary: (id: string) => void;
  updateWorkoutName: (workoutId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
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
    const newWorkout: Workout = {
      id: newWorkoutId,
      name: `Day ${nextDayNumber}`,
      day: nextDayNumber,
      exercises: [
        {
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
        }
      ],
      circuits: [],
      weekId: weekId,
    };

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
    const newCircuit: Circuit = {
      id: uuidv4(),
      name: "New Circuit",
      exercises: [],
    };

    updateWorkout(workoutId, (workout) => {
      workout.circuits.push(newCircuit);
    });
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

  const addExerciseToWorkout = useCallback((workoutId: string) => {
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
    const circuitId = uuidv4();
    
    updateWorkout(workoutId, (workout) => {
      const circuitExercise: Exercise = {
        id: circuitId,
        name: "Circuit",
        sets: [],
        notes: "Perform exercises in sequence with minimal rest",
        isCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(circuitExercise);
      
      const exercise1: Exercise = {
        id: uuidv4(),
        name: "Exercise 1",
        sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "30s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      const exercise2: Exercise = {
        id: uuidv4(),
        name: "Exercise 2",
        sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "30s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(exercise1, exercise2);
    });
  }, [updateWorkout]);
  
  const createSuperset = useCallback((workoutId: string) => {
    const circuitId = uuidv4();
    
    updateWorkout(workoutId, (workout) => {
      const circuitExercise: Exercise = {
        id: circuitId,
        name: "Superset",
        sets: [],
        notes: "Perform these exercises back-to-back with no rest between",
        isCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(circuitExercise);
      
      const exercise1: Exercise = {
        id: uuidv4(),
        name: "Exercise A",
        sets: [{ id: uuidv4(), reps: "12", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      const exercise2: Exercise = {
        id: uuidv4(),
        name: "Exercise B",
        sets: [{ id: uuidv4(), reps: "12", weight: "", intensity: "", rest: "60s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(exercise1, exercise2);
    });
  }, [updateWorkout]);
  
  const createEMOM = useCallback((workoutId: string) => {
    const circuitId = uuidv4();
    
    updateWorkout(workoutId, (workout) => {
      const circuitExercise: Exercise = {
        id: circuitId,
        name: "EMOM - 10 min",
        sets: [],
        notes: "Every Minute On the Minute for 10 minutes",
        isCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(circuitExercise);
      
      const exercise1: Exercise = {
        id: uuidv4(),
        name: "Even Minutes",
        sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      const exercise2: Exercise = {
        id: uuidv4(),
        name: "Odd Minutes",
        sets: [{ id: uuidv4(), reps: "8", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(exercise1, exercise2);
    });
  }, [updateWorkout]);
  
  const createAMRAP = useCallback((workoutId: string) => {
    const circuitId = uuidv4();
    
    updateWorkout(workoutId, (workout) => {
      const circuitExercise: Exercise = {
        id: circuitId,
        name: "AMRAP - 12 min",
        sets: [],
        notes: "As Many Rounds As Possible in 12 minutes",
        isCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(circuitExercise);
      
      const exercise1: Exercise = {
        id: uuidv4(),
        name: "Exercise 1",
        sets: [{ id: uuidv4(), reps: "10", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      const exercise2: Exercise = {
        id: uuidv4(),
        name: "Exercise 2",
        sets: [{ id: uuidv4(), reps: "15", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      const exercise3: Exercise = {
        id: uuidv4(),
        name: "Exercise 3",
        sets: [{ id: uuidv4(), reps: "20", weight: "", intensity: "", rest: "0s" }],
        notes: "",
        isInCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(exercise1, exercise2, exercise3);
    });
  }, [updateWorkout]);
  
  const createTabata = useCallback((workoutId: string) => {
    const circuitId = uuidv4();
    
    updateWorkout(workoutId, (workout) => {
      const circuitExercise: Exercise = {
        id: circuitId,
        name: "Tabata - 4 min",
        sets: [],
        notes: "8 rounds of 20s work, 10s rest",
        isCircuit: true,
        circuitId,
      };
      
      workout.exercises.push(circuitExercise);
      
      const exercise1: Exercise = {
        id: uuidv4(),
        name: "Tabata Exercise",
        sets: [{ id: uuidv4(), reps: "20s", weight: "", intensity: "", rest: "10s" }],
        notes: "Max effort for 20 seconds, then rest 10 seconds. Repeat 8 times.",
        isInCircuit: true,
        circuitId,
        repType: "time",
      };
      
      workout.exercises.push(exercise1);
    });
  }, [updateWorkout]);
  
  const loadSampleProgram = useCallback(() => {
    const sampleProgram: WorkoutProgram = {
      id: uuidv4(),
      name: "Sample Training Program",
      workouts: [
        {
          id: uuidv4(),
          name: "Upper Body",
          day: 1,
          exercises: [
            {
              id: uuidv4(),
              name: "Bench Press",
              sets: [
                { id: uuidv4(), reps: "10,8,8,6", weight: "135,145,155,165", intensity: "", rest: "90s" }
              ],
              notes: "Focus on chest contraction",
            },
            {
              id: uuidv4(),
              name: "Pull-ups",
              sets: [
                { id: uuidv4(), reps: "8,8,8", weight: "BW", intensity: "", rest: "60s" }
              ],
              notes: "",
            }
          ],
          circuits: [],
        },
        {
          id: uuidv4(),
          name: "Lower Body",
          day: 2,
          exercises: [
            {
              id: uuidv4(),
              name: "Squats",
              sets: [
                { id: uuidv4(), reps: "10,8,6", weight: "185,205,225", intensity: "", rest: "120s" }
              ],
              notes: "",
            },
            {
              id: uuidv4(),
              name: "Romanian Deadlift",
              sets: [
                { id: uuidv4(), reps: "10,10,10", weight: "135,145,155", intensity: "", rest: "90s" }
              ],
              notes: "Keep back straight",
            }
          ],
          circuits: [],
        }
      ],
      weeks: [],
    };
    
    const week: WorkoutWeek = {
      id: uuidv4(),
      name: "Week 1",
      order: 0,
      workouts: [],
    };
    
    for (const workout of sampleProgram.workouts) {
      week.workouts.push(workout.id);
      workout.weekId = week.id;
    }
    
    sampleProgram.weeks.push(week);
    
    setProgram(sampleProgram);
    setActiveWeekId(week.id);
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
    if (!workoutToSave) return;
    
    const savedWorkout = {
      ...workoutToSave,
      id: uuidv4(),
      name: name
    };
    
    setWorkoutLibrary(prev => [...prev, savedWorkout]);
  }, [program]);
  
  const saveWeekToLibrary = useCallback((weekId: string, name: string) => {
    if (!program) return;
    
    const weekToSave = program.weeks.find(w => w.id === weekId);
    if (!weekToSave) return;
    
    const weekWorkouts = weekToSave.workouts.map(
      wId => program.workouts.find(w => w.id === wId)
    ).filter(Boolean) as Workout[];
    
    const newWorkouts = weekWorkouts.map(workout => ({
      ...workout,
      id: uuidv4()
    }));
    
    const savedWeek = {
      ...weekToSave,
      id: uuidv4(),
      name: name,
      workouts: newWorkouts.map(w => w.id)
    };
    
    setWeekLibrary(prev => [...prev, savedWeek]);
  }, [program]);
  
  const saveProgramToLibrary = useCallback((name: string) => {
    if (!program) return;
    
    const savedProgram = {
      ...program,
      id: uuidv4(),
      name: name
    };
    
    setProgramLibrary(prev => [...prev, savedProgram]);
  }, [program]);
  
  const loadWorkoutFromLibrary = useCallback((workoutIdOrObj: string | Workout, weekId: string, dayNumber?: number) => {
    let libraryWorkout: Workout | undefined;
    
    if (typeof workoutIdOrObj === 'string') {
      libraryWorkout = workoutLibrary.find(w => w.id === workoutIdOrObj);
    } else {
      libraryWorkout = workoutIdOrObj;
    }
    
    if (!libraryWorkout) {
      console.error("Workout not found in library:", workoutIdOrObj);
      return;
    }
    
    const newWorkout = {
      ...libraryWorkout,
      id: uuidv4(),
      weekId: weekId,
      day: dayNumber || libraryWorkout.day,
      exercises: libraryWorkout.exercises.map(ex => ({
        ...ex,
        id: uuidv4(),
        sets: ex.sets.map(set => ({
          ...set,
          id: uuidv4()
        }))
      }))
    };
    
    updateProgram(draft => {
      draft.workouts.push(newWorkout);
      
      const week = draft.weeks.find(w => w.id === weekId);
      if (week) {
        week.workouts.push(newWorkout.id);
      }
    });
    
    return newWorkout.id;
  }, [updateProgram, workoutLibrary]);
  
  const loadWeekFromLibrary = useCallback((week: WorkoutWeek) => {
    const newWeekId = uuidv4();
    const newWeek = {
      ...week,
      id: newWeekId,
      order: program?.weeks.length || 0,
      workouts: []
    };
    
    const weekWorkouts = week.workouts.map(wId => {
      const foundWorkout = workoutLibrary.find(w => w.id === wId);
      if (foundWorkout) {
        return {
          ...foundWorkout,
          id: uuidv4(),
          weekId: newWeekId,
          exercises: foundWorkout.exercises.map(ex => ({
            ...ex,
            id: uuidv4(),
            sets: ex.sets.map(set => ({
              ...set,
              id: uuidv4()
            }))
          }))
        };
      }
      return null;
    }).filter(Boolean) as Workout[];
    
    newWeek.workouts = weekWorkouts.map(w => w.id);
    
    updateProgram(draft => {
      draft.weeks.push(newWeek);
      draft.workouts.push(...weekWorkouts);
    });
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
