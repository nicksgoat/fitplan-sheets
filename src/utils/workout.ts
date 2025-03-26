
import { Exercise, WorkoutProgram, WorkoutSession } from "@/types/workout";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptyExercise(): Exercise {
  return {
    id: generateId(),
    name: "",
    sets: 3,
    reps: "",
    weight: "",
    rpe: "",
    rest: "",
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
          sets: 3,
          reps: "12, 10, 8",
          weight: "",
          rpe: "80%",
          rest: "1-3-1 tempo",
          notes: "",
        },
        {
          id: "ex2",
          name: "Back Squat",
          sets: 3,
          reps: "12",
          weight: "95, 115",
          rpe: "",
          rest: "60s",
          notes: "Keep your heels down and drive your knees out over your toes",
        },
        {
          id: "ex3",
          name: "Circuit A",
          sets: 3,
          reps: "",
          weight: "",
          rpe: "",
          rest: "",
          notes: "",
          isGroup: true,
        },
        {
          id: "ex4",
          name: "Kettlebell Swing",
          sets: 3,
          reps: "20s",
          weight: "40",
          rpe: "",
          rest: "",
          notes: "",
          groupId: "ex3",
        },
        {
          id: "ex5",
          name: "Hanging Leg Raise",
          sets: 3,
          reps: "AMRAP",
          weight: "BW",
          rpe: "",
          rest: "",
          notes: "",
          groupId: "ex3",
        },
        {
          id: "ex6",
          name: "Finisher",
          sets: 1,
          reps: "-",
          weight: "",
          rpe: "",
          rest: "",
          notes: "",
        },
        {
          id: "ex7",
          name: "Tricep Pushdowns",
          sets: 3,
          reps: "8-12",
          weight: "50",
          rpe: "",
          rest: "",
          notes: "",
        },
        {
          id: "ex8",
          name: "Hammer Curl",
          sets: 3,
          reps: "8-12",
          weight: "30",
          rpe: "",
          rest: "",
          notes: "",
        },
        {
          id: "ex9",
          name: "Cool down",
          sets: 1,
          reps: "-",
          weight: "",
          rpe: "",
          rest: "",
          notes: "",
        },
        {
          id: "ex10",
          name: "Cat Cows",
          sets: 3,
          reps: "5",
          weight: "",
          rpe: "",
          rest: "",
          notes: "",
        },
        {
          id: "ex11",
          name: "Butterfly Stretch",
          sets: 3,
          reps: "20s",
          weight: "",
          rpe: "",
          rest: "",
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
          sets: 3,
          reps: "12, 10, 8",
          weight: "",
          rpe: "80%",
          rest: "1-3-1 tempo",
          notes: "",
        },
        {
          id: "ex13",
          name: "Romanian Deadlift",
          sets: 3,
          reps: "10",
          weight: "135, 155",
          rpe: "",
          rest: "90s",
          notes: "Keep back flat, hinge at hips",
        },
      ],
    },
  ],
};
