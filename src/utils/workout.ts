
import { Exercise, Set, WorkoutProgram, WorkoutSession, WorkoutWeek } from "@/types/workout";

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

export function createEmptySession(day: number, weekId?: string): WorkoutSession {
  return {
    id: generateId(),
    name: `Day ${day} Session`,
    day,
    exercises: [createEmptyExercise()],
    circuits: [],
    weekId
  };
}

export function createEmptyWeek(order: number): WorkoutWeek {
  const sessionId = generateId();
  
  return {
    id: generateId(),
    name: `Week ${order}`,
    order,
    sessions: [sessionId]
  };
}

export function createEmptyProgram(): WorkoutProgram {
  const week = createEmptyWeek(1);
  const session = createEmptySession(1, week.id);
  
  return {
    id: generateId(),
    name: "New Workout Program",
    sessions: [session],
    weeks: [week]
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
  weekId: string,
  afterSessionId?: string
): WorkoutProgram {
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) return program;

  const sessionsInWeek = week.sessions.length;
  const newSession = createEmptySession(sessionsInWeek + 1, weekId);
  
  const updatedProgram = {
    ...program,
    sessions: [...program.sessions, newSession]
  };
  
  if (!afterSessionId) {
    return {
      ...updatedProgram,
      weeks: program.weeks.map(w => 
        w.id === weekId 
          ? { ...w, sessions: [...w.sessions, newSession.id] }
          : w
      )
    };
  }
  
  const sessionIndex = week.sessions.findIndex(id => id === afterSessionId);
  
  if (sessionIndex === -1) {
    return {
      ...updatedProgram,
      weeks: program.weeks.map(w => 
        w.id === weekId 
          ? { ...w, sessions: [...w.sessions, newSession.id] }
          : w
      )
    };
  }
  
  const updatedSessions = [...week.sessions];
  updatedSessions.splice(sessionIndex + 1, 0, newSession.id);
  
  return {
    ...updatedProgram,
    weeks: program.weeks.map(w => 
      w.id === weekId 
        ? { ...w, sessions: updatedSessions }
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
  const newSession = createEmptySession(1, newWeek.id);
  
  if (!afterWeekId) {
    return {
      ...program,
      weeks: [...program.weeks, newWeek],
      sessions: [...program.sessions, newSession]
    };
  }
  
  const weekIndex = program.weeks.findIndex(w => w.id === afterWeekId);
  
  if (weekIndex === -1) {
    return {
      ...program,
      weeks: [...program.weeks, newWeek],
      sessions: [...program.sessions, newSession]
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
    sessions: [...program.sessions, newSession]
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

export function deleteSessionFromProgram(
  program: WorkoutProgram,
  sessionId: string
): WorkoutProgram {
  const sessionToDelete = program.sessions.find(s => s.id === sessionId);
  if (!sessionToDelete) return program;
  
  const weekId = sessionToDelete.weekId;
  if (!weekId) return program;
  
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) return program;
  
  // Don't allow deleting the last session in a week
  if (week.sessions.length <= 1) {
    return program;
  }
  
  // Filter out the session from the program
  const updatedSessions = program.sessions.filter(
    session => session.id !== sessionId
  );
  
  // Filter out the session ID from the week
  const updatedWeeks = program.weeks.map(week => {
    if (week.id !== weekId) return week;
    
    return {
      ...week,
      sessions: week.sessions.filter(id => id !== sessionId)
    };
  });
  
  return {
    ...program,
    sessions: updatedSessions,
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
  
  // Filter out the sessions that were in this week
  const updatedSessions = program.sessions.filter(
    session => session.weekId !== weekId
  );
  
  return {
    ...program,
    sessions: updatedSessions,
    weeks: updatedWeeks
  };
}

export function cloneSession(session: WorkoutSession, newWeekId?: string): WorkoutSession {
  // Create a new session with a new ID
  const newSession: WorkoutSession = {
    ...session,
    id: generateId(),
    weekId: newWeekId || session.weekId,
    exercises: [],
    circuits: []
  };

  // Clone all exercises with new IDs
  const exerciseIdMap = new Map<string, string>();
  const circuitIdMap = new Map<string, string>();
  
  // First pass: create new exercises without circuit relationships
  newSession.exercises = session.exercises.map(exercise => {
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
  if (session.circuits && session.circuits.length > 0) {
    newSession.circuits = session.circuits.map(circuit => {
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
  
  return newSession;
}

export function copyProgramAsPreset(program: WorkoutProgram, presetName: string): WorkoutProgram {
  return {
    id: generateId(),
    name: presetName,
    sessions: program.sessions,
    weeks: program.weeks
  };
}

export function saveCurrentWeekAsPreset(program: WorkoutProgram, weekId: string, presetName: string): WorkoutWeek {
  const week = program.weeks.find(w => w.id === weekId);
  if (!week) throw new Error("Week not found");
  
  // Create a deep copy of the week
  const weekCopy: WorkoutWeek = {
    id: generateId(),
    name: presetName,
    order: week.order,
    sessions: [...week.sessions]
  };
  
  return weekCopy;
}

export function saveCurrentSessionAsPreset(program: WorkoutProgram, sessionId: string, presetName: string): WorkoutSession {
  const session = program.sessions.find(s => s.id === sessionId);
  if (!session) throw new Error("Session not found");
  
  // Create a deep copy of the session using the clone function
  const sessionCopy = cloneSession(session);
  sessionCopy.name = presetName;
  
  return sessionCopy;
}

export const sampleProgram: WorkoutProgram = {
  id: "sample1",
  name: "Strength Building Program",
  weeks: [
    {
      id: "week1",
      name: "Week 1 - Foundation",
      order: 1,
      sessions: ["day1", "day2"]
    },
    {
      id: "week2",
      name: "Week 2 - Progress",
      order: 2,
      sessions: ["day3"]
    }
  ],
  sessions: [
    {
      id: "day1",
      name: "Monday Session",
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
      name: "Wednesday Session",
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
      name: "Monday Session",
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
