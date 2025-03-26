
import { useState } from "react";
import { WorkoutProgram, WorkoutWeek, WorkoutSession } from "@/types/workout";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

interface UseWorkoutWeeksProps {
  program: WorkoutProgram;
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
  activeWeekId: string | null;
  setActiveWeekId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
}

export const useWorkoutWeeks = ({
  program,
  setProgram,
  activeWeekId,
  setActiveWeekId,
  setActiveSessionId
}: UseWorkoutWeeksProps) => {
  // Week operations
  const addWeek = (name?: string) => {
    const newWeek: WorkoutWeek = {
      id: uuidv4(),
      weekNumber: program.weeks?.length + 1 || 1,
      name: name || `Week ${program.weeks?.length + 1 || 1}`,
      sessions: []
    };
    
    // Create a default session in the new week
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: `Day 1`,
      day: 1,
      exercises: [],
      circuits: [],
      weekId: newWeek.id
    };
    
    newWeek.sessions.push(newSession);
    
    setProgram(prevProgram => ({
      ...prevProgram,
      weeks: [...(prevProgram.weeks || []), newWeek]
    }));
    
    // Set this week as active if we don't have an active week
    if (!activeWeekId) {
      setActiveWeekId(newWeek.id);
    }
    
    // Set the new session as active
    setActiveSessionId(newSession.id);
  };
  
  const updateWeek = (weekId: string, updates: Partial<WorkoutWeek>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      weeks: (prevProgram.weeks || []).map(week => 
        week.id === weekId ? { ...week, ...updates } : week
      )
    }));
  };
  
  const updateWeekName = (weekId: string, name: string) => {
    updateWeek(weekId, { name });
  };
  
  const deleteWeek = (weekId: string) => {
    // Check if there's at least one week
    if (!program.weeks || program.weeks.length <= 1) {
      toast({
        title: "Cannot Delete Week",
        description: "A program must have at least one week.",
        variant: "destructive"
      });
      return;
    }
    
    setProgram(prevProgram => {
      // Filter out the week to delete
      const updatedWeeks = (prevProgram.weeks || [])
        .filter(week => week.id !== weekId)
        .map((week, index) => ({
          ...week,
          weekNumber: index + 1 // Update week numbers
        }));
      
      // Update the program
      return {
        ...prevProgram,
        weeks: updatedWeeks
      };
    });
    
    // If the deleted week was active, set another week as active
    if (activeWeekId === weekId) {
      // Find a new week to set as active
      const newActiveWeekId = program.weeks.find(week => week.id !== weekId)?.id;
      setActiveWeekId(newActiveWeekId || null);
      
      // Set a session from the new active week as active
      if (newActiveWeekId) {
        const week = program.weeks.find(week => week.id === newActiveWeekId);
        if (week && week.sessions.length > 0) {
          setActiveSessionId(week.sessions[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
    }
  };

  return {
    addWeek,
    updateWeek,
    updateWeekName,
    deleteWeek
  };
};
