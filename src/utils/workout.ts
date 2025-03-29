import { Exercise, Set, WorkoutProgram, Workout, WorkoutWeek } from "@/types/workout";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptySet(): Set {
  return {
    id: generateId(),
    reps: "",
    weight: "",
    intensity: "",
    rest: "",
  };
}

export function createEmptyExercise(): Exercise {
  return {
    id: generateId(),
    name: "",
    sets: [createEmptySet()],
    notes: "",
  };
}

export function createEmptyWorkout(day: number, weekId?: string): Workout {
  return {
    id: generateId(),
    name: `Day ${day} Workout`,
    day,
    exercises: [createEmptyExercise()],
    circuits: [],
    weekId
  };
}

export function createEmptyWeek(order: number): WorkoutWeek {
  const workoutId = generateId();
  
  return {
    id: generateId(),
    name: `Week ${order}`,
    order,
    workouts: [workoutId]
  };
}

export function createEmptyProgram(): WorkoutProgram {
  const week = createEmptyWeek(1);
  const workout = createEmptyWorkout(1, week.id);
  
  return {
    id: generateId(),
    name: "New Workout Program",
    workouts: [workout],
    weeks: [week]
  };
}

export function addExerciseToWorkout(
  workout: Workout,
  afterExerciseId?: string
): Workout {
  const newExercise = createEmptyExercise();
  
  if (!afterExerciseId) {
    return {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };
  }
  
  const exerciseIndex = workout.exercises.findIndex(e => e.id === afterExerciseId);
  
  if (exerciseIndex === -1) {
    return {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };
  }
  
  const updatedExercises = [...workout.exercises];
  updatedExercises.splice(exerciseIndex + 1, 0, newExercise);
  
  return {
    ...workout,
    exercises: updatedExercises,
  };
}

export function updateExerciseInWorkout(
  workout: Workout,
  exerciseId: string,
  updates: Partial<Exercise>
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, ...updates }
        : exercise
    ),
  };
}

export function updateSetInExercise(
  workout: Workout,
  exerciseId: string,
  setId: string,
  updates: Partial<Set>
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise => {
      if (exercise.id !== exerciseId) return exercise;
      
      return {
        ...exercise,
        sets: exercise.sets.map(set =>
          set.id === setId ? { ...set, ...updates } : set
        )
      };
    }),
  };
}

export function addSetToExercise(
  workout: Workout,
  exerciseId: string
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise => {
      if (exercise.id !== exerciseId) return exercise;
      
      // Get the last set to copy its values
      const lastSet = exercise.sets[exercise.sets.length - 1];
      
      // Create a new set that inherits values from the last set
      const newSet: Set = {
        id: generateId(),
        reps: lastSet.reps,
        weight: lastSet.weight,
        intensity: lastSet.intensity,
        intensityType: lastSet.intensityType,
        weightType: lastSet.weightType,
        rest: lastSet.rest,
      };
      
      return {
        ...exercise,
        sets: [...exercise.sets, newSet]
      };
    }),
  };
}

export function deleteSetFromExercise(
  workout: Workout,
  exerciseId: string,
  setId: string
): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise => {
      if (exercise.id !== exerciseId) return exercise;
      
      // Don't allow deleting the last set
      if (exercise.sets.length <= 1) return exercise;
      
      return {
        ...exercise,
        sets: exercise.sets.filter(set => set.id !== setId)
      };
    }),
  };
}

export function deleteExerciseFromWorkout(
  workout: Workout,
  exerciseId: string
): Workout {
  // Don't allow deleting the last exercise
  if (workout.exercises.length <= 1) {
    return workout;
  }
  
  return {
    ...workout,
    exercises: workout.exercises.filter(exercise => exercise.id !== exerciseId),
  };
}

