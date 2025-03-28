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
  setMaxWeight, 
  weightToPercentage, 
  percentageToWeight 
} from "@/utils/maxWeightUtils";

interface WorkoutContextProps {
  program: WorkoutProgram | null;
  currentWeek: WorkoutWeek | null;
  currentSession: WorkoutSession | null;
  setCurrentWeek: (week: WorkoutWeek | null) => void;
  setCurrentSession: (session: WorkoutSession | null) => void;
  createProgram: (name: string) => void;
  createWeek: (name: string, order: number) => void;
  createSession: (name: string, day: number, weekId?: string) => void;
  createCircuit: (name: string) => void;
  createExercise: (sessionId: string, callback?: (exerciseId: string) => void) => void;
  createSet: (sessionId: string, exerciseId: string) => void;
  updateProgram: (programId: string, updates: Partial<WorkoutProgram>) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  addExercise: (sessionId: string, circuitId?: string, callback?: (exerciseId: string) => void) => void;
  addExerciseToCircuit: (sessionId: string, circuitId: string, exerciseId: string) => void;
  addSet: (sessionId: string, exerciseId: string) => void;
  deleteProgram: (programId: string) => void;
  deleteWeek: (weekId: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  getMaxWeightForExercise: (exerciseName: string) => { weight: string; weightType: WeightType } | null;
  setMaxWeight: (exerciseName: string, weight: string, weightType: WeightType) => void;
  convertWeightToPercentage: (weight: string, exerciseName: string) => string;
  convertPercentageToWeight: (percentage: string, exerciseName: string, targetWeightType: WeightType) => string;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WorkoutWeek | null>(null);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  
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
  
  // Helper function to update the program state
  const updateProgramState = (updatedProgram: WorkoutProgram) => {
    setProgram(updatedProgram);
  };
  
  // Program CRUD operations
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
    setProgram(null);
  };
  
  // Week CRUD operations
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
  
  const deleteWeek = (weekId: string) => {
    if (!program) return;
    
    const updatedProgram = produce(program, draft => {
      draft.weeks = draft.weeks.filter(week => week.id !== weekId);
    });
    updateProgramState(updatedProgram);
  };
  
  // Session CRUD operations
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
  
  // Circuit CRUD operations
  const createCircuit = (name: string) => {
    if (!program || !currentSession) return;
    
    const newCircuit = {
      id: uuidv4(),
      name: name,
      exercises: [],
    };
    
    const updatedProgram = produce(program, draft => {
      const sessionIndex = draft.sessions.findIndex(session => session.id === currentSession.id);
      if (sessionIndex !== -1) {
        if (!draft.sessions[sessionIndex].circuits) {
          draft.sessions[sessionIndex].circuits = [];
        }
        draft.sessions[sessionIndex].circuits.push(newCircuit);
      }
    });
    updateProgramState(updatedProgram);
  };
  
  // Exercise CRUD operations
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
          // Add exercise to circuit
          const circuit = draft.sessions[sessionIndex].circuits.find(c => c.id === circuitId);
          if (circuit) {
            circuit.exercises.push(newExercise.id);
            newExercise.isInCircuit = true;
            newExercise.circuitId = circuitId;
            newExercise.circuitOrder = circuit.exercises.length;
            draft.sessions[sessionIndex].exercises.push(newExercise);
          }
        } else {
          // Add exercise to session
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
  
  // Set CRUD operations
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
    // Ensure program exists and is updated
    if (!program) return;

    const updatedProgram = produce(program, draft => {
      if (!draft.maxWeights) {
        draft.maxWeights = {};
      }
      draft.maxWeights = setMaxWeight(
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
    const maxWeightData = getMaxWeightForExercise(exerciseName);
    
    if (!maxWeightData) return '';
    
    return weightToPercentage(
      weight, 
      maxWeightData.weight, 
      weight.includes('kg') ? 'kilos' : 
      weight.includes('m') && !weight.includes('mi') ? 'distance-m' :
      weight.includes('ft') ? 'distance-ft' :
      weight.includes('yd') ? 'distance-yd' :
      weight.includes('mi') ? 'distance-mi' :
      'pounds',
      maxWeightData.weightType
    );
  };

  const convertPercentageToWeight = (
    percentage: string, 
    exerciseName: string, 
    targetWeightType: WeightType
  ): string => {
    const maxWeightData = getMaxWeightForExercise(exerciseName);
    
    if (!maxWeightData) return '';
    
    return percentageToWeight(
      percentage, 
      maxWeightData.weight, 
      targetWeightType, 
      maxWeightData.weightType
    );
  };
  
  const contextValue = {
    program,
    currentWeek,
    currentSession,
    setCurrentWeek,
    setCurrentSession,
    createProgram,
    createWeek,
    createSession,
    createCircuit,
    createExercise,
    createSet,
    updateProgram,
    updateWeek,
    updateSession,
    updateExercise,
    updateSet,
    addExercise,
    addExerciseToCircuit,
    addSet,
    deleteProgram,
    deleteWeek,
    deleteSession,
    deleteExercise,
    deleteSet,
    getMaxWeightForExercise,
    setMaxWeight: setMaxWeightForExercise,
    convertWeightToPercentage,
    convertPercentageToWeight,
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
