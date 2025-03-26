import { Exercise, Set, WorkoutProgram, WorkoutSession } from "@/types/workout";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptySet(): Set {
  return {
    id: generateId(),
    reps: "",
    weight: "",
    rpe: "",
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

export function createEmptySession(day: number): WorkoutSession {
  return {
    id: generateId(),
    name: `Day ${day} Session`,
    day,
    exercises: [createEmptyExercise()],
  };
}

export function createEmptyProgram(): WorkoutProgram {
  return {
    id: generateId(),
    name: "New Workout Program",
    sessions: [createEmptySession(1)],
  };
}

export function addExerciseToSession(
  session: WorkoutSession,
  afterExerciseId?: string
): WorkoutSession {
  const newExercise = createEmptyExercise();
  
  if (!afterExerciseId) {
    return {
      ...session,
      exercises: [...session.exercises, newExercise],
    };
  }
  
  const exerciseIndex = session.exercises.findIndex(e => e.id === afterExerciseId);
  
  if (exerciseIndex === -1) {
    return {
      ...session,
      exercises: [...session.exercises, newExercise],
    };
  }
  
  const updatedExercises = [...session.exercises];
  updatedExercises.splice(exerciseIndex + 1, 0, newExercise);
  
  return {
    ...session,
    exercises: updatedExercises,
  };
}

export function updateExerciseInSession(
  session: WorkoutSession,
  exerciseId: string,
  updates: Partial<Exercise>
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, ...updates }
        : exercise
    ),
  };
}

export function updateSetInExercise(
  session: WorkoutSession,
  exerciseId: string,
  setId: string,
  updates: Partial<Set>
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(exercise => {
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
  session: WorkoutSession,
  exerciseId: string
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(exercise => {
      if (exercise.id !== exerciseId) return exercise;
      
      return {
        ...exercise,
        sets: [...exercise.sets, createEmptySet()]
      };
    }),
  };
}

export function deleteSetFromExercise(
  session: WorkoutSession,
  exerciseId: string,
  setId: string
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(exercise => {
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

export function deleteExerciseFromSession(
  session: WorkoutSession,
  exerciseId: string
): WorkoutSession {
  // Don't allow deleting the last exercise
  if (session.exercises.length <= 1) {
    return session;
  }
  
  return {
    ...session,
    exercises: session.exercises.filter(exercise => exercise.id !== exerciseId),
  };
}

export function addSessionToProgram(
  program: WorkoutProgram,
  afterSessionId?: string
): WorkoutProgram {
  const newDay = program.sessions.length + 1;
  const newSession = createEmptySession(newDay);
  
  if (!afterSessionId) {
    return {
      ...program,
      sessions: [...program.sessions, newSession],
    };
  }
  
  const sessionIndex = program.sessions.findIndex(s => s.id === afterSessionId);
  
  if (sessionIndex === -1) {
    return {
      ...program,
      sessions: [...program.sessions, newSession],
    };
  }
  
  const updatedSessions = [...program.sessions];
  updatedSessions.splice(sessionIndex + 1, 0, newSession);
  
  // Update day numbers
  const reorderedSessions = updatedSessions.map((session, index) => ({
    ...session,
    day: index + 1,
  }));
  
  return {
    ...program,
    sessions: reorderedSessions,
  };
}

export function updateSessionInProgram(
  program: WorkoutProgram,
  sessionId: string,
  updatedSession: WorkoutSession
): WorkoutProgram {
  return {
    ...program,
    sessions: program.sessions.map(session =>
      session.id === sessionId ? updatedSession : session
    ),
  };
}

export function deleteSessionFromProgram(
  program: WorkoutProgram,
  sessionId: string
): WorkoutProgram {
  // Don't allow deleting the last session
  if (program.sessions.length <= 1) {
    return program;
  }
  
  // Filter out the session to delete
  const updatedSessions = program.sessions
    .filter(session => session.id !== sessionId)
    .map((session, index) => ({
      ...session,
      day: index + 1, // Update day numbers
    }));
  
  return {
    ...program,
    sessions: updatedSessions,
  };
}

export const sampleProgram: WorkoutProgram = {
  id: "sample1",
  name: "Strength Building Program",
  sessions: [
    {
      id: "day1",
      name: "Monday Session",
      day: 1,
      exercises: [
        {
          id: "ex1",
          name: "Barbell Bench Press",
          sets: [
            {
              id: "set1-1",
              reps: "12",
              weight: "135",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-2",
              reps: "10",
              weight: "155",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-3",
              reps: "8",
              weight: "175",
              rpe: "80%",
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
              rpe: "",
              rest: "60s",
            },
            {
              id: "set2-2",
              reps: "12",
              weight: "115",
              rpe: "",
              rest: "60s",
            },
            {
              id: "set2-3",
              reps: "12",
              weight: "115",
              rpe: "",
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
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set4-2",
              reps: "20s",
              weight: "40",
              rpe: "",
              rest: "",
            },
            {
              id: "set4-3",
              reps: "20s",
              weight: "40",
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set5-2",
              reps: "AMRAP",
              weight: "BW",
              rpe: "",
              rest: "",
            },
            {
              id: "set5-3",
              reps: "AMRAP",
              weight: "BW",
              rpe: "",
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
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set7-2",
              reps: "8-12",
              weight: "50",
              rpe: "",
              rest: "",
            },
            {
              id: "set7-3",
              reps: "8-12",
              weight: "50",
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set8-2",
              reps: "8-12",
              weight: "30",
              rpe: "",
              rest: "",
            },
            {
              id: "set8-3",
              reps: "8-12",
              weight: "30",
              rpe: "",
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
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set10-2",
              reps: "5",
              weight: "",
              rpe: "",
              rest: "",
            },
            {
              id: "set10-3",
              reps: "5",
              weight: "",
              rpe: "",
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
              rpe: "",
              rest: "",
            },
            {
              id: "set11-2",
              reps: "20s",
              weight: "",
              rpe: "",
              rest: "",
            },
            {
              id: "set11-3",
              reps: "20s",
              weight: "",
              rpe: "",
              rest: "",
            }
          ],
          notes: "",
        },
      ],
    },
    {
      id: "day2",
      name: "Wednesday Session",
      day: 2,
      exercises: [
        {
          id: "ex12",
          name: "Bench Press",
          sets: [
            {
              id: "set12-1",
              reps: "12",
              weight: "",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set12-2",
              reps: "10",
              weight: "",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set12-3",
              reps: "8",
              weight: "",
              rpe: "80%",
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
              rpe: "",
              rest: "90s",
            },
            {
              id: "set13-2",
              reps: "10",
              weight: "155",
              rpe: "",
              rest: "90s",
            },
            {
              id: "set13-3",
              reps: "10",
              weight: "155",
              rpe: "",
              rest: "90s",
            }
          ],
          notes: "Keep back flat, hinge at hips",
        },
      ],
    },
  ],
};