export function addWorkoutToProgram(
  program: WorkoutProgram,
  weekId: string,
  afterWorkoutId?: string
): WorkoutProgram {
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) return program;

  const workoutsInWeek = week.workouts.length;
  const newWorkout = createEmptyWorkout(workoutsInWeek + 1, weekId);
  
  const updatedProgram = {
    ...program,
    workouts: [...program.workouts, newWorkout]
  };
  
  if (!afterWorkoutId) {
    return {
      ...updatedProgram,
      weeks: program.weeks.map(w => 
        w.id === weekId 
          ? { ...w, workouts: [...w.workouts, newWorkout.id] }
          : w
      )
    };
  }
  
  const workoutIndex = week.workouts.findIndex(id => id === afterWorkoutId);
  
  if (workoutIndex === -1) {
    return {
      ...updatedProgram,
      weeks: program.weeks.map(w => 
        w.id === weekId 
          ? { ...w, workouts: [...w.workouts, newWorkout.id] }
          : w
      )
    };
  }
  
  const updatedWorkouts = [...week.workouts];
  updatedWorkouts.splice(workoutIndex + 1, 0, newWorkout.id);
  
  return {
    ...updatedProgram,
    weeks: program.weeks.map(w => 
      w.id === weekId 
        ? { ...w, workouts: updatedWorkouts }
        : w
    )
  };
}

export function addWeekToProgram(
  program: WorkoutProgram,
  afterWeekId?: string
): WorkoutProgram {
  const newWeekOrder = program.weeks.length + 1;
  const newWeek = createEmptyWeek(newWeekOrder);
  const newWorkout = createEmptyWorkout(1, newWeek.id);
  
  if (!afterWeekId) {
    return {
      ...program,
      weeks: [...program.weeks, newWeek],
      workouts: [...program.workouts, newWorkout]
    };
  }
  
  const weekIndex = program.weeks.findIndex(w => w.id === afterWeekId);
  
  if (weekIndex === -1) {
    return {
      ...program,
      weeks: [...program.weeks, newWeek],
      workouts: [...program.workouts, newWorkout]
    };
  }
  
  const updatedWeeks = [...program.weeks];
  updatedWeeks.splice(weekIndex + 1, 0, newWeek);
  
  // Update week order numbers
  const reorderedWeeks = updatedWeeks.map((week, index) => ({
    ...week,
    order: index + 1,
  }));
  
  return {
    ...program,
    weeks: reorderedWeeks,
    workouts: [...program.workouts, newWorkout]
  };
}

export function updateWorkoutInProgram(
  program: WorkoutProgram,
  workoutId: string,
  updatedWorkout: Workout
): WorkoutProgram {
  return {
    ...program,
    workouts: program.workouts.map(workout =>
      workout.id === workoutId ? updatedWorkout : workout
    )
  };
}

export function updateWeekInProgram(
  program: WorkoutProgram,
  weekId: string,
  updates: Partial<WorkoutWeek>
): WorkoutProgram {
  return {
    ...program,
    weeks: program.weeks.map(week =>
      week.id === weekId ? { ...week, ...updates } : week
    )
  };
}

export function deleteWorkoutFromProgram(
  program: WorkoutProgram,
  workoutId: string
): WorkoutProgram {
  const workoutToDelete = program.workouts.find(s => s.id === workoutId);
  if (!workoutToDelete) return program;
  
  const weekId = workoutToDelete.weekId;
  if (!weekId) return program;
  
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) return program;
  
  // Don't allow deleting the last workout in a week
  if (week.workouts.length <= 1) {
    return program;
  }
  
  // Filter out the workout from the program
  const updatedWorkouts = program.workouts.filter(
    workout => workout.id !== workoutId
  );
  
  // Filter out the workout ID from the week
  const updatedWeeks = program.weeks.map(week => {
    if (week.id !== weekId) return week;
    
    return {
      ...week,
      workouts: week.workouts.filter(id => id !== workoutId)
    };
  });
  
  return {
    ...program,
    workouts: updatedWorkouts,
    weeks: updatedWeeks
  };
}

export function deleteWeekFromProgram(
  program: WorkoutProgram,
  weekId: string
): WorkoutProgram {
  // Don't allow deleting the last week
  if (program.weeks.length <= 1) {
    return program;
  }
  
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) return program;
  
  // Filter out the week from the program
  const updatedWeeks = program.weeks
    .filter(week => week.id !== weekId)
    .map((week, index) => ({
      ...week,
      order: index + 1 // Update order numbers
    }));
  
  // Filter out the workouts that were in this week
  const updatedWorkouts = program.workouts.filter(
    workout => workout.weekId !== weekId
  );
  
  return {
    ...program,
    workouts: updatedWorkouts,
    weeks: updatedWeeks
  };
}

