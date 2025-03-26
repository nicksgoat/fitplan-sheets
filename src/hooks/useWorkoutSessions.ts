import { useState } from "react";
import { WorkoutProgram, WorkoutSession } from "@/types/workout";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

interface UseWorkoutSessionsProps {
  program: WorkoutProgram;
  setProgram: React.Dispatch<React.SetStateAction<WorkoutProgram>>;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  activeWeekId: string | null;
}

export const useWorkoutSessions = ({
  program,
  setProgram,
  activeSessionId,
  setActiveSessionId,
  activeWeekId
}: UseWorkoutSessionsProps) => {
  // Session operations
  const addSession = (name?: string, weekId?: string) => {
    // If weekId is provided, add the session to that week
    // Otherwise, if we have an active week, add it there
    // If we don't have weeks structure yet, add it to the flat sessions array
    const targetWeekId = weekId || activeWeekId;
    
    const newSession: WorkoutSession = {
      id: uuidv4(),
      name: name || `Day ${program.sessions.length + 1}`,
      day: program.sessions.length + 1,
      exercises: [],
      circuits: []
    };
    
    if (targetWeekId && program.weeks) {
      // Add to a specific week
      newSession.weekId = targetWeekId;
      
      setProgram(prevProgram => {
        const updatedWeeks = (prevProgram.weeks || []).map(week => {
          if (week.id === targetWeekId) {
            // Add the session to this week
            const updatedSessions = [...week.sessions, {
              ...newSession,
              day: week.sessions.length + 1,
              name: name || `Day ${week.sessions.length + 1}`
            }];
            
            return {
              ...week,
              sessions: updatedSessions
            };
          }
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Add to the flat sessions array (backward compatibility)
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: [...prevProgram.sessions, newSession]
      }));
    }
    
    // Set the new session as active
    setActiveSessionId(newSession.id);
  };
  
  const updateSession = (sessionId: string, updates: Partial<WorkoutSession>) => {
    // Check if we have a weeks structure
    if (program.weeks && program.weeks.length > 0) {
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          // Check if this session is in this week
          const sessionIndex = week.sessions.findIndex(session => session.id === sessionId);
          
          if (sessionIndex >= 0) {
            // Update the session in this week
            const updatedSessions = week.sessions.map(session => 
              session.id === sessionId ? { ...session, ...updates } : session
            );
            
            return {
              ...week,
              sessions: updatedSessions
            };
          }
          
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
    } else {
      // Update in the flat sessions array
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        )
      }));
    }
  };
  
  const updateSessionName = (sessionId: string, name: string) => {
    updateSession(sessionId, { name });
  };
  
  const deleteSession = (sessionId: string) => {
    // Check if we have a weeks structure
    if (program.weeks && program.weeks.length > 0) {
      let weekHasOnlyOneSession = false;
      let weekWithSession: any = null;
      
      // Find the week that contains this session
      program.weeks.forEach(week => {
        if (week.sessions.some(session => session.id === sessionId)) {
          weekWithSession = week;
          weekHasOnlyOneSession = week.sessions.length <= 1;
        }
      });
      
      // Don't allow deleting the last session in a week
      if (weekHasOnlyOneSession && weekWithSession) {
        toast({
          title: "Cannot Delete Session",
          description: "A week must have at least one session.",
          variant: "destructive"
        });
        return;
      }
      
      setProgram(prevProgram => {
        const updatedWeeks = prevProgram.weeks.map(week => {
          // Check if this session is in this week
          if (week.sessions.some(session => session.id === sessionId)) {
            // Remove the session from this week
            const updatedSessions = week.sessions
              .filter(session => session.id !== sessionId)
              .map((session, index) => ({
                ...session,
                day: index + 1 // Update day numbers
              }));
            
            return {
              ...week,
              sessions: updatedSessions
            };
          }
          
          return week;
        });
        
        return {
          ...prevProgram,
          weeks: updatedWeeks
        };
      });
      
      // If the deleted session was active, set another session as active
      if (activeSessionId === sessionId && weekWithSession) {
        // Find a new session in the same week to set as active
        const newActiveSessionId = weekWithSession.sessions.find(session => session.id !== sessionId)?.id;
        setActiveSessionId(newActiveSessionId || null);
      }
    } else {
      // Don't allow deleting the last session
      if (program.sessions.length <= 1) {
        toast({
          title: "Cannot Delete Session",
          description: "A program must have at least one session.",
          variant: "destructive"
        });
        return;
      }
      
      // Delete from the flat sessions array
      setProgram(prevProgram => ({
        ...prevProgram,
        sessions: prevProgram.sessions
          .filter(session => session.id !== sessionId)
          .map((session, index) => ({
            ...session,
            day: index + 1 // Update day numbers
          }))
      }));
      
      // If the deleted session was active, set another session as active
      if (activeSessionId === sessionId) {
        const newActiveSessionId = program.sessions.find(session => session.id !== sessionId)?.id;
        setActiveSessionId(newActiveSessionId || null);
      }
    }
  };

  return {
    addSession,
    updateSession,
    deleteSession,
    updateSessionName
  };
};
