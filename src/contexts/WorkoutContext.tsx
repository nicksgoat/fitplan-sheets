
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
import {
  getSessionLibrary as getSessionLibraryUtil,
  getWeekLibrary as getWeekLibraryUtil,
  getProgramLibrary as getProgramLibraryUtil,
  addWorkoutToLibrary,
  addWeekToLibrary,
  addProgramToLibrary,
  removeWorkoutFromLibrary,
  removeWeekFromLibrary,
  removeProgramFromLibrary
} from '@/utils/presets';

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

const SAMPLE_PROGRAM: WorkoutProgram = {
  id: "sample-123",
  name: "Sample 5x5 Program",
  sessions: [
    {
      id: "session1",
      name: "Day 1: Squat Focus",
      day: 1,
      weekId: "week1",
      exercises: [
        {
          id: "ex1",
          name: "Barbell Squat",
          sets: [
            { id: "set1", reps: "5", weight: "135", intensity: "", rest: "180" },
            { id: "set2", reps: "5", weight: "155", intensity: "", rest: "180" },
            { id: "set3", reps: "5", weight: "185", intensity: "", rest: "180" },
            { id: "set4", reps: "5", weight: "205", intensity: "", rest: "180" },
            { id: "set5", reps: "5", weight: "225", intensity: "", rest: "180" },
          ],
          notes: "Focus on depth and form"
        },
        {
          id: "ex2",
          name: "Bench Press",
          sets: [
            { id: "set6", reps: "5", weight: "95", intensity: "", rest: "180" },
            { id: "set7", reps: "5", weight: "115", intensity: "", rest: "180" },
            { id: "set8", reps: "5", weight: "135", intensity: "", rest: "180" },
            { id: "set9", reps: "5", weight: "155", intensity: "", rest: "180" },
            { id: "set10", reps: "5", weight: "175", intensity: "", rest: "180" },
          ],
          notes: "Keep shoulders back"
        },
        {
          id: "ex3",
          name: "Barbell Row",
          sets: [
            { id: "set11", reps: "5", weight: "95", intensity: "", rest: "180" },
            { id: "set12", reps: "5", weight: "115", intensity: "", rest: "180" },
            { id: "set13", reps: "5", weight: "135", intensity: "", rest: "180" },
            { id: "set14", reps: "5", weight: "155", intensity: "", rest: "180" },
            { id: "set15", reps: "5", weight: "175", intensity: "", rest: "180" },
          ],
          notes: "Keep back flat"
        }
      ],
      circuits: []
    },
    {
      id: "session2",
      name: "Day 2: Deadlift Focus",
      day: 2,
      weekId: "week1",
      exercises: [
        {
          id: "ex4",
          name: "Deadlift",
          sets: [
            { id: "set16", reps: "5", weight: "135", intensity: "", rest: "180" },
            { id: "set17", reps: "5", weight: "185", intensity: "", rest: "180" },
            { id: "set18", reps: "5", weight: "225", intensity: "", rest: "180" },
            { id: "set19", reps: "5", weight: "275", intensity: "", rest: "180" },
            { id: "set20", reps: "5", weight: "315", intensity: "", rest: "180" },
          ],
          notes: "Keep back straight, push through heels"
        },
        {
          id: "ex5",
          name: "Overhead Press",
          sets: [
            { id: "set21", reps: "5", weight: "45", intensity: "", rest: "180" },
            { id: "set22", reps: "5", weight: "65", intensity: "", rest: "180" },
            { id: "set23", reps: "5", weight: "85", intensity: "", rest: "180" },
            { id: "set24", reps: "5", weight: "95", intensity: "", rest: "180" },
            { id: "set25", reps: "5", weight: "105", intensity: "", rest: "180" },
          ],
          notes: "Full lockout at top"
        },
        {
          id: "ex6",
          name: "Pull Ups",
          sets: [
            { id: "set26", reps: "5", weight: "BW", intensity: "", rest: "180" },
            { id: "set27", reps: "5", weight: "BW", intensity: "", rest: "180" },
            { id: "set28", reps: "5", weight: "BW", intensity: "", rest: "180" },
          ],
          notes: "Full range of motion"
        }
      ],
      circuits: []
    }
  ],
  weeks: [
    {
      id: "week1",
      name: "Week 1",
      order: 1,
      sessions: ["session1", "session2"]
    }
  ],
  maxWeights: {
    "Barbell Squat": { weight: "275", weightType: "pounds" },
    "Bench Press": { weight: "225", weightType: "pounds" },
    "Deadlift": { weight: "365", weightType: "pounds" },
    "Overhead Press": { weight: "135", weightType: "pounds" }
  }
};

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
    const newProgram = {
      id: uuidv4(),
      name: 'My Program',
      sessions: [],
      weeks: [],
      maxWeights: {}
    };
    setProgram(newProgram);
    setActiveWeekId(null);
    setActiveSessionId(null);
    console.log("Program reset successfully");
  };

  const loadSampleProgram = () => {
    console.log("Loading sample program");
    const sampleProgramCopy = JSON.parse(JSON.stringify(SAMPLE_PROGRAM));
    sampleProgramCopy.id = uuidv4();
    setProgram(sampleProgramCopy);
    
    if (sampleProgramCopy.weeks.length > 0) {
      const firstWeekId = sampleProgramCopy.weeks[0].id;
      setActiveWeekId(firstWeekId);
      
      const firstWeek = sampleProgramCopy.weeks[0];
      if (firstWeek.sessions && firstWeek.sessions.length > 0) {
        setActiveSessionId(firstWeek.sessions[0]);
      }
    }
  };

  const saveSessionToLibrary = (sessionId: string, name: string) => {
    console.log("Saving session to library", sessionId, name);
    const sessionToSave = program.sessions.find(session => session.id === sessionId);
    if (!sessionToSave) return;
    
    const sessionCopy = {
      ...sessionToSave,
      id: uuidv4(),
      name
    };
    
    addWorkoutToLibrary(sessionCopy);
  };

  const saveWeekToLibrary = (weekId: string, name: string) => {
    console.log("Saving week to library", weekId, name);
    const weekToSave = program.weeks.find(week => week.id === weekId);
    if (!weekToSave) return;
    
    const weekCopy = {
      ...weekToSave,
      id: uuidv4(),
      name,
      sessions: [...weekToSave.sessions]
    };
    
    addWeekToLibrary(weekCopy);
  };

  const saveProgramToLibrary = (name: string) => {
    console.log("Saving program to library", name);
    const programCopy = {
      ...program,
      id: uuidv4(),
      name
    };
    
    addProgramToLibrary(programCopy);
  };

  const loadSessionFromLibrary = (session: WorkoutSession, weekId: string) => {
    console.log("Loading session from library", session, weekId);
    if (!session || !weekId) return;
    
    const sessionCopy = {
      ...session,
      id: uuidv4(),
      weekId
    };
    
    const updatedProgram = produce(program, draft => {
      draft.sessions.push(sessionCopy);
      
      const weekIndex = draft.weeks.findIndex(week => week.id === weekId);
      if (weekIndex !== -1) {
        draft.weeks[weekIndex].sessions.push(sessionCopy.id);
      }
    });
    
    setProgram(updatedProgram);
    setActiveSessionId(sessionCopy.id);
  };

  const loadWeekFromLibrary = (week: WorkoutWeek) => {
    console.log("Loading week from library", week);
    if (!week) return;
    
    const weekCopy = {
      ...week,
      id: uuidv4(),
      sessions: []
    };
    
    const updatedProgram = produce(program, draft => {
      draft.weeks.push(weekCopy);
    });
    
    setProgram(updatedProgram);
    setActiveWeekId(weekCopy.id);
  };

  const loadProgramFromLibrary = (programToLoad: WorkoutProgram) => {
    console.log("Loading program from library", programToLoad);
    if (!programToLoad) return;
    
    const programCopy = JSON.parse(JSON.stringify(programToLoad));
    programCopy.id = uuidv4();
    setProgram(programCopy);
    
    if (programCopy.weeks.length > 0) {
      const firstWeekId = programCopy.weeks[0].id;
      setActiveWeekId(firstWeekId);
      
      const firstWeek = programCopy.weeks[0];
      if (firstWeek.sessions && firstWeek.sessions.length > 0) {
        setActiveSessionId(firstWeek.sessions[0]);
      }
    }
  };

  const getSessionLibrary = () => {
    return getSessionLibraryUtil();
  };

  const getWeekLibrary = () => {
    return getWeekLibraryUtil();
  };

  const getProgramLibrary = () => {
    return getProgramLibraryUtil();
  };

  const removeSessionFromLibrary = (id: string) => {
    console.log("Removing session from library", id);
    removeWorkoutFromLibrary(id);
  };

  const removeWeekFromLibrary = (id: string) => {
    console.log("Removing week from library", id);
    removeWeekFromLibrary(id);
  };

  const removeProgramFromLibrary = (id: string) => {
    console.log("Removing program from library", id);
    removeProgramFromLibrary(id);
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