export function cloneWorkout(workout: Workout, newWeekId?: string): Workout {
  // Create a new workout with a new ID
  const newWorkout: Workout = {
    ...workout,
    id: generateId(),
    weekId: newWeekId || workout.weekId,
    exercises: [],
    circuits: []
  };

  // Clone all exercises with new IDs
  const exerciseIdMap = new Map<string, string>();
  const circuitIdMap = new Map<string, string>();
  
  // First pass: create new exercises without circuit relationships
  newWorkout.exercises = workout.exercises.map(exercise => {
    const newId = generateId();
    exerciseIdMap.set(exercise.id, newId);
    
    // Create new exercise with new ID
    const newExercise: Exercise = {
      ...exercise,
      id: newId,
      sets: exercise.sets.map(set => ({
        ...set,
        id: generateId()
      }))
    };
    
    // Handle circuit IDs
    if (exercise.circuitId) {
      // If we haven't encountered this circuit ID yet, generate a new one
      if (!circuitIdMap.has(exercise.circuitId)) {
        circuitIdMap.set(exercise.circuitId, generateId());
      }
      newExercise.circuitId = circuitIdMap.get(exercise.circuitId);
    }
    
    return newExercise;
  });
  
  // Second pass: Clone all circuits with new IDs
  if (workout.circuits && workout.circuits.length > 0) {
    newWorkout.circuits = workout.circuits.map(circuit => {
      const newCircuitId = circuitIdMap.get(circuit.id) || generateId();
      
      return {
        ...circuit,
        id: newCircuitId,
        exercises: circuit.exercises.map(exId => 
          exerciseIdMap.get(exId) || generateId()
        )
      };
    });
  }
  
  return newWorkout;
}

export function copyProgramAsPreset(program: WorkoutProgram, presetName: string): WorkoutProgram {
  return {
    id: generateId(),
    name: presetName,
    workouts: program.workouts,
    weeks: program.weeks
  };
}

export function saveCurrentWeekAsPreset(program: WorkoutProgram, weekId: string, presetName: string): WorkoutWeek {
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) throw new Error("Week not found");
  
  // Create a deep copy of the week with a new ID
  const weekCopy: WorkoutWeek = {
    id: generateId(),
    name: presetName,
    order: week.order,
    workouts: [...week.workouts]  // Keep the reference to the original workout IDs
  };
  
  return weekCopy;
}

export function saveCurrentWorkoutAsPreset(program: WorkoutProgram, workoutId: string, presetName: string): Workout {
  const workout = program.workouts.find(s => s.id === workoutId);
  if (!workout) throw new Error("Workout not found");
  
  // Create a deep copy of the workout using the clone function
  const workoutCopy = cloneWorkout(workout);
  workoutCopy.name = presetName;
  
  return workoutCopy;
}

