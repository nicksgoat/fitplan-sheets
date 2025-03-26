
import React, { createContext, useContext, useState } from "react";
import { Exercise, Set, WorkoutProgram, WorkoutSession } from "@/types/workout";
import { 
  createEmptyProgram, 
  addExerciseToSession, 
  updateExerciseInSession,
  updateSetInExercise,
  addSetToExercise,
  deleteSetFromExercise,
  deleteExerciseFromSession,
  addSessionToProgram,
  updateSessionInProgram,
  deleteSessionFromProgram,
  sampleProgram
} from "@/utils/workout";
import { toast } from "sonner";

interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  addExercise: (sessionId: string, afterExerciseId?: string) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  addSession: (afterSessionId?: string) => void;
  deleteSession: (sessionId: string) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(program.sessions[0]?.id || null);

  const updateSessionName = (sessionId: string, name: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) =>
        session.id === sessionId ? { ...session, name } : session
      );
      return { ...prevProgram, sessions: updatedSessions };
    });
  };

  const updateExercise = (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return updateExerciseInSession(session, exerciseId, updates);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
  };

  const updateSet = (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return updateSetInExercise(session, exerciseId, setId, updates);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
  };

  const addExercise = (sessionId: string, afterExerciseId?: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return addExerciseToSession(session, afterExerciseId);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
    toast.success("Exercise added");
  };

  const addSet = (sessionId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return addSetToExercise(session, exerciseId);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
    toast.success("Set added");
  };

  const deleteSet = (sessionId: string, exerciseId: string, setId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return deleteSetFromExercise(session, exerciseId, setId);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
    toast.success("Set deleted");
  };

  const deleteExercise = (sessionId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const session = prevProgram.sessions.find(s => s.id === sessionId);
      if (!session || session.exercises.length <= 1) {
        toast.error("Cannot delete the last exercise");
        return prevProgram;
      }
      
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return deleteExerciseFromSession(session, exerciseId);
      });
      return { ...prevProgram, sessions: updatedSessions };
    });
    toast.success("Exercise deleted");
  };

  const addSession = (afterSessionId?: string) => {
    setProgram((prevProgram) => {
      const updatedProgram = addSessionToProgram(prevProgram, afterSessionId);
      // Set active session to the new session
      const newSession = updatedProgram.sessions[updatedProgram.sessions.length - 1];
      setActiveSessionId(newSession.id);
      return updatedProgram;
    });
    toast.success("Session added");
  };

  const deleteSession = (sessionId: string) => {
    setProgram((prevProgram) => {
      if (prevProgram.sessions.length <= 1) {
        toast.error("Cannot delete the last session");
        return prevProgram;
      }
      
      const updatedProgram = deleteSessionFromProgram(prevProgram, sessionId);
      
      // Update active session if needed
      if (sessionId === activeSessionId) {
        setActiveSessionId(updatedProgram.sessions[0]?.id || null);
      }
      
      return updatedProgram;
    });
    toast.success("Session deleted");
  };

  const resetProgram = () => {
    setProgram(createEmptyProgram());
    setActiveSessionId(null);
    toast.success("Program reset");
  };

  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    setActiveSessionId(sampleProgram.sessions[0]?.id || null);
    toast.success("Sample program loaded");
  };

  return (
    <WorkoutContext.Provider
      value={{
        program,
        activeSessionId,
        setActiveSessionId,
        updateSessionName,
        updateExercise,
        updateSet,
        addExercise,
        addSet,
        deleteSet,
        deleteExercise,
        addSession,
        deleteSession,
        resetProgram,
        loadSampleProgram,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
