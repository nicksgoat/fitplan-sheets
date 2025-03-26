
import React, { createContext, useContext, useState, useEffect } from "react";
import { WorkoutProgram, WorkoutSession, WorkoutSettings, WorkoutWeek } from "@/types/workout";
import { createEmptyProgram, sampleProgram } from "@/utils/workout";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { useWorkoutExercises } from "@/hooks/useWorkoutExercises";
import { useWorkoutCircuits } from "@/hooks/useWorkoutCircuits";
import { useWorkoutWeeks } from "@/hooks/useWorkoutWeeks";
import { useWorkoutLibrary } from "@/hooks/useWorkoutLibrary";
import { useWorkoutProgram } from "@/hooks/useWorkoutProgram";

// Define the shape of our context
export interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  activeWeekId: string | null;
  setActiveSessionId: (id: string | null) => void;
  setActiveWeekId: (id: string | null) => void;
  
  // Session operations
  addSession: (name?: string, weekId?: string) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  
  // Week operations
  addWeek: (name?: string) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  deleteWeek: (weekId: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  
  // Exercise operations
  addExercise: (sessionId: string, exercise?: Partial<any>) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<any>) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  
  // Set operations
  addSet: (sessionId: string, exerciseId: string, set?: Partial<any>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<any>) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  
  // Circuit operations
  addCircuit: (sessionId: string, name: string) => void;
  updateCircuit: (sessionId: string, circuitId: string, updates: Partial<any>) => void;
  deleteCircuit: (sessionId: string, circuitId: string) => void;
  addExerciseToCircuit: (sessionId: string, circuitId: string, exercise?: Partial<any>) => void;
  
  // Program operations
  updateProgramDetails: (updates: { name?: string; image?: string }) => void;
  updateSettings: (settings: WorkoutSettings) => void;
  resetProgram: () => void;
  loadSampleProgram: () => void;
  
  // Circuit creation shortcuts
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
  
  // Library operations
  workoutLibrary: Array<{
    id: string;
    name: string;
    type: "program" | "session";
    data: WorkoutProgram | WorkoutSession;
  }>;
  saveToLibrary: (type: "program" | "session", id?: string) => void;
  importSession: (session: WorkoutSession) => void;
  importProgram: (program: WorkoutProgram) => void;
}

// Create the context with a default value
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Create a provider component
export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [program, setProgram] = useState<WorkoutProgram>(createEmptyProgram());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    program.sessions.length > 0 ? program.sessions[0].id : null
  );
  const [activeWeekId, setActiveWeekId] = useState<string | null>(
    program.weeks && program.weeks.length > 0 ? program.weeks[0].id : null
  );
  
  // Import hooks with all the functionality
  const weekHooks = useWorkoutWeeks({ 
    program, setProgram, activeWeekId, setActiveWeekId, setActiveSessionId 
  });
  
  const sessionHooks = useWorkoutSessions({ 
    program, setProgram, activeSessionId, setActiveSessionId, activeWeekId 
  });
  
  const exerciseHooks = useWorkoutExercises({ 
    program, setProgram, activeWeekId 
  });
  
  const circuitHooks = useWorkoutCircuits({ 
    program, setProgram, activeWeekId 
  });
  
  const libraryHooks = useWorkoutLibrary({ 
    program, setProgram, setActiveSessionId 
  });
  
  const programHooks = useWorkoutProgram({ 
    setProgram, setActiveWeekId, setActiveSessionId 
  });
  
  // Provide the context value
  const contextValue: WorkoutContextType = {
    program,
    activeSessionId,
    activeWeekId,
    setActiveSessionId,
    setActiveWeekId,
    
    // Session operations
    ...sessionHooks,
    
    // Week operations
    ...weekHooks,
    
    // Exercise operations
    ...exerciseHooks,
    
    // Circuit operations 
    ...circuitHooks,
    
    // Program operations
    ...programHooks,
    
    // Library operations
    ...libraryHooks,
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