export const sampleProgram: WorkoutProgram = {
  id: "sample1",
  name: "Strength Building Program",
  weeks: [
    {
      id: "week1",
      name: "Week 1 - Foundation",
      order: 1,
      workouts: ["day1", "day2"]
    },
    {
      id: "week2",
      name: "Week 2 - Progress",
      order: 2,
      workouts: ["day3"]
    }
  ],
  workouts: [
    {
      id: "day1",
      name: "Monday Workout",
      day: 1,
      weekId: "week1",
      exercises: [
        {
          id: "ex1",
          name: "Barbell Bench Press",
          sets: [
            {
              id: "set1-1",
              reps: "12",
              weight: "135",
              intensity: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-2",
              reps: "10",
              weight: "155",
              intensity: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-3",
              reps: "8",
              weight: "175",
              intensity: "80%",
              rest: "1-3-1 tempo",
            }
          ],
          notes: "",
        },
        {
          id: "ex2",
          name: "Back Squat",
          sets: [
            {
              id: "set2-1",
              reps: "12",
              weight: "95",
              intensity: "",
              rest: "60s",
            },
            {
              id: "set2-2",
              reps: "12",
              weight: "115",
              intensity: "",
              rest: "60s",
            },
            {
              id: "set2-3",
              reps: "12",
              weight: "115",
              intensity: "",
              rest: "60s",
            }
          ],
          notes: "Keep your heels down and drive your knees out over your toes",
        },
        {
          id: "ex3",
          name: "Circuit A",
          sets: [
            {
              id: "set3-1",
              reps: "",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
          isGroup: true,
        },
        {
          id: "ex4",
          name: "Kettlebell Swing",
          sets: [
            {
              id: "set4-1",
              reps: "20s",
              weight: "40",
              intensity: "",
              rest: "",
            },
            {
              id: "set4-2",
              reps: "20s",
              weight: "40",
              intensity: "",
              rest: "",
            },
            {
              id: "set4-3",
              reps: "20s",
              weight: "40",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
          groupId: "ex3",
        },
        {
          id: "ex5",
          name: "Hanging Leg Raise",
          sets: [
            {
              id: "set5-1",
              reps: "AMRAP",
              weight: "BW",
              intensity: "",
              rest: "",
            },
            {
              id: "set5-2",
              reps: "AMRAP",
              weight: "BW",
              intensity: "",
              rest: "",
            },
            {
              id: "set5-3",
              reps: "AMRAP",
              weight: "BW",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
          groupId: "ex3",
        },
        {
          id: "ex6",
          name: "Finisher",
          sets: [
            {
              id: "set6-1",
              reps: "-",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
        {
          id: "ex7",
          name: "Tricep Pushdowns",
          sets: [
            {
              id: "set7-1",
              reps: "8-12",
              weight: "50",
              intensity: "",
              rest: "",
            },
            {
              id: "set7-2",
              reps: "8-12",
              weight: "50",
              intensity: "",
              rest: "",
            },
            {
              id: "set7-3",
              reps: "8-12",
              weight: "50",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
        {
          id: "ex8",
          name: "Hammer Curl",
          sets: [
            {
              id: "set8-1",
              reps: "8-12",
              weight: "30",
              intensity: "",
              rest: "",
            },
            {
              id: "set8-2",
              reps: "8-12",
              weight: "30",
              intensity: "",
              rest: "",
            },
            {
              id: "set8-3",
              reps: "8-12",
              weight: "30",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
        {
          id: "ex9",
          name: "Cool down",
          sets: [
            {
              id: "set9-1",
              reps: "-",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
        {
          id: "ex10",
          name: "Cat Cows",
          sets: [
            {
              id: "set10-1",
              reps: "5",
              weight: "",
              intensity: "",
              rest: "",
            },
            {
              id: "set10-2",
              reps: "5",
              weight: "",
              intensity: "",
              rest: "",
            },
            {
              id: "set10-3",
              reps: "5",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
        {
          id: "ex11",
          name: "Butterfly Stretch",
          sets: [
            {
              id: "set11-1",
              reps: "20s",
              weight: "",
              intensity: "",
              rest: "",
            },
            {
              id: "set11-2",
              reps: "20s",
              weight: "",
              intensity: "",
              rest: "",
            },
            {
              id: "set11-3",
              reps: "20s",
              weight: "",
              intensity: "",
              rest: "",
            }
          ],
          notes: "",
        },
      ],
      circuits: [],
    },
    {
      id: "day2",
      name: "Wednesday Workout",
      day: 2,
      weekId: "week1",
      exercises: [
        {
          id: "ex12",
          name: "Bench Press",
          sets: [
            {
              id: "set12-1",
              reps: "12",
              weight: "",
              intensity: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set12-2",
              reps: "10",
              weight: "",
              intensity: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set12-3",
              reps: "8",
              weight: "",
              intensity: "80%",
              rest: "1-3-1 tempo",
            }
          ],
          notes: "",
        },
        {
          id: "ex13",
          name: "Romanian Deadlift",
          sets: [
            {
              id: "set13-1",
              reps: "10",
              weight: "135",
              intensity: "",
              rest: "90s",
            },
            {
              id: "set13-2",
              reps: "10",
              weight: "155",
              intensity: "",
              rest: "90s",
            },
            {
              id: "set13-3",
              reps: "10",
              weight: "155",
              intensity: "",
              rest: "90s",
            }
          ],
          notes: "Keep back flat, hinge at hips",
        },
      ],
      circuits: [],
    },
    {
      id: "day3",
      name: "Monday Workout",
      day: 1,
      weekId: "week2",
      exercises: [
        {
          id: "ex14",
          name: "Squat",
          sets: [
            {
              id: "set14-1",
              reps: "8",
              weight: "185",
              intensity: "80%",
              rest: "2 min",
            },
            {
              id: "set14-2",
              reps: "8",
              weight: "205",
              intensity: "80%",
              rest: "2 min",
            },
            {
              id: "set14-3",
              reps: "8",
              weight: "225",
              intensity: "80%",
              rest: "2 min",
            }
          ],
          notes: "Focus on depth",
        },
      ],
      circuits: [],
    },
  ],
};
