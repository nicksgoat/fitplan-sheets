import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  WorkoutProgram, 
  WorkoutSession, 
  Exercise,
  Set, 
  Circuit,
  WorkoutSettings,
  WorkoutWeek
} from "@/types/workout"; 
import { createEmptyProgram, sampleProgram } from "@/utils/workout";
import { toast } from "@/components/ui/use-toast";

// Define the shape of our context
interface WorkoutContextType {
  program: WorkoutProgram;
  activeSessionId: string | null;
  activeWeekId: string | null;
  setActiveSessionId: (id: string) => void;
  setActiveWeekId: (id: string) => void;
  
  addSession: (name?: string, weekId?: string) => void;
  updateSession: (sessionId: string, updates: Partial<WorkoutSession>) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  
  addWeek: (name?: string) => void;
  updateWeek: (weekId: string, updates: Partial<WorkoutWeek>) => void;
  deleteWeek: (weekId: string) => void;
  updateWeekName: (weekId: string, name: string) => void;
  
  addExercise: (sessionId: string, exercise?: Partial<Exercise>) => void;
  updateExercise: (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  deleteExercise: (sessionId: string, exerciseId: string) => void;
  
  addSet: (sessionId: string, exerciseId: string, set?: Partial<Set>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  
  addCircuit: (sessionId: string, name: string) => void;
  updateCircuit: (sessionId: string, circuitId: string, updates: Partial<Circuit>) => void;
  deleteCircuit: (sessionId: string, circuitId: string) => void;
  
  addExerciseToCircuit: (sessionId: string, circuitId: string, exercise?: Partial<Exercise>) => void;
  
  updateProgramDetails: (updates: { name?: string; image?: string }) => void;
  updateSettings: (settings: WorkoutSettings) => void;
  
  resetProgram: () => void;
  loadSampleProgram: () => void;
  
  createCircuit: (sessionId: string) => void;
  createSuperset: (sessionId: string) => void;
  createEMOM: (sessionId: string) => void;
  createAMRAP: (sessionId: string) => void;
  createTabata: (sessionId: string) => void;
  
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

// Local storage key for workout library
const WORKOUT_LIBRARY_KEY = "workout_library";

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
  
  // Workout library state
  const [workoutLibrary, setWorkoutLibrary] = useState<Array<{
    id: string;
    name: string;
    type: "program" | "session";
    data: WorkoutProgram | WorkoutSession;
  }>>([]);
  
  // Load workout library from local storage
  useEffect(() => {
    const savedLibrary = localStorage.getItem(WORKOUT_LIBRARY_KEY);
    if (savedLibrary) {
      try {
        setWorkoutLibrary(JSON.parse(savedLibrary));
      } catch (error) {
        console.error("Failed to load workout library:", error);
      }
    }
  }, []);
  
  // Save workout library to local storage when it changes
  useEffect(() => {
    localStorage.setItem(WORKOUT_LIBRARY_KEY, JSON.stringify(workoutLibrary));
  }, [workoutLibrary]);

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
      let weekWithSession: WorkoutWeek | null = null;
      
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

  // Exercise operations
  const addExercise = (sessionId: string, exercise: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      ...exercise
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: [...session.exercises, newExercise]
          };
        }
        return session;
      })
    }));
  };
  
  const updateExercise = (sessionId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => 
              exercise.id === exerciseId ? { ...exercise, ...updates } : exercise
            )
          };
        }
        return session;
      })
    }));
  };
  
  const deleteExercise = (sessionId: string, exerciseId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          // Also remove any exercises that are part of a group if this is a group header
          const exerciseToDelete = session.exercises.find(e => e.id === exerciseId);
          
          if (exerciseToDelete?.isCircuit) {
            // If it's a circuit, also remove all exercises in the circuit
            return {
              ...session,
              exercises: session.exercises.filter(e => 
                e.id !== exerciseId && e.circuitId !== exerciseToDelete.circuitId
              ),
              circuits: session.circuits.filter(c => c.id !== exerciseToDelete.circuitId)
            };
          } else if (exerciseToDelete?.isGroup) {
            // If it's a group, also remove all exercises in the group
            return {
              ...session,
              exercises: session.exercises.filter(e => 
                e.id !== exerciseId && e.groupId !== exerciseId
              )
            };
          } else {
            return {
              ...session,
              exercises: session.exercises.filter(e => e.id !== exerciseId)
            };
          }
        }
        return session;
      })
    }));
  };

  // Set operations
  const addSet = (sessionId: string, exerciseId: string, set?: Partial<Set>) => {
    const newSet: Set = {
      id: uuidv4(),
      reps: set.reps || "",
      weight: set.weight || "",
      rpe: set.rpe || "",
      rest: set.rest || ""
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: [...exercise.sets, newSet]
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };
  
  const updateSet = (sessionId: string, exerciseId: string, setId: string, updates: Partial<Set>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.map(set => 
                    set.id === setId ? { ...set, ...updates } : set
                  )
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };
  
  const deleteSet = (sessionId: string, exerciseId: string, setId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  sets: exercise.sets.filter(set => set.id !== setId)
                };
              }
              return exercise;
            })
          };
        }
        return session;
      })
    }));
  };
  
  // Circuit operations
  const addCircuit = (sessionId: string, name: string) => {
    const circuitId = uuidv4();
    
    // Create a circuit header exercise
    const circuitHeaderExercise: Exercise = {
      id: uuidv4(),
      name: name || "Circuit",
      sets: [],
      notes: "",
      isCircuit: true,
      circuitId
    };
    
    // Create the circuit
    const newCircuit: Circuit = {
      id: circuitId,
      name: name || "Circuit",
      exercises: []
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercises: [...session.exercises, circuitHeaderExercise],
            circuits: [...session.circuits, newCircuit]
          };
        }
        return session;
      })
    }));
  };
  
  const createCircuit = (sessionId: string) => {
    addCircuit(sessionId, "Circuit");
  };
  
  const createSuperset = (sessionId: string) => {
    addCircuit(sessionId, "Superset");
  };
  
  const createEMOM = (sessionId: string) => {
    addCircuit(sessionId, "EMOM");
  };
  
  const createAMRAP = (sessionId: string) => {
    addCircuit(sessionId, "AMRAP");
  };
  
  const createTabata = (sessionId: string) => {
    addCircuit(sessionId, "Tabata");
  };
  
  const updateCircuit = (sessionId: string, circuitId: string, updates: Partial<Circuit>) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          // Update the circuit
          const updatedCircuits = session.circuits.map(circuit => 
            circuit.id === circuitId ? { ...circuit, ...updates } : circuit
          );
          
          // Also update the circuit header exercise if name changed
          const updatedExercises = session.exercises.map(exercise => {
            if (exercise.isCircuit && exercise.circuitId === circuitId && updates.name) {
              return { ...exercise, name: updates.name };
            }
            return exercise;
          });
          
          return {
            ...session,
            exercises: updatedExercises,
            circuits: updatedCircuits
          };
        }
        return session;
      })
    }));
  };
  
  const deleteCircuit = (sessionId: string, circuitId: string) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            // Remove circuit header and all exercises in the circuit
            exercises: session.exercises.filter(
              exercise => !(exercise.isCircuit && exercise.circuitId === circuitId) 
                && !(exercise.isInCircuit && exercise.circuitId === circuitId)
            ),
            // Remove the circuit
            circuits: session.circuits.filter(circuit => circuit.id !== circuitId)
          };
        }
        return session;
      })
    }));
  };
  
  const addExerciseToCircuit = (sessionId: string, circuitId: string, exercise: Partial<Exercise> = {}) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: exercise.name || "New Exercise",
      sets: exercise.sets || [{ id: uuidv4(), reps: "", weight: "", rpe: "", rest: "" }],
      notes: exercise.notes || "",
      isInCircuit: true,
      circuitId,
      ...exercise
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: prevProgram.sessions.map(session => {
        if (session.id === sessionId) {
          // Find the circuit to update its exercises array
          const updatedCircuits = session.circuits.map(circuit => {
            if (circuit.id === circuitId) {
              return {
                ...circuit,
                exercises: [...circuit.exercises, newExercise.id]
              };
            }
            return circuit;
          });
          
          // Find the circuit header exercise to place the new exercise after it
          const circuitHeaderIndex = session.exercises.findIndex(
            e => e.isCircuit && e.circuitId === circuitId
          );
          
          if (circuitHeaderIndex !== -1) {
            // Find the right position to insert the new exercise (after other circuit exercises)
            let insertIndex = circuitHeaderIndex + 1;
            while (
              insertIndex < session.exercises.length && 
              session.exercises[insertIndex].isInCircuit && 
              session.exercises[insertIndex].circuitId === circuitId
            ) {
              insertIndex++;
            }
            
            const updatedExercises = [
              ...session.exercises.slice(0, insertIndex),
              newExercise,
              ...session.exercises.slice(insertIndex)
            ];
            
            return {
              ...session,
              exercises: updatedExercises,
              circuits: updatedCircuits
            };
          }
          
          // Fallback if header not found
          return {
            ...session,
            exercises: [...session.exercises, newExercise],
            circuits: updatedCircuits
          };
        }
        return session;
      })
    }));
  };

  // Add the updateSettings function
  const updateSettings = (settings: WorkoutSettings) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      settings
    }));
  };

  // Update program details
  const updateProgramDetails = (updates: { name?: string; image?: string }) => {
    setProgram(prevProgram => ({
      ...prevProgram,
      ...updates
    }));
  };

  // Library operations
  const saveToLibrary = (type: "program" | "session", id?: string) => {
    if (type === "program") {
      // Save current program to library
      const newLibraryItem = {
        id: uuidv4(),
        name: program.name,
        type: "program" as const,
        data: { ...program }
      };
      
      setWorkoutLibrary(prev => [...prev, newLibraryItem]);
      toast({
        title: "Program Saved",
        description: `"${program.name}" has been added to your library.`
      });
    } else if (type === "session") {
      // Save specific session to library
      const sessionId = id || activeSessionId;
      if (!sessionId) return;
      
      const session = program.sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      const newLibraryItem = {
        id: uuidv4(),
        name: session.name,
        type: "session" as const,
        data: { ...session }
      };
      
      setWorkoutLibrary(prev => [...prev, newLibraryItem]);
      toast({
        title: "Session Saved",
        description: `"${session.name}" has been added to your library.`
      });
    }
  };
  
  const importSession = (sessionToImport: WorkoutSession) => {
    // Create a copy of the session with new IDs to avoid conflicts
    const newSession: WorkoutSession = {
      ...sessionToImport,
      id: uuidv4(),
      day: program.sessions.length + 1,
      exercises: sessionToImport.exercises.map(exercise => ({
        ...exercise,
        id: uuidv4(),
        sets: exercise.sets.map(set => ({
          ...set,
          id: uuidv4()
        }))
      })),
      circuits: sessionToImport.circuits.map(circuit => ({
        ...circuit,
        id: uuidv4()
      }))
    };
    
    setProgram(prevProgram => ({
      ...prevProgram,
      sessions: [...prevProgram.sessions, newSession]
    }));
    
    setActiveSessionId(newSession.id);
    
    toast({
      title: "Session Imported",
      description: `"${newSession.name}" has been added to your program.`
    });
  };
  
  const importProgram = (programToImport: WorkoutProgram) => {
    // Create a copy of the program with new IDs to avoid conflicts
    const newProgram: WorkoutProgram = {
      ...programToImport,
      id: uuidv4(),
      sessions: programToImport.sessions.map((session, index) => ({
        ...session,
        id: uuidv4(),
        day: index + 1,
        exercises: session.exercises.map(exercise => ({
          ...exercise,
          id: uuidv4(),
          sets: exercise.sets.map(set => ({
            ...set,
            id: uuidv4()
          }))
        })),
        circuits: session.circuits.map(circuit => ({
          ...circuit,
          id: uuidv4()
        }))
      }))
    };
    
    setProgram(newProgram);
    
    if (newProgram.sessions.length > 0) {
      setActiveSessionId(newProgram.sessions[0].id);
    }
    
    toast({
      title: "Program Imported",
      description: `"${newProgram.name}" has been loaded.`
    });
  };

  // Provide the context value
  const contextValue: WorkoutContextType = {
    program,
    activeSessionId,
    activeWeekId,
    setActiveSessionId,
    setActiveWeekId,
    
    addSession,
    updateSession,
    deleteSession,
    updateSessionName,
    
    addWeek,
    updateWeek,
    deleteWeek,
    updateWeekName,
    
    addExercise,
    updateExercise,
    deleteExercise,
    
    addSet,
    updateSet,
    deleteSet,
    
    addCircuit,
    updateCircuit,
    deleteCircuit,
    
    addExerciseToCircuit,
    
    updateProgramDetails,
    updateSettings,
    
    resetProgram,
    loadSampleProgram,
    
    createCircuit,
    createSuperset,
    createEMOM,
    createAMRAP,
    createTabata,
    
    workoutLibrary,
    saveToLibrary,
    importSession,
    importProgram
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
