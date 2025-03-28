import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import {
  WorkoutProgram,
  WorkoutSession,
  Exercise,
  Set,
  WorkoutWeek,
  WeightType,
  UserMaxWeights,
} from '@/types/workout';
import { getLocalStorage, setLocalStorage } from '@/utils/localStorage';
import { 
  setMaxWeight as setMaxWeightUtil, 
  weightToPercentage, 
  percentageToWeight 
} from "@/utils/maxWeightUtils";

interface WorkoutContextProps {
  program: WorkoutProgram;
  currentWeek: WorkoutWeek | null;
  currentSession: WorkoutSession | null;
  activeWeekId: string | null;
  activeSessionId: string | null;
  setCurrentWeek: (week: WorkoutWeek | null) => void;
  setCurrentSession: (session: WorkoutSession | null) => void;
  setActiveWeekId: (weekId: string) => void;
  setActiveSessionId: (sessionId: string) => void;
  createProgram: (name: string) => void;
  createWeek: (name: string, order: number) => void;
  createSession: (name: string, day: number, weekId?: string) => void;
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
  createExercise: (sessionId: string, callback?: (exerciseId: string) => void) => void;
  createSet: (sessionId: string, exerciseId: string) => void;
  updateProgram: (programId: string, updates: Partial<WorkoutProgram>) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  addExercise: (sessionId: string, circuitId?: string, callback?: (exerciseId: string) => void) => void;
  addExerciseToCircuit: (sessionId: string, circuitId: string, exerciseId: string) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  addWeek: () => void;
  addSession: (weekId: string) => void;
  deleteProgram: (programId: string) => void;
  deleteWeek: (weekId: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  getMaxWeightForExercise: (exerciseName: string) => { weight: string; weightType: WeightType } | null;
  setMaxWeight: (exerciseName: string, weight: string, weightType: WeightType) => void;
  convertWeightToPercentage: (weight: string, exerciseName: string) => string;
  convertPercentageToWeight: (percentage: string, exerciseName: string, targetWeightType: WeightType) => string;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  saveSessionToLibrary: (sessionId: string, name: string) => void;
  saveWeekToLibrary: (weekId: string, name: string) => void;
  saveProgramToLibrary: (name: string) => void;
  loadSessionFromLibrary: (session: any, weekId: string) => void;
  loadWeekFromLibrary: (week: any) => void;
  loadProgramFromLibrary: (program: any) => void;
  getSessionLibrary: () => any[];
  getWeekLibrary: () => any[];
  getProgramLibrary: () => any[];
  removeSessionFromLibrary: (id: string) => void;
  removeWeekFromLibrary: (id: string) => void;
  removeProgramFromLibrary: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram>({
    id: uuidv4(),
    name: 'My Program',
    sessions: [],
    weeks: [],
    maxWeights: {}
  });
  const [currentWeek, setCurrentWeek] = useState<WorkoutWeek | null>(null);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedProgram = getLocalStorage<WorkoutProgram>('workoutProgram');
    if (storedProgram) {
      setProgram(storedProgram);
    }
  }, []);
  
  useEffect(() => {
    if (program) {
      setLocalStorage('workoutProgram', program);
    } else {
      localStorage.removeItem('workoutProgram');
    }
  }, [program]);
  
  const updateProgramState = (updatedProgram: WorkoutProgram) => {
    setProgram(updatedProgram);
  };
  
  const createProgram = (name: string) => {
    const newProgram: WorkoutProgram = {
      id: uuidv4(),
      name,
      sessions: [],
      weeks: [],
      maxWeights: {}
    };
    setProgram(newProgram);
  };
  
  const updateProgram = (programId: string, updates: Partial<WorkoutProgram>) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      Object.assign(draft, updates);
    });
    updateProgramState(updatedProgram);
  };
  
  const deleteProgram = (programId: string) => {
    setProgram({
      id: uuidv4(),
      name: 'My Program',
      sessions: [],
      weeks: [],
      maxWeights: {}
    });
  };
  
  const createWeek = (name: string, order: number) => {
    if (!program) return;
    
    const newWeek: WorkoutWeek = {
      id: uuidv4(),
      name,
      order,
      sessions: [],
    };
    
    const updatedProgram = produce(program, draft => {
      draft.weeks.push(newWeek);
    });
    updateProgramState(updatedProgram);
  };
  
  const updateWeek = (weekId: string, updates: Partial<WorkoutWeek>) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const weekIndex = draft.weeks.findIndex(week => week.id === weekId);
      if (weekIndex !== -1) {
        Object.assign(draft.weeks[weekIndex], updates);
      }
    });
    updateProgramState(updatedProgram);
  };

  const updateWeekName = (weekId: string, name: string) => {
    updateWeek(weekId, { name });
  };
  
  const deleteWeek = (weekId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      draft.weeks = draft.weeks.filter(week => week.id !== weekId);
    });
    updateProgramState(updatedProgram);
  };

  const addWeek = () => {
    const newWeekOrder = program.weeks.length > 0 
      ? Math.max(...program.weeks.map(w => w.order)) + 1 
      : 1;
    
    createWeek(`Week ${newWeekOrder}`, newWeekOrder);
  };
  
  const createSession = (name: string, day: number, weekId?: string) => {
    if (!program) return;
    
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name,
      day,
      exercises: [],
      circuits: [],
      weekId: weekId,
    };
    
    const updatedProgram = produce(program, draft => {
      draft.sessions.push(newSession);
      
      if (weekId) {
        const weekIndex = draft.weeks.findIndex(week => week.id === weekId);
        if (weekIndex !== -1) {
          if (!draft.weeks[weekIndex].sessions) {
            draft.weeks[weekIndex].sessions = [];
          }
          draft.weeks[weekIndex].sessions.push(newSession.id);
        }
      }
    });
    updateProgramState(updatedProgram);
    return newSession.id;
  };
  
  const updateSession = (sessionId: string, updates: Partial<WorkoutSession>) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        Object.assign(draft.sessions[sessionIndex], updates);
      }
    });
    updateProgramState(updatedProgram);
  };

  const updateSessionName = (sessionId: string, name: string) => {
    updateSession(sessionId, { name });
  };
  
  const deleteSession = (sessionId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      draft.sessions = draft.sessions.filter(session => session.id !== sessionId);
      
      draft.weeks.forEach(week => {
        if (week.sessions) {
          week.sessions = week.sessions.filter(session => session !== sessionId);
        }
      });
    });
    updateProgramState(updatedProgram);
  };

  const addSession = (weekId: string) => {
    const week = program.weeks.find(w => w.id === weekId);
    if (!week) return;
    
    const sessionCount = week.sessions.length;
    const sessionId = createSession(`Session ${sessionCount + 1}`, sessionCount + 1, weekId);
    setActiveSessionId(sessionId);
    return sessionId;
  };
  
  const createCircuit = (sessionId: string) => {
    if (!program) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: "Circuit",
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };

  const createSuperset = (sessionId: string) => {
    if (!program) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: "Superset",
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };

  const createEMOM = (sessionId: string) => {
    if (!program) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: "EMOM",
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };

  const createAMRAP = (sessionId: string) => {
    if (!program) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: "AMRAP",
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };

  const createTabata = (sessionId: string) => {
    if (!program) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: "Tabata",
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const createExercise = (sessionId: string, callback?: (exerciseId: string) => void) => {
    if (!program) return;
    
    const newExercise: Exercise = {
      id: uuidv4(),
      name: 'New Exercise',
      sets: [],
      notes: '',
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        draft.sessions[sessionIndex].exercises.push(newExercise);
      }
    });
    updateProgramState(updatedProgram);
    
    if (callback) {
      callback(newExercise.id);
    }
  };
  
  const updateExercise = (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const exerciseIndex = draft.sessions[sessionIndex].exercises.findIndex(exercise => exercise.id === exerciseId);
        if (exerciseIndex !== -1) {
          Object.assign(draft.sessions[sessionIndex].exercises[exerciseIndex], updates);
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const addExercise = (sessionId: string, circuitId?: string, callback?: (exerciseId: string) => void) => {
    if (!program) return;
    
    const newExercise: Exercise = {
      id: uuidv4(),
      name: 'New Exercise',
      sets: [],
      notes: '',
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        if (circuitId) {
          const circuit = draft.sessions[sessionIndex].circuits.find(c => c.id === circuitId);
          if (circuit) {
            circuit.exercises.push(newExercise.id);
            newExercise.isInCircuit = true;
            newExercise.circuitId = circuitId;
            newExercise.circuitOrder = circuit.exercises.length;
            draft.sessions[sessionIndex].exercises.push(newExercise);
          }
        } else {
          draft.sessions[sessionIndex].exercises.push(newExercise);
        }
      }
    });
    
    updateProgramState(updatedProgram);
    
    if (callback) {
      callback(newExercise.id);
    }
  };
  
  const addExerciseToCircuit = (sessionId: string, circuitId: string, exerciseId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const circuit = draft.sessions[sessionIndex].circuits.find(c => c.id === circuitId);
        if (circuit) {
          circuit.exercises.push(exerciseId);
          
          const exercise = draft.sessions[sessionIndex].exercises.find(e => e.id === exerciseId);
          if (exercise) {
            exercise.isInCircuit = true;
            exercise.circuitId = circuitId;
            exercise.circuitOrder = circuit.exercises.length;
          }
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const deleteExercise = (sessionId: string, exerciseId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        draft.sessions[sessionIndex].exercises = draft.sessions[sessionIndex].exercises.filter(exercise => exercise.id !== exerciseId);
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const createSet = (sessionId: string, exerciseId: string) => {
    if (!program) return;
    
    const newSet: Set = {
      id: uuidv4(),
      reps: '',
      weight: '',
      intensity: '',
      rest: '',
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const exerciseIndex = draft.sessions[sessionIndex].exercises.findIndex(exercise => exercise.id === exerciseId);
        if (exerciseIndex !== -1) {
          draft.sessions[sessionIndex].exercises[exerciseIndex].sets.push(newSet);
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const updateSet = (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const exerciseIndex = draft.sessions[sessionIndex].exercises.findIndex(exercise => exercise.id === exerciseId);
        if (exerciseIndex !== -1) {
          const setIndex = draft.sessions[sessionIndex].exercises[exerciseIndex].sets.findIndex(set => set.id === setId);
          if (setIndex !== -1) {
            Object.assign(draft.sessions[sessionIndex].exercises[exerciseIndex].sets[setIndex], updates);
          }
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const addSet = (sessionId: string, exerciseId: string) => {
    if (!program) return;
    
    const newSet: Set = {
      id: uuidv4(),
      reps: '',
      weight: '',
      intensity: '',
      rest: '',
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const exerciseIndex = draft.sessions[sessionIndex].exercises.findIndex(exercise => exercise.id === exerciseId);
        if (exerciseIndex !== -1) {
          draft.sessions[sessionIndex].exercises[exerciseIndex].sets.push(newSet);
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const deleteSet = (sessionId: string, exerciseId: string, setId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === sessionId);
      if (sessionIndex !== -1) {
        const exerciseIndex = draft.sessions[sessionIndex].exercises.findIndex(exercise => exercise.id === exerciseId);
        if (exerciseIndex !== -1) {
          draft.sessions[sessionIndex].exercises[exerciseIndex].sets = draft.sessions[sessionIndex].exercises[exerciseIndex].sets.filter(set => set.id !== setId);
        }
      }
    });
    updateProgramState(updatedProgram);
  };
  
  const getMaxWeightForExercise = (exerciseName: string) => {
    if (!program || !program.maxWeights || !program.maxWeights[exerciseName]) {
      return null;
    }
    return program.maxWeights[exerciseName];
  };

  const setMaxWeightForExercise = (
    exerciseName: string, 
    weight: string, 
    weightType: WeightType
  ) => {
    if (!program) return;

    const updatedProgram = produce(program, draft => {
      if (!draft.maxWeights) {
        draft.maxWeights = {};
      }
      draft.maxWeights = setMaxWeightUtil(
        draft.maxWeights, 
        exerciseName, 
        weight, 
        weightType
      );
    });
    
    setProgram(updatedProgram);
  };

  const convertWeightToPercentage = (
    weight: string, 
    exerciseName: string
  ): string => {
    if (!program || !program.maxWeights) return '';
    
    return weightToPercentage(
      weight,
      exerciseName,
      program.maxWeights
    );
  };

  const convertPercentageToWeight = (
    percentage: string, 
    exerciseName: string, 
    targetWeightType: WeightType
  ): string => {
    if (!program || !program.maxWeights) return '';
    
    return percentageToWeight(
      percentage,
      exerciseName,
      targetWeightType,
      program.maxWeights
    );
  };

  const resetProgram = () => {
    setProgram({
      id: uuidv4(),
      name: 'My Program',
      sessions: [],
      weeks: [],
      maxWeights: {}
    });
  };

  const loadSampleProgram = () => {
    console.log("Loading sample program");
  };

  const saveSessionToLibrary = (sessionId: string, name: string) => {
    console.log("Saving session to library", sessionId, name);
  };

  const saveWeekToLibrary = (weekId: string, name: string) => {
    console.log("Saving week to library", weekId, name);
  };

  const saveProgramToLibrary = (name: string) => {
    console.log("Saving program to library", name);
  };

  const loadSessionFromLibrary = (session: any, weekId: string) => {
    console.log("Loading session from library", session, weekId);
  };

  const loadWeekFromLibrary = (week: any) => {
    console.log("Loading week from library", week);
  };

  const loadProgramFromLibrary = (program: any) => {
    console.log("Loading program from library", program);
  };

  const getSessionLibrary = () => {
    return [];
  };

  const getWeekLibrary = () => {
    return [];
  };

  const getProgramLibrary = () => {
    return [];
  };

  const removeSessionFromLibrary = (id: string) => {
    console.log("Removing session from library", id);
  };

  const removeWeekFromLibrary = (id: string) => {
    console.log("Removing week from library", id);
  };

  const removeProgramFromLibrary = (id: string) => {
    console.log("Removing program from library", id);
  };
  
  const contextValue = {
    program,
    currentWeek,
    currentSession,
    activeWeekId,
    activeSessionId,
    setCurrentWeek,
    setCurrentSession,
    setActiveWeekId,
    setActiveSessionId,
    createProgram,
    createWeek,
    createSession,
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata,
    createExercise,
    createSet,
    updateProgram,
    updateWeek,
    updateWeekName,
    updateSession,
    updateSessionName,
    updateExercise,
    updateSet,
    addExercise,
    addExerciseToCircuit,
    addSet,
    addWeek,
    addSession,
    deleteProgram,
    deleteWeek,
    deleteSession,
    deleteExercise,
    deleteSet,
    getMaxWeightForExercise,
    setMaxWeight: setMaxWeightForExercise,
    convertWeightToPercentage,
    convertPercentageToWeight,
    resetProgram,
    loadSampleProgram,
    saveSessionToLibrary,
    saveWeekToLibrary,
    saveProgramToLibrary,
    loadSessionFromLibrary,
    loadWeekFromLibrary,
    loadProgramFromLibrary,
    getSessionLibrary,
    getWeekLibrary,
    getProgramLibrary,
    removeSessionFromLibrary,
    removeWeekFromLibrary,
    removeProgramFromLibrary,
  };
  
  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
