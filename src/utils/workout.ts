import { Exercise, Set, WorkoutProgram, WorkoutSession, WorkoutWeek } from "@/types/workout";

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

export function createEmptySession(day: number, weekId?: string): WorkoutSession {
  return {
    id: generateId(),
    name: `Day ${day}`,
    day,
    exercises: [createEmptyExercise()],
    circuits: [],
    weekId
  };
}

export function createEmptyWeek(weekNumber: number): WorkoutWeek {
  const weekId = generateId();
  return {
    id: weekId,
    weekNumber,
    name: `Week ${weekNumber}`,
    sessions: [createEmptySession(1, weekId)]
  };
}

export function createEmptyProgram(): WorkoutProgram {
  // Create a program with a week structure
  const week1 = createEmptyWeek(1);
  
  return {
    id: generateId(),
    name: "New Workout Program",
    weeks: [week1],
    sessions: [], // Keep for backward compatibility
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
  name: "6-Week Strength Building Program",
  weeks: [
    {
      id: "week1",
      weekNumber: 1,
      name: "Week 1: Foundation",
      sessions: [
        {
          id: "w1day1",
          name: "Day 1: Upper Body",
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
                  rpe: "70%",
                  rest: "90s",
                },
                {
                  id: "set1-2",
                  reps: "10",
                  weight: "155",
                  rpe: "75%",
                  rest: "90s",
                },
                {
                  id: "set1-3",
                  reps: "8",
                  weight: "175",
                  rpe: "80%",
                  rest: "90s",
                }
              ],
              notes: "Focus on form, controlled tempo",
            },
            {
              id: "ex2",
              name: "Barbell Row",
              sets: [
                {
                  id: "set2-1",
                  reps: "12",
                  weight: "95",
                  rpe: "70%",
                  rest: "90s",
                },
                {
                  id: "set2-2",
                  reps: "10",
                  weight: "115",
                  rpe: "75%",
                  rest: "90s",
                },
                {
                  id: "set2-3",
                  reps: "8",
                  weight: "135",
                  rpe: "80%",
                  rest: "90s",
                }
              ],
              notes: "Keep core tight, pull to lower chest",
            }
          ],
          circuits: []
        },
        {
          id: "w1day2",
          name: "Day 2: Lower Body",
          day: 2,
          weekId: "week1",
          exercises: [
            {
              id: "ex3",
              name: "Back Squat",
              sets: [
                {
                  id: "set3-1",
                  reps: "12",
                  weight: "135",
                  rpe: "70%",
                  rest: "120s",
                },
                {
                  id: "set3-2",
                  reps: "10",
                  weight: "155",
                  rpe: "75%",
                  rest: "120s",
                },
                {
                  id: "set3-3",
                  reps: "8",
                  weight: "175",
                  rpe: "80%",
                  rest: "120s",
                }
              ],
              notes: "Proper depth, knees tracking over toes",
            },
            {
              id: "ex4",
              name: "Romanian Deadlift",
              sets: [
                {
                  id: "set4-1",
                  reps: "12",
                  weight: "155",
                  rpe: "70%",
                  rest: "120s",
                },
                {
                  id: "set4-2",
                  reps: "10",
                  weight: "175",
                  rpe: "75%",
                  rest: "120s",
                },
                {
                  id: "set4-3",
                  reps: "8",
                  weight: "195",
                  rpe: "80%",
                  rest: "120s",
                }
              ],
              notes: "Hinge at hips, slight knee bend",
            }
          ],
          circuits: []
        }
      ]
    },
    {
      id: "week2",
      weekNumber: 2,
      name: "Week 2: Progressive Overload",
      sessions: [
        {
          id: "w2day1",
          name: "Day 1: Upper Body",
          day: 1,
          weekId: "week2",
          exercises: [
            {
              id: "w2ex1",
              name: "Incline Bench Press",
              sets: [
                {
                  id: "w2set1-1",
                  reps: "10",
                  weight: "145",
                  rpe: "75%",
                  rest: "90s",
                },
                {
                  id: "w2set1-2",
                  reps: "8",
                  weight: "165",
                  rpe: "80%",
                  rest: "90s",
                },
                {
                  id: "w2set1-3",
                  reps: "6",
                  weight: "185",
                  rpe: "85%",
                  rest: "90s",
                }
              ],
              notes: "Slight incline angle, shoulders back",
            },
            {
              id: "w2ex2",
              name: "Pull-Ups",
              sets: [
                {
                  id: "w2set2-1",
                  reps: "8",
                  weight: "BW",
                  rpe: "80%",
                  rest: "90s",
                },
                {
                  id: "w2set2-2",
                  reps: "8",
                  weight: "BW",
                  rpe: "80%",
                  rest: "90s",
                },
                {
                  id: "w2set2-3",
                  reps: "AMRAP",
                  weight: "BW",
                  rpe: "90%",
                  rest: "90s",
                }
              ],
              notes: "Full range of motion, controlled lowering",
            }
          ],
          circuits: []
        }
      ]
    }
  ],
  sessions: [
    // Keep original sample sessions for backward compatibility
    {
      id: "day1",
      name: "Monday Session",
      day: 1,
      exercises: [
        {
          id: "ex1-old",
          name: "Barbell Bench Press",
          sets: [
            {
              id: "set1-1-old",
              reps: "12",
              weight: "135",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-2-old",
              reps: "10",
              weight: "155",
              rpe: "80%",
              rest: "1-3-1 tempo",
            },
            {
              id: "set1-3-old",
              reps: "8",
              weight: "175",
              rpe: "80%",
              rest: "1-3-1 tempo",
            }
          ],
          notes: "",
        },
        {
          id: "ex2-old",
          name: "Back Squat",
          sets: [
            {
              id: "set2-1-old",
              reps: "12",
              weight: "95",
              rpe: "",
              rest: "60s",
            },
            {
              id: "set2-2-old",
              reps: "12",
              weight: "115",
              rpe: "",
              rest: "60s",
            },
            {
              id: "set2-3-old",
              reps: "12",
              weight: "115",
              rpe: "",
              rest: "60s",
            }
          ],
          notes: "Keep your heels down and drive your knees out over your toes",
        }
      ],
      circuits: [],
    }
  ]
};
