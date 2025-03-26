
import React, { createContext, useContext, useState, useEffect } from "react";
import { Exercise, Set, WorkoutProgram, WorkoutSession, Circuit, WorkoutType, WorkoutWeek } from "@/types/workout";
import { 
  createEmptyProgram, 
  addExerciseToSession, 
  updateExerciseInSession,
  updateSetInExercise,
  addSetToExercise,
  deleteSetFromExercise,
  deleteExerciseFromSession,
  addSessionToProgram,
  addWeekToProgram,
  updateSessionInProgram,
  updateWeekInProgram,
  deleteSessionFromProgram,
  deleteWeekFromProgram,
  sampleProgram,
  cloneSession,
  saveCurrentSessionAsPreset,
  saveCurrentWeekAsPreset,
  copyProgramAsPreset,
  generateId
} from "@/utils/workout";
import {
  saveSessionPreset,
  saveWeekPreset,
  saveProgramPreset,
  getSessionPresets,
  getWeekPresets,
  getProgramPresets,
  deleteSessionPreset,
  deleteWeekPreset,
  deleteProgramPreset
} from "@/utils/presets";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  activeWeekId: string | null;
  setActiveSessionId: (id: string | null) => void;
  setActiveWeekId: (id: string | null) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  addExercise: (sessionId: string, afterExerciseId?: string) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  addSession: (weekId: string, afterSessionId?: string) => void;
  addWeek: (afterWeekId?: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteWeek: (weekId: string) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
  updateCircuit: (sessionId: string, circuitId: string, updates: Partial<Circuit>) => void;
  deleteCircuit: (sessionId: string, circuitId: string) => void;
  addExerciseToCircuit: (sessionId: string, circuitId: string, exerciseId: string) => void;
  removeExerciseFromCircuit: (sessionId: string, circuitId: string, exerciseId: string) => void;
  saveSessionAsPreset: (sessionId: string, name: string) => void;
  saveWeekAsPreset: (weekId: string, name: string) => void;
  saveProgramAsPreset: (name: string) => void;
  loadSessionPreset: (preset: WorkoutSession, weekId: string) => void;
  loadWeekPreset: (preset: WorkoutWeek) => void;
  loadProgramPreset: (preset: WorkoutProgram) => void;
  getSessionPresets: () => WorkoutSession[];
  getWeekPresets: () => WorkoutWeek[];
  getProgramPresets: () => WorkoutProgram[];
  deleteSessionPreset: (presetId: string) => void;
  deleteWeekPreset: (presetId: string) => void;
  deleteProgramPreset: (presetId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWeekId && program.weeks.length > 0) {
      setActiveWeekId(program.weeks[0].id);
    }
    
    if (activeWeekId && (!activeSessionId || !program.sessions.some(s => s.id === activeSessionId))) {
      const currentWeek = program.weeks.find(w => w.id === activeWeekId);
      if (currentWeek && currentWeek.sessions.length > 0) {
        const firstSessionId = currentWeek.sessions[0];
        if (program.sessions.some(s => s.id === firstSessionId)) {
          setActiveSessionId(firstSessionId);
        }
      }
    }
  }, [program, activeWeekId, activeSessionId]);

  const updateSessionName = (sessionId: string, name: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) =>
        session.id === sessionId ? { ...session, name } : session
      );
      return { ...prevProgram, sessions: updatedSessions };
    });
  };

  const updateWeekName = (weekId: string, name: string) => {
    setProgram((prevProgram) => {
      const updatedWeeks = prevProgram.weeks.map((week) =>
        week.id === weekId ? { ...week, name } : week
      );
      return { ...prevProgram, weeks: updatedWeeks };
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

  const addSession = (weekId: string, afterSessionId?: string) => {
    setProgram((prevProgram) => {
      const updatedProgram = addSessionToProgram(prevProgram, weekId, afterSessionId);
      
      const newSession = updatedProgram.sessions[updatedProgram.sessions.length - 1];
      setActiveSessionId(newSession.id);
      
      return updatedProgram;
    });
    toast.success("Session added");
  };

  const addWeek = (afterWeekId?: string) => {
    setProgram((prevProgram) => {
      const updatedProgram = addWeekToProgram(prevProgram, afterWeekId);
      
      const newWeek = updatedProgram.weeks[updatedProgram.weeks.length - 1];
      const newSessionId = newWeek.sessions[0];
      
      setActiveWeekId(newWeek.id);
      setActiveSessionId(newSessionId);
      
      return updatedProgram;
    });
    toast.success("Week added");
  };

  const deleteSession = (sessionId: string) => {
    setProgram((prevProgram) => {
      const session = prevProgram.sessions.find(s => s.id === sessionId);
      if (!session || !session.weekId) return prevProgram;
      
      const week = prevProgram.weeks.find(w => w.id === session.weekId);
      if (!week || week.sessions.length <= 1) {
        toast.error("Cannot delete the last session in a week");
        return prevProgram;
      }
      
      const updatedProgram = deleteSessionFromProgram(prevProgram, sessionId);
      
      if (sessionId === activeSessionId) {
        const weekSessions = updatedProgram.weeks
          .find(w => w.id === session.weekId)
          ?.sessions || [];
        
        setActiveSessionId(weekSessions[0] || null);
      }
      
      return updatedProgram;
    });
    toast.success("Session deleted");
  };

  const deleteWeek = (weekId: string) => {
    setProgram((prevProgram) => {
      if (prevProgram.weeks.length <= 1) {
        toast.error("Cannot delete the last week");
        return prevProgram;
      }
      
      const updatedProgram = deleteWeekFromProgram(prevProgram, weekId);
      
      if (weekId === activeWeekId) {
        const firstWeek = updatedProgram.weeks[0];
        setActiveWeekId(firstWeek?.id || null);
        setActiveSessionId(firstWeek?.sessions[0] || null);
      }
      
      return updatedProgram;
    });
    toast.success("Week deleted");
  };

  const resetProgram = () => {
    const emptyProgram = createEmptyProgram();
    setProgram(emptyProgram);
    setActiveWeekId(emptyProgram.weeks[0]?.id || null);
    setActiveSessionId(emptyProgram.sessions[0]?.id || null);
    toast.success("Program reset");
  };

  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    setActiveWeekId(sampleProgram.weeks[0]?.id || null);
    setActiveSessionId(sampleProgram.sessions[0]?.id || null);
    toast.success("Sample program loaded");
  };

  const createCircuit = (sessionId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Circuit",
          exercises: [],
          rounds: "3",
          restBetweenExercises: "30",
          restBetweenRounds: "60"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Circuit",
          sets: [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "Circuit Exercise 1",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "Circuit Exercise 2",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        circuit.exercises = [exercise1Id, exercise2Id];
        
        return {
          ...session,
          circuits: [...(session.circuits || []), circuit],
          exercises: [...session.exercises, circuitHeader, exercise1, exercise2]
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("Circuit created");
  };
  
  const createSuperset = (sessionId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Superset",
          exercises: [],
          rounds: "3",
          restBetweenExercises: "0",
          restBetweenRounds: "60"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Superset",
          sets: [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "Superset Exercise A",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "Superset Exercise B",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        circuit.exercises = [exercise1Id, exercise2Id];
        
        return {
          ...session,
          circuits: [...(session.circuits || []), circuit],
          exercises: [...session.exercises, circuitHeader, exercise1, exercise2]
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("Superset created");
  };
  
  const createEMOM = (sessionId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "EMOM - 10 min",
          exercises: [],
          rounds: "10",
          restBetweenExercises: "0",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "EMOM - 10 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exerciseId = uuidv4();
        
        const exercise: Exercise = {
          id: exerciseId,
          name: "EMOM Exercise",
          sets: [{ id: uuidv4(), reps: "8-10", weight: "", rpe: "", rest: "" }],
          notes: "Complete within 40-45 seconds to allow for rest",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        circuit.exercises = [exerciseId];
        
        return {
          ...session,
          circuits: [...(session.circuits || []), circuit],
          exercises: [...session.exercises, circuitHeader, exercise]
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("EMOM created");
  };
  
  const createAMRAP = (sessionId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "AMRAP - 10 min",
          exercises: [],
          rounds: "AMRAP",
          restBetweenExercises: "0",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "AMRAP - 10 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exercise1Id = uuidv4();
        const exercise2Id = uuidv4();
        const exercise3Id = uuidv4();
        
        const exercise1: Exercise = {
          id: exercise1Id,
          name: "AMRAP Exercise 1",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        const exercise2: Exercise = {
          id: exercise2Id,
          name: "AMRAP Exercise 2",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 1
        };
        
        const exercise3: Exercise = {
          id: exercise3Id,
          name: "AMRAP Exercise 3",
          sets: [{ id: uuidv4(), reps: "10", weight: "", rpe: "", rest: "" }],
          notes: "",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 2
        };
        
        circuit.exercises = [exercise1Id, exercise2Id, exercise3Id];
        
        return {
          ...session,
          circuits: [...(session.circuits || []), circuit],
          exercises: [...session.exercises, circuitHeader, exercise1, exercise2, exercise3]
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("AMRAP created");
  };
  
  const createTabata = (sessionId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuitId = uuidv4();
        const circuit: Circuit = {
          id: circuitId,
          name: "Tabata - 4 min",
          exercises: [],
          rounds: "8",
          restBetweenExercises: "10",
          restBetweenRounds: "0"
        };
        
        const circuitHeaderId = uuidv4();
        const circuitHeader: Exercise = {
          id: circuitHeaderId,
          name: "Tabata - 4 min",
          sets: [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
          notes: "",
          isCircuit: true,
          circuitId: circuitId
        };
        
        const exerciseId = uuidv4();
        
        const exercise: Exercise = {
          id: exerciseId,
          name: "Tabata Exercise",
          sets: [{ id: uuidv4(), reps: "20s", weight: "", rpe: "", rest: "10s" }],
          notes: "20s work, 10s rest x 8 rounds",
          isInCircuit: true,
          circuitId: circuitId,
          circuitOrder: 0
        };
        
        circuit.exercises = [exerciseId];
        
        return {
          ...session,
          circuits: [...(session.circuits || []), circuit],
          exercises: [...session.exercises, circuitHeader, exercise]
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("Tabata created");
  };
  
  const updateCircuit = (sessionId: string, circuitId: string, updates: Partial<Circuit>) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const updatedCircuits = (session.circuits || []).map((circuit) => {
          if (circuit.id !== circuitId) return circuit;
          return { ...circuit, ...updates };
        });
        
        return { ...session, circuits: updatedCircuits };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
  };
  
  const deleteCircuit = (sessionId: string, circuitId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const updatedCircuits = (session.circuits || []).filter(
          (circuit) => circuit.id !== circuitId
        );
        
        const updatedExercises = session.exercises.map((exercise) => {
          if (exercise.circuitId === circuitId) {
            const { isInCircuit, circuitId, circuitOrder, ...rest } = exercise;
            return rest;
          }
          return exercise;
        });
        
        return { 
          ...session, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
    
    toast.success("Circuit deleted");
  };
  
  const addExerciseToCircuit = (sessionId: string, circuitId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const circuit = (session.circuits || []).find((c) => c.id === circuitId);
        if (!circuit) return session;
        
        const updatedCircuits = (session.circuits || []).map((c) => {
          if (c.id !== circuitId) return c;
          return { 
            ...c, 
            exercises: [...c.exercises, exerciseId] 
          };
        });
        
        const updatedExercises = session.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return { 
            ...exercise, 
            isInCircuit: true,
            circuitId: circuitId,
            circuitOrder: circuit.exercises.length
          };
        });
        
        return { 
          ...session, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
  };
  
  const removeExerciseFromCircuit = (sessionId: string, circuitId: string, exerciseId: string) => {
    setProgram((prevProgram) => {
      const updatedSessions = prevProgram.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        
        const updatedCircuits = (session.circuits || []).map((circuit) => {
          if (circuit.id !== circuitId) return circuit;
          return { 
            ...circuit, 
            exercises: circuit.exercises.filter(id => id !== exerciseId) 
          };
        });
        
        const updatedExercises = session.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          
          const { isInCircuit, circuitId, circuitOrder, ...restExercise } = exercise;
          return restExercise;
        });
        
        return { 
          ...session, 
          circuits: updatedCircuits,
          exercises: updatedExercises
        };
      });
      
      return { ...prevProgram, sessions: updatedSessions };
    });
  };

  const saveSessionAsPreset = (sessionId: string, name: string) => {
    const sessionPreset = saveCurrentSessionAsPreset(program, sessionId, name);
    saveSessionPreset(sessionPreset);
    toast.success("Session saved as preset");
  };

  const saveWeekAsPreset = (weekId: string, name: string) => {
    const weekPreset = saveCurrentWeekAsPreset(program, weekId, name);
    saveWeekPreset(weekPreset);
    toast.success("Week saved as preset");
  };

  const saveProgramAsPreset = (name: string) => {
    const programPreset = copyProgramAsPreset(program, name);
    saveProgramPreset(programPreset);
    toast.success("Program saved as preset");
  };

  const loadSessionPreset = (preset: WorkoutSession, weekId: string) => {
    setProgram((prevProgram) => {
      const newSession = cloneSession(preset, weekId);
      
      const updatedWeeks = prevProgram.weeks.map(week => {
        if (week.id === weekId) {
          return {
            ...week,
            sessions: [...week.sessions, newSession.id]
          };
        }
        return week;
      });
      
      const updatedProgram = {
        ...prevProgram,
        sessions: [...prevProgram.sessions, newSession],
        weeks: updatedWeeks
      };
      
      setActiveSessionId(newSession.id);
      
      return updatedProgram;
    });
    
    toast.success(`Loaded session preset: ${preset.name}`);
  };

  const loadWeekPreset = (preset: WorkoutWeek) => {
    setProgram((prevProgram) => {
      const newWeekId = generateId();
      const newWeek = {
        ...preset,
        id: newWeekId,
        order: prevProgram.weeks.length + 1,
        sessions: []
      };
      
      const sessionsToAdd: WorkoutSession[] = [];
      const sessionIds: string[] = [];
      
      preset.sessions.forEach(originalSessionId => {
        const originalSession = getSessionPresets().find(s => s.id === originalSessionId);
        if (originalSession) {
          const newSession = cloneSession(originalSession, newWeekId);
          sessionsToAdd.push(newSession);
          sessionIds.push(newSession.id);
        }
      });
      
      newWeek.sessions = sessionIds;
      
      const updatedProgram = {
        ...prevProgram,
        weeks: [...prevProgram.weeks, newWeek],
        sessions: [...prevProgram.sessions, ...sessionsToAdd]
      };
      
      setActiveWeekId(newWeekId);
      if (sessionIds.length > 0) {
        setActiveSessionId(sessionIds[0]);
      }
      
      return updatedProgram;
    });
    
    toast.success(`Loaded week preset: ${preset.name}`);
  };

  const loadProgramPreset = (preset: WorkoutProgram) => {
    setProgram(preset);
    setActiveWeekId(preset.weeks[0]?.id || null);
    setActiveSessionId(preset.sessions[0]?.id || null);
    toast.success(`Loaded program preset: ${preset.name}`);
  };

  return (
    <WorkoutContext.Provider
      value={{
        program,
        activeSessionId,
        activeWeekId,
        setActiveSessionId,
        setActiveWeekId,
        updateSessionName,
        updateWeekName,
        updateExercise,
        updateSet,
        addExercise,
        addSet,
        deleteSet,
        deleteExercise,
        addSession,
        addWeek,
        deleteSession,
        deleteWeek,
        resetProgram,
        loadSampleProgram,
        createCircuit,
        createSuperset,
        createEMOM,
        createAMRAP,
        createTabata,
        updateCircuit,
        deleteCircuit,
        addExerciseToCircuit,
        removeExerciseFromCircuit,
        saveSessionAsPreset,
        saveWeekAsPreset,
        saveProgramAsPreset,
        loadSessionPreset,
        loadWeekPreset,
        loadProgramPreset,
        getSessionPresets,
        getWeekPresets,
        getProgramPresets,
        deleteSessionPreset,
        deleteWeekPreset,
        deleteProgramPreset,
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
