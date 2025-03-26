
import { useState } from "react";
import { WorkoutProgram, WorkoutSettings } from "@/types/workout";
import { createEmptyProgram, sampleProgram } from "@/utils/workout";

interface UseWorkoutProgramProps {
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
  setActiveWeekId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
}

export const useWorkoutProgram = ({
  setProgram,
  setActiveWeekId,
  setActiveSessionId
}: UseWorkoutProgramProps) => {
  // Program operations
  const updateProgramDetails = (updates: { name?: string; image?: string }) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      ...updates
    }));
  };
  
  const updateSettings = (settings: WorkoutSettings) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      settings
    }));
  };
  
  // Reset to empty program
  const resetProgram = () => {
    const newProgram = createEmptyProgram();
    setProgram(newProgram);
    
    if (newProgram.weeks && newProgram.weeks.length > 0) {
      setActiveWeekId(newProgram.weeks[0].id);
      
      // Set active session from the first week
      if (newProgram.weeks[0].sessions.length > 0) {
        setActiveSessionId(newProgram.weeks[0].sessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    } else if (newProgram.sessions.length > 0) {
      // Fallback to old structure if needed
      setActiveSessionId(newProgram.sessions[0].id);
    }
  };
  
  // Load sample program
  const loadSampleProgram = () => {
    setProgram(sampleProgram);
    
    if (sampleProgram.weeks && sampleProgram.weeks.length > 0) {
      setActiveWeekId(sampleProgram.weeks[0].id);
      
      // Set active session from the first week
      if (sampleProgram.weeks[0].sessions.length > 0) {
        setActiveSessionId(sampleProgram.weeks[0].sessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    } else if (sampleProgram.sessions.length > 0) {
      // Fallback to old structure
      setActiveSessionId(sampleProgram.sessions[0].id);
    }
  };

  return {
    updateProgramDetails,
    updateSettings,
    resetProgram,
    loadSampleProgram
  };
};
